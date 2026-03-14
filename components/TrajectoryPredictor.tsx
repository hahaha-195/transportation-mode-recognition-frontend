'use client';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBullseye, faClock, faPercent, faRoad, faMapMarkerAlt, 
  faPlay, faStop, faDownload, faEdit, faSyncAlt 
} from '@fortawesome/free-solid-svg-icons';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { motion } from 'framer-motion'; // 动效库

// 引入地图（以高德地图为例，需先在public/index.html引入高德SDK）
declare const AMap: any;

// 类型定义
interface TrajectoryPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

interface ExampleTrajectory {
  id: number;
  name: string;
  type: string; // 标注轨迹类型（用于对比）
  trajectory: TrajectoryPoint[];
}

interface PredictionResult {
  predictedLabel: string;
  confidence: number;
  inferenceTime: number;
  probability: Record<string, number>;
}

// 模型准确率数据（复用原有AccuracyChart的核心数据）
const MODEL_ACCURACY_DATA = [
  { name: 'Exp1 (仅轨迹)', accuracy: 69.6, fill: '#8884d8' },
  { name: 'Exp2 (轨迹+基础KG)', accuracy: 79.49, fill: '#4f46e5' },
  { name: 'Exp3 (轨迹+增强KG)', accuracy: 78.2, fill: '#7c3aed' },
  { name: 'Baseline (传统ML)', accuracy: 65.3, fill: '#94a3b8' },
];

// 示例轨迹数据（丰富化）
const EXAMPLE_TRAJECTORIES: ExampleTrajectory[] = [
  {
    id: 1,
    name: '公交轨迹（北京中关村）',
    type: '公交',
    trajectory: [
      { lat: 39.984702, lng: 116.318417, timestamp: 0 },
      { lat: 39.984683, lng: 116.318450, timestamp: 5 },
      { lat: 39.984661, lng: 116.318467, timestamp: 10 },
      { lat: 39.984632, lng: 116.318489, timestamp: 15 },
      { lat: 39.984601, lng: 116.318512, timestamp: 20 },
      { lat: 39.984570, lng: 116.318535, timestamp: 25 },
    ]
  },
  {
    id: 2,
    name: '步行轨迹（北京天安门）',
    type: '步行',
    trajectory: [
      { lat: 39.978805, lng: 116.305497, timestamp: 0 },
      { lat: 39.978812, lng: 116.305589, timestamp: 3 },
      { lat: 39.978821, lng: 116.305678, timestamp: 6 },
      { lat: 39.978835, lng: 116.305765, timestamp: 9 },
      { lat: 39.978850, lng: 116.305852, timestamp: 12 },
    ]
  },
  {
    id: 3,
    name: '地铁轨迹（上海陆家嘴）',
    type: '地铁',
    trajectory: [
      { lat: 31.230416, lng: 121.507604, timestamp: 0 },
      { lat: 31.230432, lng: 121.507812, timestamp: 8 },
      { lat: 31.230450, lng: 121.508020, timestamp: 16 },
      { lat: 31.230468, lng: 121.508228, timestamp: 24 },
    ]
  },
  {
    id: 4,
    name: '私家车轨迹（广州天河）',
    type: '私家车',
    trajectory: [
      { lat: 23.129110, lng: 113.324520, timestamp: 0 },
      { lat: 23.129230, lng: 113.324780, timestamp: 4 },
      { lat: 23.129350, lng: 113.325040, timestamp: 8 },
      { lat: 23.129470, lng: 113.325300, timestamp: 12 },
      { lat: 23.129590, lng: 113.325560, timestamp: 16 },
    ]
  },
];

// 配色方案（统一视觉风格）
const COLORS = ['#4f46e5', '#7c3aed', '#ec4899', '#f97316', '#10b981', '#3b82f6'];
const PROB_LABELS = ['步行', '骑行', '公交', '地铁', '私家车', '网约车'];

export default function TrajectoryPredictor() {
  // 核心状态
  const [selectedTraj, setSelectedTraj] = useState<ExampleTrajectory | null>(null);
  const [predResult, setPredResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingTraj, setEditingTraj] = useState(false);
  const [customTraj, setCustomTraj] = useState<TrajectoryPoint[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // 初始化地图
  useEffect(() => {
    if (!mapRef.current || typeof AMap === 'undefined') return;
    
    // 初始化高德地图
    mapInstance.current = new AMap.Map(mapRef.current, {
      zoom: 16,
      center: [116.318417, 39.984702], // 默认北京
      resizeEnable: true,
    });

    // 加载地图插件
    AMap.plugin(['AMap.Marker', 'AMap.Polyline'], () => {});

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
      }
    };
  }, []);

  // 绘制轨迹到地图
  useEffect(() => {
    if (!mapInstance.current || !selectedTraj) return;
    
    // 清空地图
    mapInstance.current.clearMap();
    
    // 获取轨迹点坐标
    const points = selectedTraj.trajectory.map(p => [p.lng, p.lat]);
    if (points.length === 0) return;

    // 定位到轨迹中心
    mapInstance.current.setCenter(points[0]);

    // 绘制轨迹线（渐变）
    const polyline = new AMap.Polyline({
      path: points,
      strokeColor: '#4f46e5',
      strokeWeight: 6,
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
      lineJoin: 'round',
    });
    polyline.addTo(mapInstance.current);

    // 绘制轨迹点（带时间戳）
    selectedTraj.trajectory.forEach((point, index) => {
      const marker = new AMap.Marker({
        position: [point.lng, point.lat],
        title: `点${index+1} | 时间戳: ${point.timestamp}s`,
        icon: new AMap.Icon({
          size: new AMap.Size(20, 20),
          image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
          imageSize: new AMap.Size(20, 20),
        }),
      });
      marker.addTo(mapInstance.current);
    });
  }, [selectedTraj]);

  // 调用预测接口
  const handlePredict = async () => {
    if (!selectedTraj) return;
    setLoading(true);
    try {
      const res = await fetch('/api/exp2-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          trajectory: editingTraj ? customTraj : selectedTraj.trajectory 
        }),
      });
      const data = await res.json();

      if (data.success) {
        setPredResult({
          predictedLabel: data.predictedLabel,
          confidence: data.confidence,
          inferenceTime: data.inferenceTime,
          probability: data.probability,
        });
      } else {
        alert(`预测失败：${data.error}`);
      }
    } catch (err) {
      alert(`接口调用异常：${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 导出预测结果
  const exportResult = () => {
    if (!predResult || !selectedTraj) return;
    const result = {
      轨迹名称: selectedTraj.name,
      预测结果: predResult.predictedLabel,
      置信度: `${predResult.confidence}%`,
      推理耗时: `${predResult.inferenceTime}ms`,
      各方式概率: predResult.probability,
      轨迹数据: selectedTraj.trajectory,
    };
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTraj.name}_预测结果.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 重置轨迹编辑
  const resetCustomTraj = () => {
    if (selectedTraj) {
      setCustomTraj([...selectedTraj.trajectory]);
    }
  };

  // 转换图表数据
  const barChartData = predResult 
    ? Object.entries(predResult.probability).map(([name, value]) => ({ name, value }))
    : [];
  const pieChartData = predResult 
    ? PROB_LABELS.map(label => ({ 
        name: label, 
        value: predResult.probability[label] || 0 
      }))
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* 页面标题 */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Exp2 双输入 Bi-LSTM 轨迹识别系统
        </h1>
        <p className="text-gray-600">融合 GPS 轨迹 + 知识图谱(KG) | 准确率 79.49% | 推理耗时 ≈20ms/条</p>
      </motion.div>

      {/* 核心布局：左侧轨迹选择+地图，右侧预测+结果 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 左侧：轨迹选择 + 地图可视化 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-blue-600" />
            轨迹数据可视化
          </h2>

          {/* 轨迹选择器 */}
          <div className="mb-6">
            <p className="font-medium mb-3">选择示例轨迹：</p>
            <div className="flex flex-wrap gap-3 mb-4">
              {EXAMPLE_TRAJECTORIES.map(traj => (
                <motion.button
                  key={traj.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedTraj(traj);
                    setCustomTraj([...traj.trajectory]);
                    setEditingTraj(false);
                    setPredResult(null);
                  }}
                  className={`px-4 py-2 rounded text-sm ${
                    selectedTraj?.id === traj.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  {traj.name}
                </motion.button>
              ))}
            </div>

            {/* 轨迹编辑按钮 */}
            {selectedTraj && (
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setEditingTraj(!editingTraj)}
                  className="px-3 py-1 rounded bg-purple-100 text-purple-700 flex items-center text-sm"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-1" />
                  {editingTraj ? '退出编辑' : '编辑轨迹'}
                </button>
                {editingTraj && (
                  <button
                    onClick={resetCustomTraj}
                    className="px-3 py-1 rounded bg-gray-100 text-gray-700 flex items-center text-sm"
                  >
                    <FontAwesomeIcon icon={faSyncAlt} className="mr-1" />
                    重置轨迹
                  </button>
                )}
              </div>
            )}

            {/* 轨迹编辑区域（仅编辑模式显示） */}
            {editingTraj && selectedTraj && (
              <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                <p className="font-medium mb-2">编辑轨迹点（格式：lat,lng,timestamp）：</p>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {customTraj.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={`${point.lat},${point.lng},${point.timestamp}`}
                        onChange={(e) => {
                          const [lat, lng, timestamp] = e.target.value.split(',').map(Number);
                          if (!isNaN(lat) && !isNaN(lng) && !isNaN(timestamp)) {
                            const newTraj = [...customTraj];
                            newTraj[index] = { lat, lng, timestamp };
                            setCustomTraj(newTraj);
                          }
                        }}
                        className="flex-1 px-2 py-1 border rounded text-sm"
                      />
                      <button
                        onClick={() => {
                          const newTraj = [...customTraj];
                          newTraj.splice(index, 1);
                          setCustomTraj(newTraj);
                        }}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm"
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setCustomTraj([...customTraj, { lat: 0, lng: 0, timestamp: 0 }]);
                  }}
                  className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded text-sm"
                >
                  添加轨迹点
                </button>
              </div>
            )}
          </div>

          {/* 地图容器 */}
          {selectedTraj && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 400 }}
              transition={{ duration: 0.5 }}
              ref={mapRef}
              className="w-full h-[400px] rounded-lg border overflow-hidden"
            />
          )}
        </div>

        {/* 右侧：预测操作 + 结果展示 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FontAwesomeIcon icon={faBullseye} className="mr-2 text-green-600" />
            模型预测与结果
          </h2>

          {/* 预测按钮 */}
          {selectedTraj && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePredict}
              disabled={loading || (editingTraj && customTraj.length === 0)}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-medium mb-6 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  模型推理中...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlay} className="mr-2" />
                  执行 Exp2 模型预测
                </>
              )}
            </motion.button>
          )}

          {/* 预测结果卡片 */}
          {predResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="border rounded-xl p-5 mb-6 bg-gradient-to-br from-blue-50 to-purple-50"
            >
              {/* 核心指标看板 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                  <p className="text-sm text-gray-500 mb-1">预测结果</p>
                  <p className="text-xl font-bold text-blue-600">{predResult.predictedLabel}</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                  <p className="text-sm text-gray-500 mb-1">置信度</p>
                  <p className="text-xl font-bold text-green-600">{predResult.confidence}%</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                  <p className="text-sm text-gray-500 mb-1">推理耗时</p>
                  <p className="text-xl font-bold text-purple-600">{predResult.inferenceTime}ms</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                  <p className="text-sm text-gray-500 mb-1">模型版本</p>
                  <p className="text-xl font-bold text-orange-600">Exp2</p>
                </div>
              </div>

              {/* 导出按钮 */}
              <button
                onClick={exportResult}
                className="mb-6 px-4 py-2 bg-gray-100 text-gray-800 rounded flex items-center"
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                导出预测结果
              </button>

              {/* 概率分布可视化（双图表） */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 环形图 */}
                <div className="h-64">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 text-center">概率分布（环形图）</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, '概率']} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* 水平柱状图 */}
                <div className="h-64">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 text-center">概率分布（柱状图）</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="horizontal"
                      data={barChartData}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                      <XAxis type="number" domain={[0, 100]} unit="%" />
                      <YAxis type="category" dataKey="name" width={60} />
                      <Tooltip formatter={(value) => [`${value}%`, '概率']} />
                      <Bar 
                        dataKey="value" 
                        radius={[0, 4, 4, 0]}
                        fill="url(#colorGradient)"
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#4f46e5" />
                          <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* 模型准确率对比图表 */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-800 mb-3">模型准确率对比</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MODEL_ACCURACY_DATA}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis domain={[60, 80]} unit="%" />
                  <Tooltip formatter={(value) => [`${value}%`, '准确率']} />
                  <Bar 
                    dataKey="accuracy" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  >
                    {MODEL_ACCURACY_DATA.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.fill}
                        stroke={index === 1 ? '#1e40af' : 'none'} // 高亮Exp2
                        strokeWidth={index === 1 ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Exp2 模型相比基线提升 <span className="font-bold text-blue-600">9.89%</span> 准确率
            </p>
          </div>
        </div>
      </div>

      {/* 底部说明 */}
      <div className="text-center text-gray-500 text-sm mt-8">
        <p>© 2026 交通轨迹识别可视化系统 | Exp2 双输入 Bi-LSTM 模型 | 支持步行/骑行/公交/地铁/私家车/网约车识别</p>
      </div>
    </div>
  );
}
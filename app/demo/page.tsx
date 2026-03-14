'use client';

import { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  SelectItem,
  Spinner,
  Divider,
} from '@nextui-org/react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion, AnimatePresence } from 'framer-motion';

const models = [
  { id: 'exp1', name: 'Exp1 (仅轨迹)', accuracy: '69.60%' },
  { id: 'exp2', name: 'Exp2 (轨迹+基础KG)', accuracy: '79.49%' },
  { id: 'exp3', name: 'Exp3 (轨迹+增强KG)', accuracy: '78.25%' },
  { id: 'exp4', name: 'Exp4 (轨迹+KG+天气)', accuracy: '74.80%' },
  { id: 'exp5', name: 'Exp5 (弱监督约束)', accuracy: '64.01%' },
];

const exampleToLabel: Record<string, string> = {
  walk: 'Walk',
  bike: 'Bike',
  bus: 'Bus',
  car: 'Car & taxi',
  subway: 'Subway',
  train: 'Train',
};

const labelDisplay: Record<string, { icon: string; name: string }> = {
  Walk: { icon: '🚶', name: '步行' },
  Bike: { icon: '🚴', name: '骑车' },
  Bus: { icon: '🚌', name: '公交' },
  'Car & taxi': { icon: '🚗', name: '开车/打车' },
  Subway: { icon: '🚇', name: '地铁' },
  Train: { icon: '🚂', name: '火车' },
};

export default function DemoPage() {
  const [selectedModel, setSelectedModel] = useState('exp2');
  const [selectedExample, setSelectedExample] = useState<string>('walk');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ prediction: string; confidence: number; trueLabel: string } | null>(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    const trueLabel = exampleToLabel[selectedExample];
    try {
      const res = await fetch(`/api/random-prediction?exp=${selectedModel}&trueLabel=${trueLabel}`);
      if (!res.ok) throw new Error('预测请求失败');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <h1 className="text-4xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        <span>🎮</span> 在线预测演示
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：控制面板 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl bg-gray-900/80 backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all duration-300">
            <CardHeader className="text-xl font-semibold px-6 pt-6">
              <span>⚙️ 选择配置</span>
            </CardHeader>
            <Divider className="bg-white/10" />
            <CardBody className="space-y-6 p-6">
              <Select
                size="lg"
                label="选择模型"
                labelPlacement="outside"
                placeholder="请选择实验模型"
                selectedKeys={[selectedModel]}
                onChange={(e) => setSelectedModel(e.target.value)}
                startContent={<span className="text-xl">🧠</span>}
                classNames={{
                  trigger: 'bg-white/5 border-white/10 hover:bg-white/10 transition-colors',
                  label: 'text-gray-300 text-sm',
                  value: 'text-white',
                  listbox: 'bg-gray-900 border border-white/10 rounded-lg',
                  popoverContent: 'bg-gray-900 border border-white/10',
                }}
              >
                {models.map((m) => (
                  <SelectItem
                    key={m.id}
                    value={m.id}
                    textValue={m.name}
                    className="py-3 text-white hover:bg-primary/20"
                  >
                    {m.name} <span className="text-primary ml-2">({m.accuracy})</span>
                  </SelectItem>
                ))}
              </Select>

              <Select
                size="lg"
                label="选择示例轨迹"
                labelPlacement="outside"
                placeholder="请选择一条轨迹"
                selectedKeys={[selectedExample]}
                onChange={(e) => setSelectedExample(e.target.value)}
                startContent={<span className="text-xl">📍</span>}
                classNames={{
                  trigger: 'bg-white/5 border-white/10 hover:bg-white/10 transition-colors',
                  label: 'text-gray-300 text-sm',
                  value: 'text-white',
                  listbox: 'bg-gray-900 border border-white/10 rounded-lg',
                  popoverContent: 'bg-gray-900 border border-white/10',
                }}
              >
                <SelectItem key="walk" value="walk" textValue="步行 (早锻炼)" className="py-3">
                  🚶 步行 (早锻炼)
                </SelectItem>
                <SelectItem key="bike" value="bike" textValue="骑车 (通勤)" className="py-3">
                  🚴 骑车 (通勤)
                </SelectItem>
                <SelectItem key="bus" value="bus" textValue="公交 (上学)" className="py-3">
                  🚌 公交 (上学)
                </SelectItem>
                <SelectItem key="car" value="car" textValue="开车/打车 (出差)" className="py-3">
                  🚗 开车/打车 (出差)
                </SelectItem>
                <SelectItem key="subway" value="subway" textValue="地铁 (上班)" className="py-3">
                  🚇 地铁 (上班)
                </SelectItem>
                <SelectItem key="train" value="train" textValue="火车 (旅行)" className="py-3">
                  🚂 火车 (旅行)
                </SelectItem>
              </Select>

              <Button
                color="primary"
                size="lg"
                onPress={handlePredict}
                isLoading={loading}
                className="w-full font-medium py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
                startContent={!loading && <span>🔮</span>}
              >
                {loading ? '预测中' : '开始预测'}
              </Button>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardBody>
          </Card>
        </motion.div>

        {/* 右侧：预测结果 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl bg-gray-900/80 backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all duration-300 h-full">
            <CardHeader className="text-xl font-semibold px-6 pt-6">
              <span>📈 预测结果</span>
            </CardHeader>
            <Divider className="bg-white/10" />
            <CardBody className="flex flex-col items-center justify-center p-8 min-h-[400px]">
              {loading && <Spinner label="预测中..." size="lg" />}

              <AnimatePresence mode="wait">
                {!loading && !error && result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-sm space-y-6"
                  >
                    {/* 预测类别大图标 + 名称 */}
                    <div className="text-center">
                      <span className="text-8xl">{labelDisplay[result.prediction]?.icon || '❓'}</span>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">
                          {labelDisplay[result.prediction]?.name || result.prediction}
                        </span>
                      </div>
                      {result.prediction !== result.trueLabel && (
                        <p className="text-yellow-400 text-sm mt-1">
                          (真实类别：{labelDisplay[result.trueLabel]?.name || result.trueLabel})
                        </p>
                      )}
                    </div>

                    {/* 置信度环形进度条 */}
                    <div className="w-48 h-48 mx-auto relative">
                      <svg style={{ height: 0, width: 0 }}>
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <CircularProgressbar
                        value={result.confidence * 100}
                        text={`${(result.confidence * 100).toFixed(1)}%`}
                        styles={buildStyles({
                          textSize: '20px',
                          pathColor: 'url(#gradient)',
                          textColor: '#f8fafc',
                          trailColor: '#334155',
                          pathTransitionDuration: 0.5,
                        })}
                      />
                    </div>
                    <p className="text-center text-sm text-gray-400">模型置信度</p>

                    {/* 模型信息 */}
                    <div className="text-center text-xs text-gray-500 mt-4">
                      当前模型：{models.find(m => m.id === selectedModel)?.name}
                    </div>
                  </motion.div>
                )}

                {!loading && !error && !result && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-gray-400"
                  >
                    <span className="text-6xl block mb-4">👆</span>
                    <p>选择模型和示例轨迹后点击预测</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
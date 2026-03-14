"use client";

import { motion } from 'framer-motion';
import { AccuracyChart } from '@/components/AccuracyChart';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

// 原始实验数据（完全匹配你的项目）
const experiments = [
  { name: 'Exp1 (仅轨迹)', accuracy: 69.60 },
  { name: 'Exp2 (轨迹+基础KG)', accuracy: 79.49 },
  { name: 'Exp3 (轨迹+增强KG)', accuracy: 78.25 },
  { name: 'Exp4 (轨迹+KG+天气)', accuracy: 74.80 },
  { name: 'Exp5 (弱监督约束)', accuracy: 64.01 },
];

export default function Home() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-16 relative z-10">
      {/* Hero区（修复核心数据卡片拥挤问题） */}
      <motion.section variants={item} className="glass-card relative overflow-hidden p-10 md:p-16 text-center">
        {/* 交通轨迹SVG背景（保留） */}
        <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 1000 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 300Q250 200 500 300T1000 300" stroke="url(#heroGradient)" strokeWidth="2" strokeLinecap="round"/>
          <path d="M0 250Q250 150 500 250T1000 250" stroke="url(#heroGradient)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 5"/>
          <path d="M0 350Q250 450 500 350T1000 350" stroke="url(#heroGradient)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 5"/>
          <circle cx="100" cy="300" r="4" fill="#00f0ff">
            <animate attributeName="cx" values="100;900;100" dur="15s" repeatCount="indefinite"/>
          </circle>
          <circle cx="200" cy="250" r="3" fill="#0070f3">
            <animate attributeName="cx" values="200;800;200" dur="12s" repeatCount="indefinite"/>
          </circle>
          <circle cx="150" cy="350" r="3" fill="#00f0ff">
            <animate attributeName="cx" values="150;850;150" dur="18s" repeatCount="indefinite"/>
          </circle>
          <defs>
            <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0070f3"/>
              <stop offset="100%" stopColor="#00f0ff"/>
            </linearGradient>
          </defs>
        </svg>

        <div className="relative z-10">
          <motion.h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-neon">基于多源数据融合的</span>
            <br/>
            <span className="text-white drop-shadow-lg">交通方式识别系统</span>
          </motion.h1>
          <motion.p className="text-lg text-gray max-w-3xl mx-auto mb-10 leading-relaxed">
            融合 <span className="text-accent font-semibold text-neon/90">GPS轨迹</span>、
            <span className="text-primary font-semibold text-neon/90">知识图谱</span> 和 
            <span className="text-accent font-semibold text-neon/90">天气数据</span>，
            实现6种交通方式的高精度智能识别。
          </motion.p>

          {/* 核心数据卡片（修复拥挤：增大间距、加宽卡片、调整排版） */}
          <motion.div className="flex justify-center gap-12 md:gap-16 flex-wrap mt-8 px-4">
            {[
              { label: '最高准确率', value: '79.49%', color: 'from-primary to-accent' },
              { label: '识别类别', value: '6种', color: 'from-accent to-purple' },
              { label: '实验对比', value: '5组', color: 'from-purple to-primary' }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.05, y: -3 }} 
                className="text-center glass-card px-10 py-8 btn-neon min-w-[180px]" // 加宽卡片+增大内边距
              >
                <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent text-neon mb-3`}>
                  {stat.value}
                </div>
                <div className="text-base text-muted"> {stat.label}</div> {/* 调整字体大小+增加间距 */}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* 系统架构区（完整SVG） */}
      <motion.section variants={item}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
          <h2 className="text-3xl font-bold text-white text-neon">📐 系统架构</h2>
        </div>
        <div className="glass-card p-8">
          {/* 完整的多源数据融合架构SVG */}
          <svg className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl border border-white/10" viewBox="0 0 1000 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 背景 */}
            <rect width="1000" height="600" fill="rgba(15,23,42,0.8)" rx="16"/>
            {/* 标题 */}
            <text x="500" y="50" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">交通方式识别系统 - 多源数据融合架构</text>
            {/* 数据源层 */}
            <rect x="100" y="100" width="800" height="80" rx="8" fill="rgba(30,64,175,0.2)" stroke="rgba(30,64,175,0.5)" strokeWidth="1"/>
            <text x="500" y="145" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">数据源层</text>
            <text x="200" y="170" textAnchor="middle" fill="#94a3b8" fontSize="14">GPS轨迹数据</text>
            <text x="400" y="170" textAnchor="middle" fill="#94a3b8" fontSize="14">知识图谱(KG)</text>
            <text x="600" y="170" textAnchor="middle" fill="#94a3b8" fontSize="14">天气数据</text>
            <text x="800" y="170" textAnchor="middle" fill="#94a3b8" fontSize="14">时间/位置特征</text>
            {/* 数据融合层 */}
            <rect x="200" y="220" width="600" height="80" rx="8" fill="rgba(8,145,178,0.2)" stroke="rgba(8,145,178,0.5)" strokeWidth="1"/>
            <text x="500" y="265" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">数据融合层</text>
            <text x="500" y="290" textAnchor="middle" fill="#94a3b8" fontSize="14">特征融合 + 时空对齐 + 噪声过滤</text>
            {/* 模型层 */}
            <rect x="300" y="340" width="400" height="80" rx="8" fill="rgba(30,64,175,0.2)" stroke="rgba(30,64,175,0.5)" strokeWidth="1"/>
            <text x="500" y="385" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">模型层</text>
            <text x="500" y="410" textAnchor="middle" fill="#94a3b8" fontSize="14">深度学习模型 + 弱监督约束</text>
            {/* 输出层 */}
            <rect x="400" y="460" width="200" height="80" rx="8" fill="rgba(8,145,178,0.2)" stroke="rgba(8,145,178,0.5)" strokeWidth="1"/>
            <text x="500" y="505" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">输出层</text>
            <text x="500" y="530" textAnchor="middle" fill="#94a3b8" fontSize="14">交通方式识别结果</text>
            {/* 连接线 */}
            <path d="M500 180 L500 220" stroke="white" strokeWidth="1" strokeDasharray="2 2"/>
            <path d="M500 300 L500 340" stroke="white" strokeWidth="1" strokeDasharray="2 2"/>
            <path d="M500 420 L500 460" stroke="white" strokeWidth="1" strokeDasharray="2 2"/>
          </svg>
        </div>
      </motion.section>

      {/* 准确率对比区（数据正确+不溢出+无多余刻度） */}
      <motion.section variants={item}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-accent to-purple rounded-full" />
          <h2 className="text-3xl font-bold text-white text-neon">📊 五个实验准确率对比</h2>
        </div>
        <div className="glass-card p-8">
          <AccuracyChart data={experiments} />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-accent/20 btn-neon">
              <span className="text-accent font-semibold text-neon">
                ✨ Exp2（轨迹+基础KG）取得最佳准确率 <strong className="text-white text-lg">79.49%</strong>
              </span>
            </span>
          </motion.p>
        </div>
      </motion.section>
    </motion.div>
  );
}
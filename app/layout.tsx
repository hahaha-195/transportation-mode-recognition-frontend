"use client";

import './globals.css';
import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '700'] });

const navItems = [
  { href: '/', label: '首页' },
  { href: '/exp2', label: '最优模型' },
  { href: '/experiments', label: '所有实验' },
  { href: '/error-analysis', label: '错误分析' },
  { href: '/demo', label: '在线演示' },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <html lang="zh-CN" className="dark">
      <body className={inter.className}>
        {/* 恢复粒子运动背景 */}
        {isClient && (
          <div className="fixed inset-0 pointer-events-none z-0">
            {Array.from({ length: 25 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-[#00f0ff] opacity-80"
                initial={{ x: `${Math.random() * 100}vw`, y: `${Math.random() * 100}vh`, scale: 1.5 }}
                animate={{ 
                  x: `${Math.random() * 100}vw`, 
                  y: `${Math.random() * 100}vh`,
                  scale: [1.5, 2.5, 1.5],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: Math.random() * 25 + 10, repeat: Infinity, ease: "linear" }}
              />
            ))}
          </div>
        )}

        {/* 恢复炫酷导航栏 */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          className="sticky top-0 z-50 w-full py-6 px-8 md:px-20 lg:px-24"
          style={{
            background: 'linear-gradient(90deg, rgba(5, 10, 30, 0.98), rgba(10, 20, 60, 0.98))',
            backdropFilter: 'blur(30px)',
            borderBottom: '1px solid rgba(0, 240, 255, 0.5)',
            boxShadow: '0 0 40px rgba(0, 240, 255, 0.25), 0 6px 20px rgba(0, 0, 0, 0.4)',
            backgroundImage: 'linear-gradient(to bottom, transparent, transparent 95%, rgba(0, 240, 255, 0.3) 100%)'
          }}
        >
          <div className="max-w-[1800px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <svg width="68" height="68" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="url(#logoGradient)" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5"/>
                <path d="M12 26l2-6h12l2 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 26h20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 16h10v4h-10v-4z" fill="white" fillOpacity="1"/>
                <path d="M8 20l4-8h16l4 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2"/>
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0070f3"/>
                    <stop offset="100%" stopColor="#00f0ff"/>
                  </linearGradient>
                </defs>
              </svg>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white" style={{
                  textShadow: '0 0 15px rgba(0, 240, 255, 0.9), 0 0 30px rgba(0, 240, 255, 0.6)'
                }}>交通方式识别系统</h1>
                <p className="text-base text-[#00f0ff]/90 -mt-2">多源数据融合 · 智能识别</p>
              </div>
            </div>

            <div className="flex items-center gap-6 lg:gap-8">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ scale: 1.08, textShadow: '0 0 20px rgba(0, 240, 255, 1)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: '12px 20px',
                      color: isActive ? '#ffffff' : '#e2e8f0',
                      background: isActive 
                        ? 'linear-gradient(135deg, rgba(0, 112, 243, 0.4), rgba(0, 240, 255, 0.4))' 
                        : 'transparent',
                      border: isActive ? '1px solid rgba(0, 240, 255, 0.7)' : '1px solid transparent',
                      boxShadow: isActive 
                        ? '0 0 25px rgba(0, 240, 255, 0.6), inset 0 0 15px rgba(0, 240, 255, 0.3)' 
                        : 'none',
                      borderRadius: '16px',
                      letterSpacing: '1px',
                      fontSize: '18px',
                      fontWeight: 500
                    }}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-gradient-to-r from-[#0070f3] to-[#00f0ff] rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        animate={{ boxShadow: '0 0 15px rgba(0, 240, 255, 1)' }}
                      />
                    )}
                  </motion.a>
                );
              })}
            </div>
          </div>
        </motion.nav>

        <main className="container mx-auto px-6 py-16 max-w-[1800px] relative z-10">
          <div className="min-h-[70vh]">{children}</div>

          <AnimatePresence>
            {showBackToTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1, boxShadow: '0 0 25px rgba(0, 240, 255, 0.8)' }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToTop}
                className="fixed bottom-10 right-10 z-50 p-5 rounded-xl bg-gradient-to-r from-[#0070f3] to-[#00f0ff] text-white border border-[#00f0ff]/60"
                aria-label="返回顶部"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>

          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-20 pt-8 border-t border-[#00f0ff]/30 text-center"
          >
            <p className="text-[#e2e8f0] text-lg" style={{
              textShadow: '0 0 8px rgba(0, 240, 255, 0.5)'
            }}>© 2026 计算机设计大赛 · 交通方式识别系统</p>
          </motion.footer>
        </main>
      </body>
    </html>
  );
}
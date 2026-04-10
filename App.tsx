
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { HeroScene, QuantumComputerScene } from './components/QuantumScene';
import { SurfaceCodeDiagram, TransformerDecoderDiagram, PerformanceMetricDiagram } from './components/Diagrams';
import { ArrowDown, Menu, X, BookOpen, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { ArticleGenerator } from './components/ArticleGenerator';
import { GeneratedArticle } from './components/GeneratedArticle';
import { ArticleData, Language } from './types';

const TRANSLATIONS = {
  en: {
    engine: 'SIMPLE',
    create: 'Create Narrative',
    platform: 'Research Visualization Platform',
    heroTitle1: 'Transform Papers',
    heroTitle2: 'into Narratives',
    heroDesc: 'Upload your research articles and let AI craft an elegant, interactive experience that brings your science to life.',
    getStarted: 'Get Started Now',
    explore: 'Explore Examples',
    featured: 'Featured Narratives',
    featuredDesc: 'Discover how complex research is transformed into engaging visual stories.',
    yourResearch: 'Your Research Here',
    uploadDesc: 'Upload your article to generate a custom narrative experience.',
    uploadNow: 'Upload Now',
    viewNarrative: 'View Narrative',
    storytelling: 'Storytelling',
    scienceOf: 'The Science of',
    step1Title: 'Contextual Analysis',
    step1Desc: 'Gemini analyzes your paper to identify core themes, methodologies, and key results.',
    step2Title: 'Visual Mapping',
    step2Desc: 'The engine automatically suggests the best interactive diagrams to represent complex data.',
    step3Title: 'Elegant Rendering',
    step3Desc: 'A bespoke, high-end editorial website is generated, ready for sharing with the world.',
    rights: 'All rights reserved.'
  },
  zh: {
    engine: '简报',
    create: '创建叙事',
    platform: '科研可视化平台',
    heroTitle1: '将论文转化为',
    heroTitle2: '生动的叙事',
    heroDesc: '上传您的研究文章，让人工智能打造优雅、互动的体验，让您的科学研究焕发生机。',
    getStarted: '立即开始',
    explore: '探索案例',
    featured: '精选叙事',
    featuredDesc: '探索复杂的研究如何转化为引人入胜的视觉故事。',
    yourResearch: '您的研究在此',
    uploadDesc: '上传您的文章以生成定制的叙事体验。',
    uploadNow: '立即上传',
    viewNarrative: '查看叙事',
    storytelling: '叙事艺术',
    scienceOf: '科学的',
    step1Title: '上下文分析',
    step1Desc: 'Gemini 分析您的论文，识别核心主题、方法论和关键结果。',
    step2Title: '视觉映射',
    step2Desc: '引擎自动建议最佳的交互式图表来表示复杂的数据。',
    step3Title: '优雅呈现',
    step3Desc: '生成定制的高端编辑网站，随时可以与世界分享。',
    rights: '版权所有。'
  }
};

const ALPHA_QUBIT_DATA_EN: ArticleData = {
  id: 'alphaqubit-2024',
  title: 'AlphaQubit',
  subtitle: 'AI for Quantum Error Correction',
  heroDescription: 'A recurrent, transformer-based neural network that learns to decode the surface code with unprecedented accuracy.',
  date: 'Nature • Nov 2024',
  introduction: {
    title: 'The Noise Barrier',
    content: 'Building a large-scale quantum computer requires correcting the errors that inevitably arise in physical systems. The state of the art is the surface code, which encodes information redundantly across many physical qubits. However, interpreting the noisy signals from these codes—a task called "decoding"—is a massive challenge. Complex noise effects like cross-talk and leakage confuse standard algorithms. AlphaQubit uses machine learning to learn these complex error patterns directly from the quantum processor, achieving accuracy far beyond human-designed algorithms.'
  },
  sections: [
    {
      id: 'science',
      title: 'The Surface Code',
      content: 'In a surface code, "Data Qubits" hold the quantum information, while "Stabilizer Qubits" interspersed between them act as watchdogs. They measure parity checks (X and Z type) to detect errors without destroying the quantum state. When a data qubit flips, adjacent stabilizers light up. The pattern of these lights is the "syndrome." The decoder\'s job is to look at the syndrome and guess which data qubit flipped.',
      type: 'diagram',
      diagramType: 'surface-code'
    },
    {
      id: 'innovation',
      title: 'Neural Decoding',
      content: 'Standard decoders assume simple, independent errors. Real hardware is messier. AlphaQubit treats decoding as a sequence prediction problem, using a Recurrent Transformer architecture. It ingests the history of stabilizer measurements and uses "soft" analog information—probabilities rather than just binary 0s and 1s—to make highly informed predictions about logical errors.',
      type: 'diagram',
      diagramType: 'transformer'
    },
    {
      id: 'results',
      title: 'Outperforming the Standard',
      content: 'AlphaQubit was tested on Google\'s Sycamore processor and accurate simulations. It consistently outperforms "Minimum-Weight Perfect Matching" (MWPM), the industry standard, effectively making the quantum computer appear cleaner than it actually is.',
      type: 'diagram',
      diagramType: 'metrics'
    }
  ],
  authors: [
    { name: 'Johannes Bausch', role: 'Research Scientist', institution: 'Google DeepMind' },
    { name: 'Andrew W. Senior', role: 'Principal Scientist', institution: 'Google DeepMind' },
    { name: 'Michael Newman', role: 'Quantum Researcher', institution: 'Google Quantum AI' }
  ],
  sidebarSections: [
    { id: 'science', label: 'Surface Code' },
    { id: 'innovation', label: 'Neural Decoding' },
    { id: 'results', label: 'Performance' }
  ]
};

const ALPHA_QUBIT_DATA_ZH: ArticleData = {
  id: 'alphaqubit-2024',
  title: 'AlphaQubit',
  subtitle: '用于量子纠错的人工智能',
  heroDescription: '一种基于循环 Transformer 的神经网络，能够以史无前例的准确度学习解码表面码。',
  date: 'Nature • 2024年11月',
  introduction: {
    title: '噪声屏障',
    content: '构建大规模量子计算机需要纠正物理系统中不可避免产生的错误。目前最先进的技术是表面码，它在许多物理量子位上冗余地编码信息。然而，解释来自这些代码的噪声信号（一项称为“解码”的任务）是一项巨大的挑战。串扰和泄漏等复杂的噪声效应会混淆标准算法。AlphaQubit 使用机器学习直接从量子处理器中学习这些复杂的错误模式，实现的准确度远超人工设计的算法。'
  },
  sections: [
    {
      id: 'science',
      title: '表面码',
      content: '在表面码中，“数据量子位”持有量子信息，而散布在它们之间的“稳定器量子位”充当监视器。它们测量奇偶校验（X 型和 Z 型）以检测错误而不破坏量子状态。当一个数据量子位翻转时，相邻的稳定器就会亮起。这些灯光的模式就是“校正子”。解码器的任务就是观察校正子并猜测是哪个数据量子位发生了翻转。',
      type: 'diagram',
      diagramType: 'surface-code'
    },
    {
      id: 'innovation',
      title: '神经解码',
      content: '标准解码器假设错误是简单且独立的。实际硬件则更为复杂。AlphaQubit 将解码视为一个序列预测问题，使用循环 Transformer 架构。它摄取稳定器测量的历史记录，并使用“软”模拟信息（概率而非仅仅是二进制的 0 和 1）来对逻辑错误做出高度知情的预测。',
      type: 'diagram',
      diagramType: 'transformer'
    },
    {
      id: 'results',
      title: '超越标准',
      content: 'AlphaQubit 在 Google 的 Sycamore 处理器和精确模拟中进行了测试。它始终优于行业标准“最小权重完美匹配”(MWPM)，有效地使量子计算机看起来比实际更整洁。',
      type: 'diagram',
      diagramType: 'metrics'
    }
  ],
  authors: [
    { name: 'Johannes Bausch', role: '研究科学家', institution: 'Google DeepMind' },
    { name: 'Andrew W. Senior', role: '首席科学家', institution: 'Google DeepMind' },
    { name: 'Michael Newman', role: '量子研究员', institution: 'Google Quantum AI' }
  ],
  sidebarSections: [
    { id: 'science', label: '表面码' },
    { id: 'innovation', label: '神经解码' },
    { id: 'results', label: '性能表现' }
  ]
};

const App: React.FC = () => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<ArticleData | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  const t = TRANSLATIONS[language];

  const handleArticleGenerated = (data: ArticleData) => {
    setCurrentArticle(data);
    setShowGenerator(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentArticle) {
    return <GeneratedArticle data={currentArticle} onBack={() => setCurrentArticle(null)} language={language} />;
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-stone-800 selection:bg-nobel-gold selection:text-white">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-6 bg-[#F9F8F4]/80 backdrop-blur-md border-b border-stone-100">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-nobel-gold rounded-full flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm pb-1">α</div>
            <span className="font-serif font-bold text-lg tracking-wide text-stone-900">
              {language === 'zh' ? '论文' : 'PAPER'} <span className="font-normal text-stone-500">{t.engine}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-stone-100 rounded-full p-1 border border-stone-200">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${language === 'en' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('zh')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${language === 'zh' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
              >
                中文
              </button>
            </div>

            <button 
              onClick={() => setShowGenerator(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-bold text-sm tracking-widest uppercase"
            >
              <Plus size={18} /> {t.create}
            </button>
          </div>
        </div>
      </nav>

      {showGenerator && (
        <ArticleGenerator 
          onGenerated={handleArticleGenerated} 
          onClose={() => setShowGenerator(false)} 
          language={language}
        />
      )}

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-6 px-4 py-1.5 bg-nobel-gold/10 text-nobel-gold text-xs tracking-[0.2em] uppercase font-bold rounded-full border border-nobel-gold/20"
          >
            {t.platform}
          </motion.div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-[1.1] md:leading-[1] mb-8 text-stone-900 max-w-5xl mx-auto">
            {t.heroTitle1} <br/><span className="italic font-normal text-stone-500">{t.heroTitle2}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-stone-600 font-light leading-relaxed mb-12">
            {t.heroDesc}
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button 
              onClick={() => setShowGenerator(true)}
              className="px-8 py-4 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-stone-800 transition-all shadow-xl"
            >
              {t.getStarted}
            </button>
            <a 
              href="#examples"
              className="px-8 py-4 bg-white text-stone-900 border border-stone-200 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-stone-50 transition-all"
            >
              {t.explore}
            </a>
          </div>
        </div>

        {/* Decorative Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <HeroScene />
        </div>
      </header>

      <main className="container mx-auto px-6 pb-32">
        {/* Examples Section */}
        <section id="examples" className="pt-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="font-serif text-4xl text-stone-900 mb-4">{t.featured}</h2>
              <p className="text-stone-500 max-w-md">{t.featuredDesc}</p>
            </div>
            <div className="h-px flex-1 bg-stone-100 mx-8 hidden md:block"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AlphaQubit Example */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-2xl transition-all duration-500"
              onClick={() => setCurrentArticle(language === 'zh' ? ALPHA_QUBIT_DATA_ZH : ALPHA_QUBIT_DATA_EN)}
            >
              <div className="aspect-[4/3] bg-stone-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity">
                  <HeroScene />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-nobel-gold mb-2">{language === 'zh' ? '量子计算' : 'Quantum Computing'}</div>
                  <h3 className="font-serif text-2xl text-white">AlphaQubit</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-stone-600 text-sm leading-relaxed mb-6">
                  {language === 'zh' ? '可视化 Google DeepMind 在使用循环 Transformer 进行量子纠错方面的突破。' : "Visualizing Google DeepMind's breakthrough in quantum error correction using recurrent transformers."}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{language === 'zh' ? 'Nature 2024年' : 'Nature 2024'}</span>
                  <span className="text-nobel-gold font-bold text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    {t.viewNarrative} →
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Placeholder for more examples */}
            <div className="bg-stone-50 rounded-2xl border border-dashed border-stone-200 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-300 mb-4">
                <Plus size={32} />
              </div>
              <h3 className="font-serif text-xl text-stone-400 mb-2">{t.yourResearch}</h3>
              <p className="text-stone-400 text-sm mb-6">{t.uploadDesc}</p>
              <button 
                onClick={() => setShowGenerator(true)}
                className="text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors"
              >
                {t.uploadNow}
              </button>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-40 py-20 bg-stone-900 rounded-[3rem] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
             <QuantumComputerScene />
          </div>
          
          <div className="container mx-auto px-12 relative z-10">
            <div className="max-w-xl">
              <h2 className="font-serif text-5xl mb-8">{t.scienceOf} <br/><span className="text-nobel-gold italic">{t.storytelling}</span></h2>
              <div className="space-y-12">
                <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-full bg-nobel-gold/20 border border-nobel-gold/40 flex items-center justify-center text-nobel-gold font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-serif text-xl mb-2">{t.step1Title}</h4>
                    <p className="text-stone-400 leading-relaxed">{t.step1Desc}</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-full bg-nobel-gold/20 border border-nobel-gold/40 flex items-center justify-center text-nobel-gold font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-serif text-xl mb-2">{t.step2Title}</h4>
                    <p className="text-stone-400 leading-relaxed">{t.step2Desc}</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-full bg-nobel-gold/20 border border-nobel-gold/40 flex items-center justify-center text-nobel-gold font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-serif text-xl mb-2">{t.step3Title}</h4>
                    <p className="text-stone-400 leading-relaxed">{t.step3Desc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-stone-100">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-8 h-8 bg-nobel-gold rounded-full flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm pb-1">α</div>
            <span className="font-serif font-bold text-lg tracking-wide text-stone-900">{language === 'zh' ? '论文简报' : 'PAPER SIMPLE'}</span>
          </div>
          <p className="text-stone-400 text-sm">© 2026 {language === 'zh' ? '论文简报' : 'Paper Simple'}. {t.rights}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

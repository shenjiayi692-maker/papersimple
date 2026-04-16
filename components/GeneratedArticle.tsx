import React, { useEffect, useState, useRef } from 'react';
import { ArticleData, Language } from '../types';
import { HeroScene } from './QuantumScene';
import { SurfaceCodeDiagram, TransformerDecoderDiagram, PerformanceMetricDiagram, GenericChartDiagram, GenericFlowDiagram } from './Diagrams';
import { ArrowDown, BookOpen, ChevronLeft, FileText, Menu, X, Download, Share2, Image as ImageIcon, ExternalLink } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';

const TRANSLATIONS = {
  en: {
    back: 'Back to Library',
    export: 'Export & Share',
    exportPdf: 'PDF',
    exportImage: 'IMAGE',
    researchTeam: 'Research Team',
    viewScholar: 'View Scholar Profile',
    narrative: 'PAPER',
    researchEngine: 'Simple',
    rights: 'All rights reserved.',
    summary: 'Summary',
    interactiveDiagram: 'Interactive Diagram',
    readyToShare: 'Share this Narrative',
    shareDesc: 'Download a high-resolution PDF or image version of this research narrative to share with your colleagues or on social media.',
    downloadPdf: 'Download PDF',
    saveImage: 'Save as Image',
    discover: 'DISCOVER',
    introduction: 'Introduction',
    figure: 'Figure',
    generatedBy: 'Generated Narrative • Powered by Gemini',
    home: 'Return to Home'
  },
  zh: {
    back: '返回列表',
    export: '导出与分享',
    exportPdf: 'PDF 文档',
    exportImage: '高清图片',
    researchTeam: '核心研究团队',
    viewScholar: '查看学者主页',
    narrative: '学术论文',
    researchEngine: '科学叙事',
    rights: '版权所有。',
    summary: '摘要',
    interactiveDiagram: '交互式可视化图表',
    readyToShare: '分享研究成果',
    shareDesc: '下载高分辨率 PDF 或图片版本，与同行分享或在社交媒体展示您的研究成果。',
    downloadPdf: '下载 PDF',
    saveImage: '保存为图片',
    discover: '探索',
    introduction: '引言',
    figure: '图',
    generatedBy: '智能叙事生成 • 由 Gemini 提供技术支持',
    home: '返回首页'
  }
};

interface GeneratedArticleProps {
  data: ArticleData;
  onBack: () => void;
  language: Language;
}

const AuthorCard = ({ name, role, institution, scholarUrl, delay, language }: { name: string, role: string, institution: string, scholarUrl?: string, delay: string, language: Language }) => {
  const t = TRANSLATIONS[language];
  return (
    <a 
      href={scholarUrl || `https://scholar.google.com/scholar?q=${encodeURIComponent(name)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col group animate-fade-in-up items-center p-8 bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-xs hover:border-nobel-gold/50 cursor-pointer" 
      style={{ animationDelay: delay }}
    >
      <h3 className="font-serif text-2xl text-stone-900 text-center mb-1 group-hover:text-nobel-gold transition-colors">{name}</h3>
      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em] mb-3 text-center">{role}</p>
      <div className="w-12 h-0.5 bg-nobel-gold mb-4 opacity-60 group-hover:w-20 transition-all duration-300"></div>
      <p className="text-xs text-stone-500 font-medium tracking-wide text-center leading-relaxed">{institution}</p>
      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-nobel-gold font-bold tracking-tighter uppercase flex items-center gap-1">
        {t.viewScholar} <ExternalLink size={10} />
      </div>
    </a>
  );
};

export const GeneratedArticle: React.FC<GeneratedArticleProps> = ({ data, onBack, language }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('introduction');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      const sections = ['introduction', ...data.sections.map(s => s.id), 'authors'];
      for (const id of sections) {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [data.sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setSidebarOpen(false);
    }
  };

  const handleExportPDF = async () => {
    if (!articleRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(articleRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#F9F8F4'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data.title.replace(/\s+/g, '_')}_Narrative.pdf`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleExportImage = async () => {
    if (!articleRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(articleRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#F9F8F4'
      });
      const link = document.createElement('a');
      link.download = `${data.title.replace(/\s+/g, '_')}_Narrative.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const renderDiagram = (type?: string, vizData?: any) => {
    switch (type) {
      case 'surface-code': return <SurfaceCodeDiagram />;
      case 'transformer': return <TransformerDecoderDiagram />;
      case 'metrics': return <PerformanceMetricDiagram />;
      case 'generic-chart': return <GenericChartDiagram data={vizData} />;
      case 'generic-flow': return <GenericFlowDiagram data={vizData} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-stone-800 selection:bg-nobel-gold selection:text-white flex">
      
      {/* Sidebar Navigation */}
      <aside className={`fixed left-0 top-0 h-full bg-white border-r border-stone-100 z-[60] transition-all duration-300 ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-72'}`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-nobel-gold rounded-full flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm pb-1">α</div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-sm tracking-wide text-stone-900 leading-none">{t.narrative}</span>
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">{t.researchEngine}</span>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <button 
              onClick={() => scrollToSection('introduction')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeSection === 'introduction' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
            >
              {t.introduction}
            </button>
            {data.sidebarSections.map((section) => (
              <button 
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeSection === section.id ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
              >
                {section.label}
              </button>
            ))}
            <button 
              onClick={() => scrollToSection('authors')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeSection === 'authors' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
            >
              {t.researchTeam}
            </button>
          </nav>

          <div className="mt-8 pt-8 border-t border-stone-100 space-y-4">
            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-2">{t.export}</div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleExportPDF}
                disabled={exporting}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 hover:border-nobel-gold hover:bg-nobel-gold/5 transition-all group disabled:opacity-50"
              >
                <Download size={18} className="text-stone-400 group-hover:text-nobel-gold mb-1" />
                <span className="text-[10px] font-bold text-stone-500 group-hover:text-stone-900">{t.exportPdf}</span>
              </button>
              <button 
                onClick={handleExportImage}
                disabled={exporting}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 hover:border-nobel-gold hover:bg-nobel-gold/5 transition-all group disabled:opacity-50"
              >
                <ImageIcon size={18} className="text-stone-400 group-hover:text-nobel-gold mb-1" />
                <span className="text-[10px] font-bold text-stone-500 group-hover:text-stone-900">{t.exportImage}</span>
              </button>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-stone-100">
             <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors">
                <ChevronLeft size={14} /> {t.back}
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72" ref={articleRef}>
        {/* Mobile Header */}
        <nav className={`fixed top-0 left-0 right-0 z-50 lg:hidden transition-all duration-300 ${scrolled ? 'bg-[#F9F8F4]/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
          <div className="container mx-auto px-6 flex justify-between items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-white rounded-full shadow-sm border border-stone-200">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-nobel-gold rounded-full flex items-center justify-center text-white font-serif font-bold text-lg pb-1">α</div>
            </div>
            <div className="w-10"></div>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="relative h-screen flex items-center justify-center overflow-hidden">
          <HeroScene />
          <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(249,248,244,0.92)_0%,rgba(249,248,244,0.6)_50%,rgba(249,248,244,0.3)_100%)]" />

          <div className="relative z-10 container mx-auto px-6 text-center">
            <div className="inline-block mb-4 px-3 py-1 border border-nobel-gold text-nobel-gold text-xs tracking-[0.2em] uppercase font-bold rounded-full backdrop-blur-sm bg-white/30">
              {data.date}
            </div>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-medium leading-tight md:leading-[1.1] mb-8 text-stone-900 drop-shadow-sm break-words max-w-4xl mx-auto">
              {data.title} <br/><span className="italic font-normal text-stone-600 text-xl md:text-3xl block mt-4 leading-relaxed">{data.subtitle}</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-stone-700 font-light leading-relaxed mb-12">
              {data.heroDescription}
            </p>
            
            <div className="flex justify-center">
               <div className="group flex flex-col items-center gap-2 text-sm font-medium text-stone-500">
                  <span>{t.discover}</span>
                  <span className="p-2 border border-stone-300 rounded-full bg-white/50">
                      <ArrowDown size={16} />
                  </span>
               </div>
            </div>
          </div>
        </header>

        <main>
          {/* Introduction */}
          <section id="introduction" className="py-24 bg-white">
            <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
              <div className="md:col-span-4">
                <div className="inline-block mb-3 text-xs font-bold tracking-widest text-stone-500 uppercase">{t.introduction}</div>
                <h2 className="font-serif text-4xl mb-6 leading-tight text-stone-900">{data.introduction.title}</h2>
                <div className="w-16 h-1 bg-nobel-gold mb-6"></div>
              </div>
              <div className="md:col-span-8 text-lg text-stone-600 leading-relaxed space-y-6">
                <p>
                  <span className="text-5xl float-left mr-3 mt-[-8px] font-serif text-nobel-gold">{data.introduction.content.charAt(0)}</span>
                  {data.introduction.content.slice(1)}
                </p>
              </div>
            </div>
          </section>

          {/* Dynamic Sections */}
          {data.sections.map((section, index) => (
            <section key={section.id} id={section.id} className={`py-24 ${index % 2 === 0 ? 'bg-white border-t border-stone-100' : 'bg-stone-900 text-stone-100 overflow-hidden relative'}`}>
              {index % 2 !== 0 && (
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="w-96 h-96 rounded-full bg-stone-600 blur-[100px] absolute top-[-100px] left-[-100px]"></div>
                  <div className="w-96 h-96 rounded-full bg-nobel-gold blur-[100px] absolute bottom-[-100px] right-[-100px]"></div>
                </div>
              )}

              <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className={index % 2 !== 0 ? 'order-1 lg:order-2' : ''}>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-full mb-6 border ${
                      index % 2 !== 0 ? 'bg-stone-800 text-nobel-gold border-stone-700' : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}>
                      <BookOpen size={14}/> {section.type.toUpperCase()}
                    </div>
                    <h2 className={`font-serif text-4xl md:text-5xl mb-6 ${index % 2 !== 0 ? 'text-white' : 'text-stone-900'}`}>
                      {section.title}
                    </h2>
                    <p className={`text-lg leading-relaxed ${index % 2 !== 0 ? 'text-stone-400' : 'text-stone-600'}`}>
                      {section.content}
                    </p>
                  </div>
                  <div className={index % 2 !== 0 ? 'order-2 lg:order-1' : ''}>
                    {section.type === 'diagram' ? (
                      <div className="p-8 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                        {renderDiagram(section.diagramType, section.visualizationData)}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="aspect-video bg-stone-100/50 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center text-stone-300 border border-stone-200 group relative">
                          {section.imageUrl ? (
                            <img 
                              src={section.imageUrl} 
                              alt={section.title} 
                              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 saturate-[0.7] brightness-[0.95] group-hover:saturate-100 group-hover:brightness-100"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <FileText size={64} />
                          )}
                          <div className="absolute inset-0 bg-stone-900/5 group-hover:bg-transparent transition-colors duration-300" />
                        </div>
                        {section.imageCaption && (
                          <p className={`text-xs italic font-serif tracking-wide ${index % 2 !== 0 ? 'text-stone-500' : 'text-stone-400'}`}>
                            <span className="font-bold uppercase not-italic mr-2 text-[10px] tracking-widest">{t.figure} {index + 1}:</span>
                            {section.imageCaption}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ))}

          {/* Authors */}
          <section id="authors" className="py-24 bg-stone-50">
            <div className="container mx-auto px-6 text-center">
              <h2 className="font-serif text-4xl mb-16 text-stone-900">{t.researchTeam}</h2>
              <div className="flex flex-wrap justify-center gap-8">
                {data.authors.slice(0, 4).map((author, i) => (
                  <AuthorCard key={i} name={author.name} role={author.role} institution={author.institution} scholarUrl={author.scholarUrl} delay={`${i * 0.1}s`} language={language} />
                ))}
              </div>
            </div>
          </section>

          {/* Bottom Export Section */}
          <section className="py-20 bg-white border-t border-stone-100">
            <div className="container mx-auto px-6 text-center">
              <div className="max-w-md mx-auto">
                <div className="inline-block mb-4 p-3 bg-nobel-gold/10 rounded-full text-nobel-gold">
                  <Share2 size={24} />
                </div>
                <h3 className="font-serif text-3xl text-stone-900 mb-4">{t.readyToShare}</h3>
                <p className="text-stone-500 mb-10">{t.shareDesc}</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <button 
                    onClick={handleExportPDF}
                    disabled={exporting}
                    className="flex-1 flex items-center justify-center gap-3 py-4 px-8 rounded-xl bg-stone-900 text-white font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    <Download size={18} />
                    {t.downloadPdf}
                  </button>
                  <button 
                    onClick={handleExportImage}
                    disabled={exporting}
                    className="flex-1 flex items-center justify-center gap-3 py-4 px-8 rounded-xl border-2 border-stone-900 text-stone-900 font-bold uppercase tracking-widest text-xs hover:bg-stone-50 transition-all disabled:opacity-50"
                  >
                    <ImageIcon size={18} />
                    {t.saveImage}
                  </button>
                </div>

                <button 
                  onClick={onBack}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-all"
                >
                  <ChevronLeft size={14} /> {t.home}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-12 bg-white border-t border-stone-100">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-nobel-gold rounded-full flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm pb-1">α</div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg tracking-wide text-stone-900 leading-none">{t.narrative}</span>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">{t.researchEngine}</span>
              </div>
            </div>
            <p className="text-stone-400 text-sm">{t.generatedBy}</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

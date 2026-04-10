import React, { useState } from 'react';
import { Upload, Loader2, X, FileText, Link as LinkIcon } from 'lucide-react';
import { generateArticleData } from '../services/geminiService';
import { ArticleData, Language } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set up PDF.js worker using Vite's URL import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const TRANSLATIONS = {
  en: {
    title: 'Generate Research Narrative',
    fileUpload: 'File Upload',
    pasteUrl: 'Paste URL',
    uploadArticle: 'Upload Article',
    selectFile: 'Select a .txt, .md, .pdf, or .docx file',
    changeFile: 'Change File',
    articleUrl: 'Article URL',
    urlPlaceholder: 'https://example.com/paper.pdf',
    urlDesc: "Paste a direct link to a PDF, text file, or webpage. We'll attempt to extract the research content.",
    generate: 'Generate Website',
    processing: 'Processing...',
    largeFileWarning: 'This may take a minute for large files',
    fetchError: 'Failed to fetch content from URL. Please ensure the URL is correct and public.',
    emptyError: 'The content seems to be empty or too short to process.',
    extractPdf: 'Extracting PDF text...',
    extractPdfPage: (i: number, total: number) => `Extracting PDF text (Page ${i}/${total})...`,
    extractWord: 'Extracting Word text...',
    fetchingUrl: 'Fetching content from URL...',
    aiAnalysis: 'AI Analysis & Generation...'
  },
  zh: {
    title: '生成研究叙事',
    fileUpload: '文件上传',
    pasteUrl: '粘贴链接',
    uploadArticle: '上传文章',
    selectFile: '选择 .txt, .md, .pdf 或 .docx 文件',
    changeFile: '更改文件',
    articleUrl: '文章链接',
    urlPlaceholder: 'https://example.com/paper.pdf',
    urlDesc: '粘贴 PDF、文本文件或网页的直接链接。我们将尝试提取研究内容。',
    generate: '生成网站',
    processing: '处理中...',
    largeFileWarning: '大文件可能需要一分钟左右',
    fetchError: '无法从链接获取内容。请确保链接正确且公开。',
    emptyError: '内容似乎为空或太短，无法处理。',
    extractPdf: '正在提取 PDF 文本...',
    extractPdfPage: (i: number, total: number) => `正在提取 PDF 文本 (第 ${i}/${total} 页)...`,
    extractWord: '正在提取 Word 文本...',
    fetchingUrl: '正在从链接获取内容...',
    aiAnalysis: '人工智能分析与生成...'
  }
};

interface ArticleGeneratorProps {
  onGenerated: (data: ArticleData) => void;
  onClose: () => void;
  language: Language;
}

export const ArticleGenerator: React.FC<ArticleGeneratorProps> = ({ onGenerated, onClose, language }) => {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');

  const t = TRANSLATIONS[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const extractTextFromBuffer = async (buffer: ArrayBuffer, fileName: string): Promise<string> => {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.endsWith('.pdf')) {
      setLoadingStep(t.extractPdf);
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      const pageCount = Math.min(pdf.numPages, 20);
      for (let i = 1; i <= pageCount; i++) {
        try {
          setLoadingStep(t.extractPdfPage(i, pageCount));
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n';
        } catch (pageErr) {
          console.warn(`Failed to extract text from page ${i}:`, pageErr);
        }
      }
      return fullText;
    } 
    
    if (lowerName.endsWith('.docx')) {
      setLoadingStep(t.extractWord);
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      return result.value;
    }
    
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  };

  const handleProcess = async () => {
    setLoading(true);
    setError(null);

    try {
      let text = '';
      if (mode === 'upload' && file) {
        const buffer = await file.arrayBuffer();
        text = await extractTextFromBuffer(buffer, file.name);
      } else if (mode === 'url' && url) {
        setLoadingStep(t.fetchingUrl);
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(t.fetchError);
        
        const buffer = await response.arrayBuffer();
        const fileName = url.split('/').pop() || 'article.txt';
        text = await extractTextFromBuffer(buffer, fileName);
      } else {
        return;
      }

      if (!text || text.trim().length < 50) {
        throw new Error(t.emptyError);
      }
      
      setLoadingStep(t.aiAnalysis);
      const data = await generateArticleData(text, language);
      onGenerated(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to process article. Please try again.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-bottom border-stone-100 flex justify-between items-center">
          <h2 className="font-serif text-2xl text-stone-900">{t.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-stone-100">
          <button 
            onClick={() => setMode('upload')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${mode === 'upload' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
          >
            {t.fileUpload}
          </button>
          <button 
            onClick={() => setMode('url')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${mode === 'url' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
          >
            {t.pasteUrl}
          </button>
        </div>

        <div className="p-8">
          {mode === 'upload' ? (
            <div 
              className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all ${
                file ? 'border-nobel-gold bg-nobel-gold/5' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              {file ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-nobel-gold/10 rounded-full flex items-center justify-center text-nobel-gold mb-4">
                    <FileText size={32} />
                  </div>
                  <p className="font-medium text-stone-900 mb-1">{file.name}</p>
                  <p className="text-sm text-stone-500 mb-6">{(file.size / 1024).toFixed(1)} KB</p>
                  <button 
                    onClick={() => setFile(null)}
                    className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {t.changeFile}
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mb-4">
                    <Upload size={32} />
                  </div>
                  <p className="font-medium text-stone-900 mb-1">{t.uploadArticle}</p>
                  <p className="text-sm text-stone-500 text-center">{t.selectFile}</p>
                  <input type="file" className="hidden" accept=".txt,.md,.pdf,.docx" onChange={handleFileChange} />
                </label>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500">{t.articleUrl}</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                    <LinkIcon size={18} />
                  </div>
                  <input 
                    type="url" 
                    placeholder={t.urlPlaceholder}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nobel-gold/20 focus:border-nobel-gold transition-all"
                  />
                </div>
                <p className="text-[10px] text-stone-400 leading-relaxed mt-1">
                  {t.urlDesc}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            disabled={(mode === 'upload' ? !file : !url) || loading}
            onClick={handleProcess}
            className={`w-full mt-8 py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 ${
              (mode === 'upload' ? !file : !url) || loading 
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                : 'bg-stone-900 text-white hover:bg-stone-800 shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <div className="flex flex-col items-center">
                  <span>{loadingStep || t.processing}</span>
                  <span className="text-[10px] text-stone-400 normal-case tracking-normal mt-1">{t.largeFileWarning}</span>
                </div>
              </>
            ) : (
              <span>{t.generate}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

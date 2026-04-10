/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

export type Language = 'en' | 'zh';

export interface ArticleSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'diagram' | 'methodology' | 'results' | 'conclusion';
  diagramType?: 'surface-code' | 'transformer' | 'metrics' | 'generic-chart' | 'generic-flow';
  visualizationData?: any;
  imageUrl?: string;
  imageCaption?: string;
}

export interface Author {
  name: string;
  role: string;
  institution: string;
  scholarUrl?: string;
}

export interface ArticleData {
  id: string;
  title: string;
  subtitle: string;
  heroDescription: string;
  introduction: {
    title: string;
    content: string;
  };
  sections: ArticleSection[];
  authors: Author[];
  date: string;
  sidebarSections: { id: string; label: string }[];
}

export interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export interface Laureate {
  name: string;
  image: string; // placeholder url
  role: string;
  desc: string;
}
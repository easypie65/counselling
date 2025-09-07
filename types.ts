
import { LucideIcon } from 'lucide-react';

export interface CategoryConfig {
  icon: LucideIcon;
  color: string;
  approaches: string[];
  specificProblems: string[];
}

export interface Categories {
  [key: string]: CategoryConfig;
}

export interface CounselingRecord {
  id: number;
  studentName: string;
  studentGrade: string;
  studentClass: string;
  category: string;
  date: string;
  content: string;
  originalApproach: string;
}

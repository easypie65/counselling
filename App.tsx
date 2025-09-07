
import React, { useState, useEffect } from 'react';
import { Save, Download, Edit3, Trash2, BookOpen, Search, Loader2 } from 'lucide-react';
import { CounselingRecord } from './types';
import { CATEGORIES } from './constants';
import { fetchSolutionsFromGemini } from './services/geminiService';

const StudentCounselingApp = () => {
  const [records, setRecords] = useState<CounselingRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [counselingDate, setCounselingDate] = useState(new Date().toISOString().split('T')[0]);
  const [customContent, setCustomContent] = useState('');
  const [selectedApproach, setSelectedApproach] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // AI Search State
  const [specificProblem, setSpecificProblem] = useState('');
  const [showAiSearch, setShowAiSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<string[]>([]);

  useEffect(() => {
    const savedRecords = localStorage.getItem('counselingRecords');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('counselingRecords', JSON.stringify(records));
  }, [records]);
  

  const searchAISolutions = async (category: string, problem: string) => {
    setIsSearching(true);
    setAiSearchResults([]);
    setShowAiSearch(true);
    setSpecificProblem(problem);
    try {
      const results = await fetchSolutionsFromGemini(category, problem);
      setAiSearchResults(results);
    } catch (error) {
      console.error("AI search failed:", error);
      alert("AI 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setShowAiSearch(false);
    } finally {
      setIsSearching(false);
    }
  };


  const saveRecord = () => {
    if (!studentName || !selectedCategory || !customContent) {
      alert('학생명, 상담 카테고리, 상담 내용을 모두 입력해주세요.');
      return;
    }

    const newRecord: CounselingRecord = {
      id: isEditing && editingId ? editingId : Date.now(),
      studentName,
      studentGrade,
      studentClass,
      category: selectedCategory,
      date: counselingDate,
      content: customContent,
      originalApproach: selectedApproach,
    };

    if (isEditing) {
      setRecords(records.map(record => 
        record.id === editingId ? newRecord : record
      ));
    } else {
      setRecords([...records, newRecord].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    
    resetForm();
    setIsEditing(false);
    setEditingId(null);
  };

  const resetForm = () => {
    setStudentName('');
    setStudentGrade('');
    setStudentClass('');
    setSelectedCategory('');
    setSelectedApproach('');
    setCustomContent('');
    setCounselingDate(new Date().toISOString().split('T')[0]);
    setIsEditing(false);
    setEditingId(null);
    setShowAiSearch(false);
    setAiSearchResults([]);
    setSpecificProblem('');
  };

  const editRecord = (record: CounselingRecord) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStudentName(record.studentName);
    setStudentGrade(record.studentGrade);
    setStudentClass(record.studentClass);
    setSelectedCategory(record.category);
    setSelectedApproach(record.originalApproach);
    setCustomContent(record.content);
    setCounselingDate(record.date);
    setIsEditing(true);
    setEditingId(record.id);
    setShowAiSearch(false);
    setAiSearchResults([]);
    setSpecificProblem('');
  };

  const deleteRecord = (id: number) => {
    if (window.confirm('이 상담기록을 삭제하시겠습니까?')) {
      setRecords(records.filter(record => record.id !== id));
    }
  };

  const downloadCSV = () => {
    if (records.length === 0) {
      alert('다운로드할 상담기록이 없습니다.');
      return;
    }

    const headers = ['날짜', '학년', '반', '학생명', '상담분야', '상담내용'];
    const csvContent = [
      headers.join(','),
      ...records.map(record => [
        record.date,
        record.studentGrade,
        record.studentClass,
        record.studentName,
        record.category,
        `"${record.content.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `학생상담기록_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const CategoryIcon = ({ category }: { category: string }) => {
    const IconComponent = CATEGORIES[category]?.icon || BookOpen;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">AI 학생상담기록 시스템</h1>
          <p className="text-slate-600">남자중학교 상담기록 작성 및 AI 기반 솔루션 검색</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-5 sticky top-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-2 flex items-center">
              <Edit3 className="w-6 h-6 mr-3 text-blue-600" />
              {isEditing ? '상담기록 수정' : '새 상담기록 작성'}
            </h2>

            <div className="grid grid-cols-3 gap-4">
              <input value={studentGrade} onChange={(e) => setStudentGrade(e.target.value)} placeholder="학년" type="number" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
              <input value={studentClass} onChange={(e) => setStudentClass(e.target.value)} placeholder="반" type="number" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
              <input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="학생명" type="text" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
            </div>

            <input type="date" value={counselingDate} onChange={(e) => setCounselingDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">상담 카테고리</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {Object.entries(CATEGORIES).map(([category, config]) => (
                  <button key={category} onClick={() => { setSelectedCategory(category); setSelectedApproach(''); setCustomContent(''); setSpecificProblem(''); setAiSearchResults([]); setShowAiSearch(false); }}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center text-sm ${selectedCategory === category ? `${config.color} text-white border-transparent shadow-md` : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'}`}>
                    <config.icon className="w-4 h-4 mr-2" /> <span className="font-medium">{category}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedCategory && (
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <label className="block text-sm font-medium text-slate-700">세부 문제 선택 (AI 해결책 검색)</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES[selectedCategory].specificProblems.map((problem) => (
                    <button key={problem} onClick={() => searchAISolutions(selectedCategory, problem)}
                      className={`p-2 text-sm rounded-lg border transition-all duration-200 flex items-center justify-center ${specificProblem === problem ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                      <Search className="w-4 h-4 mr-1.5" /> {problem}
                    </button>
                  ))}
                </div>

                {showAiSearch && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-3 text-center">AI 검색 결과: "{specificProblem}"</h4>
                    {isSearching ? (
                      <div className="flex items-center justify-center py-6 text-blue-600"><Loader2 className="w-6 h-6 animate-spin mr-3" /><span>AI가 해결책을 찾고 있습니다...</span></div>
                    ) : (
                      <div className="space-y-2">
                        {aiSearchResults.map((result, index) => (
                          <button key={index} onClick={() => { setSelectedApproach(result); setCustomContent(result); }}
                            className={`w-full p-3 text-left rounded-lg border transition-all duration-200 text-sm leading-relaxed ${selectedApproach === result ? 'bg-blue-200 border-blue-400 text-blue-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-blue-100'}`}>{result}</button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">기본 추천 접근법</label>
                  <div className="space-y-2">
                    {CATEGORIES[selectedCategory].approaches.map((approach, index) => (
                      <button key={index} onClick={() => { setSelectedApproach(approach); setCustomContent(approach); }}
                        className={`w-full p-3 text-left rounded-lg border transition-all duration-200 text-sm leading-relaxed ${selectedApproach === approach ? 'bg-green-100 border-green-300 text-green-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}>{approach}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {customContent && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">상담 내용 (수정 가능)</label>
                <textarea value={customContent} onChange={(e) => setCustomContent(e.target.value)} rows={7} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-y" placeholder="선택한 접근법을 바탕으로 내용을 수정하거나 추가해주세요." />
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button onClick={saveRecord} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center shadow-sm hover:shadow-md"><Save className="w-5 h-5 mr-2" />{isEditing ? '수정 완료' : '기록 저장'}</button>
              {isEditing && (<button onClick={resetForm} className="px-6 py-3 bg-slate-400 hover:bg-slate-500 text-white font-medium rounded-lg transition-colors duration-200">취소</button>)}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-slate-800 flex items-center"><BookOpen className="w-6 h-6 mr-3 text-green-600" />상담기록 목록 ({records.length}건)</h2>
              {records.length > 0 && (<button onClick={downloadCSV} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center text-sm"><Download className="w-4 h-4 mr-2" />CSV</button>)}
            </div>
            <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 -mr-2">
              {records.length === 0 ? (
                <div className="text-center py-16 text-slate-500"><BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" /><p>작성된 상담기록이 없습니다.</p><p className="text-sm">첫 상담기록을 작성해보세요!</p></div>
              ) : (
                records.map((record) => (
                  <div key={record.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 bg-slate-50/50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${CATEGORIES[record.category]?.color || 'bg-slate-500'}`}><CategoryIcon category={record.category} /><span className="ml-1.5">{record.category}</span></span>
                        <span className="text-sm font-semibold text-slate-800">{record.studentGrade}학년 {record.studentClass}반 {record.studentName}</span>
                        <span className="text-xs text-slate-500">{record.date}</span>
                      </div>
                      <div className="flex space-x-2 flex-shrink-0 ml-2">
                        <button onClick={() => editRecord(record)} className="p-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => deleteRecord(record.id)} className="p-1 text-red-600 hover:text-red-800 transition-colors duration-200"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">{record.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCounselingApp;

import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storage';
import { Submission, Quiz } from '../types';
import { Trash2, Users, Target, ChevronDown } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [quizStats, setQuizStats] = useState({ count: 0, avgScore: 0 });

  useEffect(() => {
    const fetchQuizzes = async () => {
      const q = await storageService.getQuizzes();
      setQuizzes(q);
      if (q.length > 0 && !selectedQuizId) {
        setSelectedQuizId(q[0].id);
      }
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedQuizId]);

  const loadData = async () => {
    if (!selectedQuizId) return;
    
    const allSubmissions = await storageService.getSubmissions();
    const filtered = allSubmissions.filter(s => s.quiz_id === selectedQuizId);
    setSubmissions(filtered);

    const avg = filtered.length 
      ? filtered.reduce((acc, s) => acc + s.total_score, 0) / filtered.length
      : 0;
    
    setQuizStats({
      count: filtered.length,
      avgScore: Math.round(avg * 10) / 10
    });
  };

  const handleDeleteSubmission = async (id: number) => {
    if (confirm('Are you sure you want to delete this submission?')) {
      await storageService.deleteSubmission(id);
      loadData();
    }
  };

  const selectedQuiz = quizzes.find(q => q.id === selectedQuizId);

  // Question Analysis Data Helper
  const getQuestionAnalysis = () => {
    if (!selectedQuiz) return [];
    
    return selectedQuiz.questions.map(q => {
      const optionCounts = q.options.map(opt => {
        const count = submissions.reduce((acc, sub) => {
          const hasSelected = sub.answers.some(a => a.question_id === q.id && a.option_id === opt.id);
          return acc + (hasSelected ? 1 : 0);
        }, 0);
        return { ...opt, count };
      });
      return { ...q, optionCounts };
    });
  };

  const questionAnalysis = getQuestionAnalysis();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-500">Deep dive into assessment results.</p>
        </div>
        
        <div className="relative">
          <select 
            className="appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-64 p-2.5 pr-8"
            value={selectedQuizId || ''}
            onChange={(e) => setSelectedQuizId(Number(e.target.value))}
          >
            {quizzes.map(q => (
              <option key={q.id} value={q.id}>{q.title}</option>
            ))}
            {quizzes.length === 0 && <option value="">No quizzes available</option>}
          </select>
          <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {selectedQuiz ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{quizStats.count}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{quizStats.avgScore}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Recent Submissions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {new Date(sub.submitted_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {sub.total_score}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteSubmission(sub.id)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                          title="Delete Submission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                        No submissions found for this quiz.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
             <h3 className="text-xl font-bold text-gray-900">Question Analysis</h3>
             {questionAnalysis.map((q, idx) => (
               <div key={q.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                 <div className="flex justify-between items-start mb-4">
                    <h4 className="text-base font-semibold text-gray-900">
                      <span className="text-indigo-600 mr-2">{idx + 1}.</span> {q.text}
                    </h4>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-600 uppercase">
                      {q.type}
                    </span>
                 </div>
                 
                 <div className="space-y-3">
                   {q.optionCounts.map(opt => {
                     const percentage = submissions.length ? Math.round((opt.count / submissions.length) * 100) : 0;
                     return (
                       <div key={opt.id} className="relative">
                         <div className="flex justify-between text-sm mb-1">
                           <span className="text-gray-700">{opt.text} <span className="text-gray-400 ml-1">({opt.score} pts)</span></span>
                           <span className="font-medium text-gray-900">{percentage}% ({opt.count})</span>
                         </div>
                         <div className="w-full bg-gray-100 rounded-full h-2">
                           <div 
                             className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                             style={{ width: `${percentage}%` }}
                           ></div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
             ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
          <p className="text-gray-500">Please create a quiz to see analytics.</p>
        </div>
      )}
    </div>
  );
};
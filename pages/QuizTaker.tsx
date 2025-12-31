import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Quiz, Submission, Answer } from '../types';
import { CheckCircle, XCircle } from 'lucide-react';

export const QuizTaker: React.FC = () => {
  const { id } = useParams();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  // Store array of selected option IDs per question ID
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [scoreData, setScoreData] = useState({ score: 0, maxScore: 0 });

  useEffect(() => {
    if (id) {
      const found = storageService.getQuiz(Number(id));
      if (found) setQuiz(found);
    }
  }, [id]);

  const handleSelect = (questionId: number, optionId: number, type: 'single' | 'multi') => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (type === 'single') {
        return { ...prev, [questionId]: [optionId] };
      } else {
        // Multi logic: toggle
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter(id => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...current, optionId] };
        }
      }
    });
  };

  const calculateMaxScore = (quiz: Quiz) => {
    let max = 0;
    quiz.questions.forEach(q => {
      if (q.type === 'single') {
        // Max possible for single choice is the highest option score
        const maxOpt = Math.max(...q.options.map(o => o.score), 0);
        max += maxOpt;
      } else {
        // Max possible for multi choice is sum of all positive scores
        // Assuming user checks all correct answers
        const maxMulti = q.options.reduce((sum, o) => sum + (o.score > 0 ? o.score : 0), 0);
        max += maxMulti;
      }
    });
    return max;
  };

  const handleSubmit = () => {
    if (!quiz) return;

    let totalScore = 0;
    const finalAnswers: Answer[] = [];

    quiz.questions.forEach(q => {
      const selectedIds = answers[q.id] || [];
      selectedIds.forEach(optId => {
         const option = q.options.find(o => o.id === optId);
         if (option) {
           totalScore += option.score;
         }
         finalAnswers.push({ question_id: q.id, option_id: optId });
      });
    });

    const submission: Submission = {
      id: 0,
      quiz_id: quiz.id,
      total_score: totalScore,
      submitted_at: new Date().toISOString(),
      answers: finalAnswers
    };

    storageService.saveSubmission(submission);
    setScoreData({ score: totalScore, maxScore: calculateMaxScore(quiz) });
    setSubmitted(true);
  };

  if (!quiz) return <div>Loading...</div>;

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="max-w-xl w-full bg-white p-10 rounded-xl border border-gray-200 shadow-lg text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Assessment Submitted!</h2>
          <p className="text-gray-500 mb-8">Your response has been recorded.</p>
          
          <div className="bg-gray-50 rounded-xl p-8 mb-8 inline-block w-full">
            <span className="text-sm text-gray-500 uppercase tracking-wide font-bold">Your Result</span>
            <div className="flex items-baseline justify-center gap-2 mt-2">
               <span className="text-5xl font-extrabold text-indigo-600">{scoreData.score}</span>
               <span className="text-2xl text-gray-400 font-medium">/ {scoreData.maxScore}</span>
            </div>
            <div className="mt-2 text-sm text-gray-400">Total Score</div>
          </div>

          <div className="text-sm text-gray-500 italic">
            You may now close this page.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
        <p className="text-gray-600">{quiz.description}</p>
      </div>

      {quiz.questions.map((q, idx) => (
        <div key={q.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="mb-4">
             <h3 className="text-lg font-bold text-indigo-700 flex gap-3">
              <span className="text-indigo-600">{idx + 1}.</span>
              {q.text}
            </h3>
            {q.type === 'multi' && (
              <p className="text-xs text-gray-400 ml-8 mt-1 italic">Select all that apply</p>
            )}
          </div>
          
          <div className="space-y-3 ml-8">
            {q.options.map(opt => {
              const isSelected = (answers[q.id] || []).includes(opt.id);
              return (
                <label 
                  key={opt.id} 
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                      : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50'
                  }`}
                >
                  <input 
                    type={q.type === 'single' ? 'radio' : 'checkbox'} 
                    name={`q-${q.id}`} 
                    className={`w-5 h-5 text-indigo-700 accent-indigo-700 focus:ring-indigo-700 border-2 border-indigo-700 bg-white ${q.type === 'single' ? '' : 'rounded'}`}
                    checked={isSelected}
                    onChange={() => handleSelect(q.id, opt.id, q.type)}
                  />
                  <span className="ml-3 text-gray-700 font-medium">{opt.text}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-6">
        <button 
          onClick={handleSubmit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
        >
          Submit Assessment
        </button>
      </div>
    </div>
  );
};
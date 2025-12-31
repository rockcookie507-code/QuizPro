import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Quiz, Question, Option } from '../types';
import { Plus, Save, Trash, ArrowLeft, GripVertical } from 'lucide-react';

export const QuizEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz>({
    id: 0,
    title: '',
    description: '',
    created_at: new Date().toISOString(),
    questions: []
  });

  useEffect(() => {
    if (id) {
      const found = storageService.getQuiz(Number(id));
      if (found) setQuiz(found);
    }
  }, [id]);

  const handleSave = () => {
    if (!quiz.title) return alert("Title is required");
    storageService.saveQuiz(quiz);
    navigate('/quizzes');
  };

  const addQuestion = () => {
    const newQ: Question = {
      id: Date.now(),
      quiz_id: quiz.id,
      text: '',
      type: 'single',
      position: quiz.questions.length + 1,
      options: [
        { id: Date.now() + 1, question_id: Date.now(), text: '', score: 0 },
        { id: Date.now() + 2, question_id: Date.now(), text: '', score: 0 }
      ]
    };
    setQuiz({ ...quiz, questions: [...quiz.questions, newQ] });
  };

  const updateQuestion = (qIndex: number, field: keyof Question, value: any) => {
    const updated = [...quiz.questions];
    updated[qIndex] = { ...updated[qIndex], [field]: value };
    setQuiz({ ...quiz, questions: updated });
  };

  const deleteQuestion = (qIndex: number) => {
    const updated = quiz.questions.filter((_, i) => i !== qIndex);
    setQuiz({ ...quiz, questions: updated });
  };

  const addOption = (qIndex: number) => {
    const updatedQ = [...quiz.questions];
    updatedQ[qIndex].options.push({
      id: Date.now(),
      question_id: updatedQ[qIndex].id,
      text: '',
      score: 0
    });
    setQuiz({ ...quiz, questions: updatedQ });
  };

  const updateOption = (qIndex: number, oIndex: number, field: keyof Option, value: any) => {
    const updatedQ = [...quiz.questions];
    updatedQ[qIndex].options[oIndex] = { ...updatedQ[qIndex].options[oIndex], [field]: value };
    setQuiz({ ...quiz, questions: updatedQ });
  };

  const deleteOption = (qIndex: number, oIndex: number) => {
    const updatedQ = [...quiz.questions];
    updatedQ[qIndex].options = updatedQ[qIndex].options.filter((_, i) => i !== oIndex);
    setQuiz({ ...quiz, questions: updatedQ });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/quizzes')} className="flex items-center text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{id ? 'Edit Quiz' : 'New Quiz'}</h2>
        <button onClick={handleSave} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors sticky top-4 z-10">
          <Save className="w-5 h-5" /> Save
        </button>
      </div>

      {/* Basic Info */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
          <input 
            type="text" 
            value={quiz.title}
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            className="w-full border border-indigo-100 rounded-lg px-4 py-2 bg-indigo-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            placeholder="e.g. Cybersecurity Audit 2024"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            value={quiz.description}
            onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
            className="w-full border border-indigo-100 rounded-lg px-4 py-2 bg-indigo-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-24 transition-colors"
            placeholder="Describe the purpose of this assessment..."
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((q, qIndex) => (
          <div key={q.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative group">
            <button 
              onClick={() => deleteQuestion(qIndex)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash className="w-5 h-5" />
            </button>

            <div className="flex gap-4 mb-6">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mt-1">
                {qIndex + 1}
              </span>
              <div className="flex-1 space-y-4">
                <input 
                  type="text" 
                  value={q.text}
                  onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                  className="w-full text-lg font-medium border-b border-gray-200 focus:border-indigo-500 outline-none pb-2 bg-transparent"
                  placeholder="Enter question text..."
                />
                
                <div className="flex items-center gap-3">
                   <span className="text-xs text-gray-500 uppercase font-bold tracking-wide">Type:</span>
                   <select 
                     value={q.type}
                     onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                     className="text-sm border-gray-200 bg-gray-50 rounded-md p-1.5 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                   >
                     <option value="single">Single Choice</option>
                     <option value="multi">Multiple Choice</option>
                   </select>
                </div>
              </div>
            </div>

            <div className="ml-12 space-y-3">
              {q.options.map((opt, oIndex) => (
                <div key={opt.id} className="flex items-center gap-4">
                  <div className={`w-3 h-3 border-2 border-gray-300 ${q.type === 'single' ? 'rounded-full' : 'rounded-sm'}`}></div>
                  <input 
                    type="text"
                    value={opt.text}
                    onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                    className="flex-1 border border-indigo-100 bg-indigo-50/50 rounded px-3 py-1.5 text-sm focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                    placeholder="Option text"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Score:</span>
                    <input 
                      type="number"
                      value={opt.score}
                      onChange={(e) => updateOption(qIndex, oIndex, 'score', Number(e.target.value))}
                      className="w-16 border border-indigo-100 bg-indigo-50/50 rounded px-2 py-1.5 text-sm focus:bg-white focus:border-indigo-500 outline-none text-right transition-colors"
                    />
                  </div>
                  <button onClick={() => deleteOption(qIndex, oIndex)} className="text-gray-300 hover:text-red-500">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => addOption(qIndex)}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 mt-2"
              >
                <Plus className="w-4 h-4" /> Add Option
              </button>
            </div>
          </div>
        ))}

        <button 
          onClick={addQuestion}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Question
        </button>
      </div>
    </div>
  );
};
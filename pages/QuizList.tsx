import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Quiz } from '../types';
import { Plus, Edit2, Play, Trash2 } from 'lucide-react';

export const QuizList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const loadQuizzes = () => {
    setQuizzes(storageService.getQuizzes());
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      storageService.deleteQuiz(id);
      loadQuizzes();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quiz Management</h2>
          <p className="text-gray-500">Create, edit, and manage your consulting assessments.</p>
        </div>
        <Link 
          to="/quizzes/new" 
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          New Quiz
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map(quiz => (
          <div key={quiz.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="p-6 flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{quiz.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-3">{quiz.description}</p>
              <div className="mt-4 text-xs text-gray-400">
                Created: {new Date(quiz.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between rounded-b-xl">
              <Link 
                to={`/quizzes/${quiz.id}/take`}
                className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                <Play className="w-4 h-4" /> Take
              </Link>
              <div className="flex gap-4">
                <Link 
                  to={`/quizzes/${quiz.id}/edit`}
                  className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </Link>
                <button 
                  onClick={() => handleDelete(quiz.id)}
                  className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {quizzes.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200 border-dashed">
            <p>No quizzes found. Create your first assessment!</p>
          </div>
        )}
      </div>
    </div>
  );
};
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { QuizList } from './pages/QuizList';
import { QuizEditor } from './pages/QuizEditor';
import { QuizTaker } from './pages/QuizTaker';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="quizzes" element={<QuizList />} />
          <Route path="quizzes/new" element={<QuizEditor />} />
          <Route path="quizzes/:id/edit" element={<QuizEditor />} />
          <Route path="quizzes/:id/take" element={<QuizTaker />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
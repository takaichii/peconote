import { Routes, Route, Navigate } from 'react-router-dom';
import MemoListPage from './pages/MemoListPage';
import MemoFormPage from './pages/MemoFormPage';
import MemoDetailPage from './pages/MemoDetailPage';
import Layout from './components/Layout';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/memos" replace />} />
        <Route path="/memos" element={<MemoListPage />} />
        <Route path="/memos/new" element={<MemoFormPage mode="create" />} />
        <Route path="/memos/:id" element={<MemoDetailPage />} />
        <Route path="/memos/:id/edit" element={<MemoFormPage mode="edit" />} />
      </Routes>
    </Layout>
  );
}

export default App;

import { Routes, Route, Navigate } from 'react-router-dom';
import MemoListPage from './pages/MemoListPage';
import MemoFormPage from './pages/MemoFormPage';
import MemoDetailPage from './pages/MemoDetailPage';
import GroupListPage from './pages/GroupListPage';
import GroupFormPage from './pages/GroupFormPage';
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
        <Route path="/groups" element={<GroupListPage />} />
        <Route path="/groups/new" element={<GroupFormPage mode="create" />} />
        <Route path="/groups/:id/edit" element={<GroupFormPage mode="edit" />} />
      </Routes>
    </Layout>
  );
}

export default App;

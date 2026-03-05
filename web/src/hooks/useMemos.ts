import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export interface Memo {
  id: string;
  body: string;
  tags: string[];
  group_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  page: number;
  page_size: number;
  total_pages: number;
  total_count: number;
}

export interface MemoListResponse {
  items: Memo[];
  pagination: Pagination;
}

export interface ListParams {
  page?: number;
  page_size?: number;
  tag?: string;
  group_id?: string;
}

export function useListMemos(params: ListParams) {
  return useQuery<MemoListResponse>({
    queryKey: ['memos', params],
    queryFn: async () => {
      const { data } = await client.get('/memos', { params });
      return data;
    },
  });
}

export function useGetMemo(id: string | undefined) {
  return useQuery<Memo>({
    queryKey: ['memo', id],
    queryFn: async () => {
      const { data } = await client.get(`/memos/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateMemo() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (memo: { body: string; tags: string[]; group_id?: string | null }) => {
      const { data } = await client.post('/memos', memo);
      return data as { id: string };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['memos'] });
      navigate(`/memos/${data.id}`);
    },
  });
}

export function useUpdateMemo(id: string) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (memo: { body: string; tags: string[]; group_id?: string | null }) => {
      await client.put(`/memos/${id}`, memo);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['memos'] });
      qc.invalidateQueries({ queryKey: ['memo', id] });
      navigate(`/memos/${id}`);
    },
  });
}

export function useDeleteMemo() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/memos/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['memos'] });
      navigate('/memos');
    },
  });
}

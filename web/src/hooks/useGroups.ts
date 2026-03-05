import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';

export interface Group {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface GroupListResponse {
  items: Group[];
}

export function useListGroups() {
  return useQuery<GroupListResponse>({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data } = await client.get('/groups');
      return data;
    },
  });
}

export function useGetGroup(id: string | undefined) {
  return useQuery<Group>({
    queryKey: ['group', id],
    queryFn: async () => {
      const { data } = await client.get(`/groups/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (group: { name: string }) => {
      const { data } = await client.post('/groups', group);
      return data as { id: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useUpdateGroup(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (group: { name: string }) => {
      await client.put(`/groups/${id}`, group);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['group', id] });
    },
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/groups/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['memos'] });
    },
  });
}

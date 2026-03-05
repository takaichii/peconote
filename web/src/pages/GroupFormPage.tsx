import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useCreateGroup, useUpdateGroup, useGetGroup } from '../hooks/useGroups';

interface Props {
  mode: 'create' | 'edit';
}

const NAME_MAX = 50;

function GroupFormPage({ mode }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: existing, isLoading } = useGetGroup(mode === 'edit' ? id : undefined);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (existing) {
      setName(existing.name);
    }
  }, [existing]);

  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup(id ?? '');
  const mutation = mode === 'create' ? createGroup : updateGroup;

  const validate = (): boolean => {
    if (!name.trim()) {
      setNameError('Name is required.');
      return false;
    }
    if (name.length > NAME_MAX) {
      setNameError(`Name must be ${NAME_MAX} characters or less.`);
      return false;
    }
    setNameError('');
    return true;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate(
      { name: name.trim() },
      {
        onSuccess: () => navigate('/groups'),
      }
    );
  };

  if (mode === 'edit' && isLoading) {
    return (
      <Paper sx={{ p: 4 }}>
        <Skeleton variant="rounded" height={56} sx={{ mb: 2 }} />
      </Paper>
    );
  }

  return (
    <>
      <Stack direction="row" alignItems="center" mb={3} spacing={1}>
        <Tooltip title="Back">
          <IconButton size="small" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h5" component="h1">
          {mode === 'create' ? 'New Group' : 'Edit Group'}
        </Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={onSubmit}>
          <TextField
            fullWidth
            label="Group name"
            placeholder="e.g. Work, Personal, Ideas..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            error={!!nameError}
            helperText={nameError || `${name.length} / ${NAME_MAX}`}
            sx={{ mb: 3 }}
            autoFocus
          />

          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to save group. Please try again.
            </Alert>
          )}

          <Stack direction="row" spacing={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={mutation.isPending}
              startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {mutation.isPending ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </Button>
            <Button variant="text" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </Stack>
        </Box>
      </Paper>
    </>
  );
}

export default GroupFormPage;

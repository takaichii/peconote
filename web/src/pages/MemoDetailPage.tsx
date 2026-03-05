import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useGetMemo, useDeleteMemo } from '../hooks/useMemos';
import { getTagColor } from '../utils/tagColor';

function MemoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetMemo(id);
  const deleteMemo = useDeleteMemo();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) {
    return (
      <Paper sx={{ p: 4 }}>
        <Skeleton variant="text" width="90%" height={28} />
        <Skeleton variant="text" width="75%" height={28} />
        <Skeleton variant="text" width="60%" height={28} />
        <Stack direction="row" spacing={0.5} mt={3}>
          <Skeleton variant="rounded" width={55} height={24} />
          <Skeleton variant="rounded" width={70} height={24} />
        </Stack>
      </Paper>
    );
  }

  if (isError || !data) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h2" mb={1}>🔍</Typography>
        <Typography color="text.secondary" mb={2}>Memo not found.</Typography>
        <Button variant="outlined" onClick={() => navigate('/memos')}>
          Back to list
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Tooltip title="Back to list">
          <IconButton onClick={() => navigate('/memos')} size="small">
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/memos/${data.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => setConfirmOpen(true)}
            disabled={deleteMemo.isPending}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
          {data.body}
        </Typography>
      </Paper>

      {data.tags.length > 0 && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" mb={3}>
          {data.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{ ...getTagColor(tag), fontWeight: 500 }}
            />
          ))}
        </Stack>
      )}

      <Divider sx={{ mb: 2 }} />
      <Stack direction="row" spacing={3}>
        <Typography variant="caption" color="text.disabled">
          Created {new Date(data.created_at).toLocaleString()}
        </Typography>
        {data.created_at !== data.updated_at && (
          <Typography variant="caption" color="text.disabled">
            Updated {new Date(data.updated_at).toLocaleString()}
          </Typography>
        )}
      </Stack>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Delete this memo?</DialogTitle>
        <DialogContent>
          <DialogContentText>This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteMemo.mutate(data.id)}
            disabled={deleteMemo.isPending}
          >
            {deleteMemo.isPending ? <CircularProgress size={16} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MemoDetailPage;

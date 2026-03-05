import { useState, useEffect, KeyboardEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { useCreateMemo, useUpdateMemo, useGetMemo } from '../hooks/useMemos';
import { useListGroups } from '../hooks/useGroups';
import { getTagColor } from '../utils/tagColor';

interface Props {
  mode: 'create' | 'edit';
}

const BODY_MAX = 2000;
const TAG_MAX_COUNT = 10;
const TAG_MAX_LEN = 30;

function MemoFormPage({ mode }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: existing, isLoading } = useGetMemo(mode === 'edit' ? id : undefined);
  const { data: groupsData } = useListGroups();
  const groups = groupsData?.items ?? [];

  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [groupId, setGroupId] = useState<string>('');
  const [bodyError, setBodyError] = useState('');
  const [tagError, setTagError] = useState('');

  useEffect(() => {
    if (existing) {
      setBody(existing.body);
      setTags(existing.tags);
      setGroupId(existing.group_id ?? '');
    }
  }, [existing]);

  const createMemo = useCreateMemo();
  const updateMemo = useUpdateMemo(id ?? '');
  const mutation = mode === 'create' ? createMemo : updateMemo;

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (trimmed.length > TAG_MAX_LEN) {
      setTagError(`Tag must be ${TAG_MAX_LEN} characters or less.`);
      return;
    }
    if (tags.length >= TAG_MAX_COUNT) {
      setTagError(`You can add up to ${TAG_MAX_COUNT} tags.`);
      return;
    }
    if (tags.includes(trimmed)) {
      setTagError('Tag already added.');
      return;
    }
    setTags([...tags, trimmed]);
    setTagInput('');
    setTagError('');
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const validate = (): boolean => {
    if (!body.trim()) {
      setBodyError('Body is required.');
      return false;
    }
    if (body.length > BODY_MAX) {
      setBodyError(`Body must be ${BODY_MAX} characters or less.`);
      return false;
    }
    setBodyError('');
    return true;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({ body, tags, group_id: groupId || null });
  };

  if (mode === 'edit' && isLoading) {
    return (
      <Paper sx={{ p: 4 }}>
        <Skeleton variant="rounded" height={160} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="40%" />
      </Paper>
    );
  }

  const bodyRemaining = BODY_MAX - body.length;

  return (
    <>
      <Stack direction="row" alignItems="center" mb={3} spacing={1}>
        <Tooltip title="Back">
          <IconButton size="small" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h5" component="h1">
          {mode === 'create' ? 'New Memo' : 'Edit Memo'}
        </Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={onSubmit}>
          <TextField
            fullWidth
            multiline
            minRows={8}
            placeholder="Write your memo here..."
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              if (bodyError) setBodyError('');
            }}
            error={!!bodyError}
            helperText={
              bodyError || (
                <Box component="span" sx={{ color: bodyRemaining < 100 ? 'warning.main' : 'text.disabled' }}>
                  {bodyRemaining} characters remaining
                </Box>
              )
            }
            sx={{ mb: 3 }}
          />

          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <InputLabel>Group (optional)</InputLabel>
            <Select
              label="Group (optional)"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              <MenuItem value="">No group</MenuItem>
              {groups.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Tags
          </Typography>

          {tags.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" mb={1.5}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onDelete={() => setTags(tags.filter((t) => t !== tag))}
                  sx={{ ...getTagColor(tag), fontWeight: 500 }}
                />
              ))}
            </Stack>
          )}

          <TextField
            size="small"
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value);
              if (tagError) setTagError('');
            }}
            onKeyDown={handleTagKeyDown}
            error={!!tagError}
            helperText={tagError || `${tags.length} / ${TAG_MAX_COUNT} tags`}
            sx={{ mb: 3, width: 240 }}
            slotProps={{
              input: {
                endAdornment: tagInput ? (
                  <InputAdornment position="end">
                    <Tooltip title="Add tag (Enter)">
                      <IconButton size="small" onClick={addTag} edge="end">
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />

          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to save memo. Please try again.
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

export default MemoFormPage;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  InputAdornment,
  Pagination,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useListMemos } from '../hooks/useMemos';
import { getTagColor } from '../utils/tagColor';

function MemoListPage() {
  const navigate = useNavigate();
  const [tagFilter, setTagFilter] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useListMemos({
    page,
    page_size: 20,
    tag: tagFilter || undefined,
  });

  const applyFilter = (value: string) => {
    setTagFilter(value);
    setPage(1);
  };

  return (
    <>
      <Box mb={3}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by tag..."
          value={tagInput}
          onChange={(e) => {
            setTagInput(e.target.value);
            if (e.target.value === '') applyFilter('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') applyFilter(tagInput);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: tagFilter ? (
                <InputAdornment position="end">
                  <Chip
                    label={tagFilter}
                    size="small"
                    onDelete={() => {
                      setTagInput('');
                      applyFilter('');
                    }}
                    sx={{ ...getTagColor(tagFilter) }}
                  />
                </InputAdornment>
              ) : undefined,
            },
          }}
          sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
        />
      </Box>

      {isLoading && (
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={20} />
                <Stack direction="row" spacing={0.5} mt={1}>
                  <Skeleton variant="rounded" width={50} height={22} />
                  <Skeleton variant="rounded" width={60} height={22} />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {isError && (
        <Box textAlign="center" py={8}>
          <Typography variant="h2" mb={1}>⚠️</Typography>
          <Typography color="text.secondary">Failed to load memos.</Typography>
        </Box>
      )}

      {data && (
        <>
          {data.items.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Typography variant="h2" mb={2}>📭</Typography>
              <Typography variant="h6" color="text.secondary" mb={1}>
                {tagFilter ? `No memos tagged "${tagFilter}"` : 'No memos yet'}
              </Typography>
              {!tagFilter && (
                <Typography variant="body2" color="text.disabled">
                  Click "+ New Memo" to get started.
                </Typography>
              )}
            </Box>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" mb={2} display="block">
                {data.pagination.total_count} memo{data.pagination.total_count !== 1 ? 's' : ''}
                {tagFilter && ` tagged "${tagFilter}"`}
              </Typography>
              <Stack spacing={2}>
                {data.items.map((memo) => (
                  <Card key={memo.id}>
                    <CardActionArea onClick={() => navigate(`/memos/${memo.id}`)}>
                      <CardContent sx={{ pb: '12px !important' }}>
                        <Typography
                          variant="body1"
                          sx={{
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.6,
                            color: 'text.primary',
                            mb: 1.5,
                          }}
                        >
                          {memo.body}
                        </Typography>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                          {memo.tags.length > 0 ? (
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                              {memo.tags.map((tag) => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  sx={{ ...getTagColor(tag), fontWeight: 500 }}
                                />
                              ))}
                            </Stack>
                          ) : (
                            <Box />
                          )}
                          <Typography variant="caption" color="text.disabled" whiteSpace="nowrap">
                            {new Date(memo.created_at).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Stack>

              {data.pagination.total_pages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={data.pagination.total_pages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                    shape="rounded"
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

export default MemoListPage;

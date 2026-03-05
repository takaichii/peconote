import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { useListGroups, useDeleteGroup } from '../hooks/useGroups';

function GroupListPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useListGroups();
  const deleteGroup = useDeleteGroup();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Stack spacing={1}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={52} />
        ))}
      </Stack>
    );
  }

  if (isError) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h2" mb={1}>⚠️</Typography>
        <Typography color="text.secondary">Failed to load groups.</Typography>
      </Box>
    );
  }

  return (
    <>
      {data && data.items.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Typography variant="h2" mb={2}>🗂️</Typography>
          <Typography variant="h6" color="text.secondary" mb={1}>
            No groups yet
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Click "+ New Group" to get started.
          </Typography>
        </Box>
      ) : (
        <Paper variant="outlined">
          <List disablePadding>
            {data?.items.map((group, index) => (
              <ListItem
                key={group.id}
                divider={index < (data.items.length - 1)}
                disablePadding
                secondaryAction={
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/groups/${group.id}/edit`);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmId(group.id);
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
              >
                <ListItemButton onClick={() => navigate(`/memos?group_id=${group.id}`)}>
                  <FolderOutlinedIcon sx={{ mr: 1.5, color: 'text.secondary', fontSize: 20 }} />
                  <ListItemText primary={group.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Dialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Delete this group?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The group will be deleted. Memos in this group will become ungrouped.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setConfirmId(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (confirmId) {
                deleteGroup.mutate(confirmId, {
                  onSuccess: () => setConfirmId(null),
                });
              }
            }}
            disabled={deleteGroup.isPending}
          >
            {deleteGroup.isPending ? <CircularProgress size={16} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default GroupListPage;

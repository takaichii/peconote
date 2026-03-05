import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material';

interface Props {
  children: ReactNode;
}

function Layout({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const isListPage = location.pathname === '/memos';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="md">
          <Toolbar disableGutters sx={{ minHeight: 56 }}>
            <Typography
              variant="h6"
              onClick={() => navigate('/memos')}
              sx={{
                cursor: 'pointer',
                color: 'primary.main',
                letterSpacing: '-0.5px',
                flexGrow: 1,
                userSelect: 'none',
              }}
            >
              📝 PecoNote
            </Typography>
            {isListPage && (
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/memos/new')}
              >
                + New Memo
              </Button>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}

export default Layout;

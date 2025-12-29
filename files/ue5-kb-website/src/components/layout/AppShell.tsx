import { useState, type ReactNode } from 'react';
import { Box, Drawer } from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onMenuClick={handleDrawerToggle} />

      {/* Overlay Drawer - works on all screen sizes */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            top: 0,
            height: '100%',
          },
        }}
      >
        <Sidebar onNavigate={handleDrawerToggle} />
      </Drawer>

      {/* Main Content - Full width */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  InputBase,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../../theme/ThemeProvider';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar>
        {/* Always show hamburger menu */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component="div"
          onClick={() => navigate('/')}
          sx={{
            fontWeight: 800,
            cursor: 'pointer',
            background: 'linear-gradient(90deg, #38bdf8, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mr: 3,
            fontSize: '1.25rem',
          }}
        >
          UE5 KB
        </Typography>

        {/* Search bar - always visible */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'action.hover',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            flexGrow: 1,
            maxWidth: 500,
          }}
        >
          <SearchIcon sx={{ mr: 1, opacity: 0.6 }} />
          <InputBase
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton color="inherit" onClick={toggleTheme} aria-label="toggle theme">
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

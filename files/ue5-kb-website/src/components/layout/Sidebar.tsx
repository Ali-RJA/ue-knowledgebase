import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Typography,
  Divider,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import ArticleIcon from '@mui/icons-material/Article';
import ExtensionIcon from '@mui/icons-material/Extension';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CollectionsIcon from '@mui/icons-material/Collections';
import InfoIcon from '@mui/icons-material/Info';

const menuItems = [
  {
    title: 'Home',
    path: '/',
    icon: <HomeIcon />,
  },
  {
    title: 'Topics',
    path: '/topics',
    icon: <ArticleIcon />,
    children: [
      { title: 'Architecture', path: '/topics/architecture' },
      { title: 'Core Systems', path: '/topics/core-systems' },
      { title: 'Control Systems', path: '/topics/control' },
      { title: 'Design Patterns', path: '/topics/design' },
    ],
  },
  {
    title: 'Lego Pieces',
    path: '/lego-pieces',
    icon: <ExtensionIcon />,
  },
  {
    title: 'Diagrams',
    path: '/diagrams',
    icon: <AccountTreeIcon />,
  },
  {
    title: 'Collections',
    path: '/collections',
    icon: <CollectionsIcon />,
  },
  {
    title: 'About',
    path: '/about',
    icon: <InfoIcon />,
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar = ({ onNavigate }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Topics']);

  const handleToggle = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box
      sx={{
        width: 280,
        height: '100%',
        borderRight: 1,
        borderColor: 'divider',
        overflowY: 'auto',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="overline" sx={{ opacity: 0.7, fontWeight: 600 }}>
          Navigation
        </Typography>
      </Box>
      <List component="nav" sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <Box key={item.title}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  if (item.children) {
                    handleToggle(item.title);
                  } else {
                    handleNavigation(item.path);
                  }
                }}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                }}
              >
                <Box sx={{ mr: 1.5, display: 'flex' }}>{item.icon}</Box>
                <ListItemText primary={item.title} />
                {item.children && (
                  expandedItems.includes(item.title) ? <ExpandLess /> : <ExpandMore />
                )}
              </ListItemButton>
            </ListItem>

            {item.children && (
              <Collapse in={expandedItems.includes(item.title)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton
                      key={child.path}
                      onClick={() => handleNavigation(child.path)}
                      selected={isActive(child.path)}
                      sx={{
                        pl: 4,
                        borderRadius: 1,
                        mb: 0.5,
                        '&.Mui-selected': {
                          bgcolor: 'secondary.main',
                          color: 'secondary.contrastText',
                          '&:hover': {
                            bgcolor: 'secondary.dark',
                          },
                        },
                      }}
                    >
                      <ListItemText primary={child.title} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
    </Box>
  );
};

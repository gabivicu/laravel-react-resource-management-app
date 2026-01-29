import { ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Inbox as InboxIcon,
  Search as SearchIcon,
  Error as ErrorIcon,
  Folder as FolderIcon,
  Assignment as TaskIcon,
  People as PeopleIcon,
} from '@mui/icons-material';

type EmptyStateType = 'default' | 'search' | 'error' | 'projects' | 'tasks' | 'users';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const typeConfig: Record<EmptyStateType, { icon: ReactNode; title: string; description: string }> = {
  default: {
    icon: <InboxIcon sx={{ fontSize: 64 }} />,
    title: 'No items found',
    description: 'There are no items to display at the moment.',
  },
  search: {
    icon: <SearchIcon sx={{ fontSize: 64 }} />,
    title: 'No results found',
    description: 'Try adjusting your search or filter criteria.',
  },
  error: {
    icon: <ErrorIcon sx={{ fontSize: 64 }} />,
    title: 'Something went wrong',
    description: 'We encountered an error. Please try again later.',
  },
  projects: {
    icon: <FolderIcon sx={{ fontSize: 64 }} />,
    title: 'No projects yet',
    description: 'Create your first project to get started.',
  },
  tasks: {
    icon: <TaskIcon sx={{ fontSize: 64 }} />,
    title: 'No tasks yet',
    description: 'Create a task to start tracking your work.',
  },
  users: {
    icon: <PeopleIcon sx={{ fontSize: 64 }} />,
    title: 'No team members',
    description: 'Invite team members to collaborate on projects.',
  },
};

export default function EmptyState({
  type = 'default',
  title,
  description,
  icon,
  action,
  secondaryAction,
}: EmptyStateProps) {
  const config = typeConfig[type];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 4,
        minHeight: 300,
        animation: 'fadeIn 0.5s ease-out',
      }}
    >
      {/* Icon Container */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 120,
          height: 120,
          borderRadius: '50%',
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
          color: 'primary.main',
          mb: 3,
          animation: 'float 3s ease-in-out infinite',
        }}
      >
        {icon || config.icon}
      </Box>

      {/* Title */}
      <Typography 
        variant="h5" 
        fontWeight={600}
        color="text.primary"
        gutterBottom
      >
        {title || config.title}
      </Typography>

      {/* Description */}
      <Typography 
        variant="body1" 
        color="text.secondary"
        sx={{ maxWidth: 400, mb: action ? 3 : 0 }}
      >
        {description || config.description}
      </Typography>

      {/* Actions */}
      {(action || secondaryAction) && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {action && (
            <Button
              variant="contained"
              color="primary"
              onClick={action.onClick}
              sx={{ mt: 2 }}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outlined"
              color="inherit"
              onClick={secondaryAction.onClick}
              sx={{ mt: 2 }}
            >
              {secondaryAction.label}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

import { ReactNode } from 'react';
import { Box, Typography, Button, Breadcrumbs, Link as MuiLink, Skeleton } from '@mui/material';
import { type Theme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { 
  Add as AddIcon,
  NavigateNext as NavigateNextIcon 
} from '@mui/icons-material';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    variant?: 'contained' | 'outlined' | 'text';
  };
  breadcrumbs?: BreadcrumbItem[];
  children?: ReactNode;
  loading?: boolean;
}

export default function PageHeader({
  title,
  subtitle,
  action,
  breadcrumbs,
  children,
  loading = false,
}: PageHeaderProps) {
  return (
    <Box 
      sx={{ 
        mb: 4,
        animation: 'fadeInDown 0.4s ease-out',
      }}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          sx={{ mb: 2 }}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return item.href && !isLast ? (
              <MuiLink
                key={index}
                component={Link}
                to={item.href}
                underline="hover"
                color="text.secondary"
                sx={{
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                {item.label}
              </MuiLink>
            ) : (
              <Typography 
                key={index} 
                color={isLast ? 'text.primary' : 'text.secondary'}
                fontWeight={isLast ? 500 : 400}
              >
                {item.label}
              </Typography>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Header Content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Box>
          {loading ? (
            <>
              <Skeleton variant="text" width={200} height={40} />
              <Skeleton variant="text" width={300} height={24} />
            </>
          ) : (
            <>
              <Typography 
                variant="h3" 
                component="h1"
                sx={{ 
                  fontWeight: 700,
                  background: (theme: Theme) => 
                    theme.palette.mode === 'dark' 
                      ? 'linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)'
                      : 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {subtitle}
                </Typography>
              )}
            </>
          )}
        </Box>

        {action && !loading && (
          <Button
            variant={action.variant || 'contained'}
            color="primary"
            startIcon={action.icon || <AddIcon />}
            onClick={action.onClick}
            sx={{
              minWidth: { xs: '100%', sm: 'auto' },
              whiteSpace: 'nowrap',
            }}
          >
            {action.label}
          </Button>
        )}

        {children}
      </Box>
    </Box>
  );
}

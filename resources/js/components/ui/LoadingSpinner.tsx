import { Box, CircularProgress, Typography, Skeleton, type BoxProps } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';

interface LoadingSpinnerProps extends BoxProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const sizeMap = {
  small: 24,
  medium: 40,
  large: 56,
};

export default function LoadingSpinner({
  size = 'medium',
  message,
  fullScreen = false,
  overlay = false,
  ...boxProps
}: LoadingSpinnerProps) {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        ...(fullScreen && {
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
        }),
        ...(overlay && {
          position: 'absolute',
          inset: 0,
          backgroundColor: (theme: Theme) => alpha(theme.palette.background.default, 0.8),
          backdropFilter: 'blur(4px)',
          zIndex: 10,
        }),
        ...(boxProps.sx || {}),
      }}
      {...boxProps}
    >
      <Box sx={{ position: 'relative' }}>
        {/* Outer ring */}
        <CircularProgress
          variant="determinate"
          value={100}
          size={sizeMap[size]}
          thickness={3}
          sx={{
            color: (theme: Theme) => alpha(theme.palette.primary.main, 0.15),
            position: 'absolute',
          }}
        />
        {/* Animated ring */}
        <CircularProgress
          size={sizeMap[size]}
          thickness={3}
          sx={{
            color: 'primary.main',
            animationDuration: '1.2s',
          }}
        />
      </Box>
      {message && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
}

// Card skeleton for loading states
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            p: 3,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width="60%" height={28} />
            <Skeleton variant="rounded" width={80} height={24} />
          </Box>
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="75%" />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Skeleton variant="rounded" width={100} height={36} />
            <Skeleton variant="rounded" width={80} height={36} />
          </Box>
        </Box>
      ))}
    </>
  );
}

// Table skeleton for loading states
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" width={`${100 / columns}%`} height={24} />
        ))}
      </Box>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box 
          key={rowIndex} 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            py: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width={`${100 / columns}%`} height={20} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

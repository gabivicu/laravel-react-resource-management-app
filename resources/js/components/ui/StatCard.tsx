import { ReactNode } from 'react';
import { Box, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { TrendingUp as TrendUpIcon, TrendingDown as TrendDownIcon } from '@mui/icons-material';

type StatColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: StatColor;
  link?: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

const colorMap: Record<StatColor, string> = {
  primary: '#FFC107',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  secondary: '#64748B',
};

export default function StatCard({
  title,
  value,
  icon,
  color = 'primary',
  link,
  subtitle,
  trend,
  loading = false,
}: StatCardProps) {
  const accentColor = colorMap[color];

  const CardWrapper = ({ children }: { children: ReactNode }) => {
    if (link) {
      return (
        <Link to={link} style={{ textDecoration: 'none' }}>
          {children}
        </Link>
      );
    }
    return <>{children}</>;
  };

  return (
    <CardWrapper>
      <Card
        sx={{
          height: '100%',
          cursor: link ? 'pointer' : 'default',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&:hover': link ? {
            transform: 'translateY(-4px)',
            boxShadow: (theme) => theme.shadows[8],
            borderColor: alpha(accentColor, 0.5),
          } : {},
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            {/* Icon */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                backgroundColor: alpha(accentColor, 0.15),
                color: accentColor,
                transition: 'transform 0.3s ease',
                '& svg': {
                  fontSize: 24,
                },
                '.MuiCard-root:hover &': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              {icon}
            </Box>

            {/* Trend */}
            {trend && !loading && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: alpha(trend.isPositive ? '#10B981' : '#EF4444', 0.1),
                  color: trend.isPositive ? '#10B981' : '#EF4444',
                }}
              >
                {trend.isPositive ? (
                  <TrendUpIcon sx={{ fontSize: 16 }} />
                ) : (
                  <TrendDownIcon sx={{ fontSize: 16 }} />
                )}
                <Typography variant="caption" fontWeight={600}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </Typography>
              </Box>
            )}
          </Box>

          {/* Content */}
          <Box>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              fontWeight={500}
              sx={{ mb: 0.5 }}
            >
              {title}
            </Typography>

            {loading ? (
              <>
                <Skeleton variant="text" width="60%" height={48} />
                {subtitle && <Skeleton variant="text" width="40%" height={20} />}
              </>
            ) : (
              <>
                <Typography 
                  variant="h3" 
                  fontWeight={700}
                  sx={{
                    background: `linear-gradient(135deg, ${accentColor} 0%, ${alpha(accentColor, 0.7)} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </Typography>

                {subtitle && (
                  <Typography variant="caption" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </>
            )}
          </Box>

          {/* Footer */}
          {link && !loading && (
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  transition: 'color 0.2s ease',
                  '.MuiCard-root:hover &': {
                    color: accentColor,
                  },
                }}
              >
                View all →
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  );
}

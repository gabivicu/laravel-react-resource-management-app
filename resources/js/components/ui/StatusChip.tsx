import { Chip, type ChipProps } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Schedule as ScheduleIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Flag as FlagIcon,
  PriorityHigh as UrgentIcon,
  Remove as LowIcon,
  DragHandle as MediumIcon,
  KeyboardArrowUp as HighIcon,
} from '@mui/icons-material';

type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status?: ProjectStatus | TaskStatus;
  priority?: Priority;
  label?: string;
}

const statusConfig = {
  // Project statuses
  planning: { 
    label: 'Planning', 
    color: '#64748B', 
    icon: ScheduleIcon,
    bgAlpha: 0.15,
  },
  active: { 
    label: 'Active', 
    color: '#10B981', 
    icon: PlayIcon,
    bgAlpha: 0.15,
  },
  on_hold: { 
    label: 'On Hold', 
    color: '#F59E0B', 
    icon: PauseIcon,
    bgAlpha: 0.15,
  },
  completed: { 
    label: 'Completed', 
    color: '#3B82F6', 
    icon: CheckIcon,
    bgAlpha: 0.15,
  },
  cancelled: { 
    label: 'Cancelled', 
    color: '#EF4444', 
    icon: CancelIcon,
    bgAlpha: 0.15,
  },
  // Task statuses
  todo: { 
    label: 'To Do', 
    color: '#64748B', 
    icon: ScheduleIcon,
    bgAlpha: 0.15,
  },
  in_progress: { 
    label: 'In Progress', 
    color: '#3B82F6', 
    icon: PlayIcon,
    bgAlpha: 0.15,
  },
  review: { 
    label: 'Review', 
    color: '#F59E0B', 
    icon: FlagIcon,
    bgAlpha: 0.15,
  },
  done: { 
    label: 'Done', 
    color: '#10B981', 
    icon: CheckIcon,
    bgAlpha: 0.15,
  },
};

const priorityConfig = {
  low: { 
    label: 'Low', 
    color: '#64748B', 
    icon: LowIcon,
    bgAlpha: 0.15,
  },
  medium: { 
    label: 'Medium', 
    color: '#3B82F6', 
    icon: MediumIcon,
    bgAlpha: 0.15,
  },
  high: { 
    label: 'High', 
    color: '#F59E0B', 
    icon: HighIcon,
    bgAlpha: 0.15,
  },
  urgent: { 
    label: 'Urgent', 
    color: '#EF4444', 
    icon: UrgentIcon,
    bgAlpha: 0.15,
  },
};

export default function StatusChip({ 
  status, 
  priority, 
  label: customLabel,
  size = 'small',
  ...props 
}: StatusChipProps) {
  const config = status 
    ? statusConfig[status] 
    : priority 
      ? priorityConfig[priority] 
      : null;

  if (!config) {
    return (
      <Chip 
        label={customLabel || 'Unknown'} 
        size={size}
        {...props} 
      />
    );
  }

  const Icon = config.icon;

  return (
    <Chip
      icon={<Icon sx={{ fontSize: '1rem !important', color: `${config.color} !important` }} />}
      label={customLabel || config.label}
      size={size}
      sx={{
        backgroundColor: alpha(config.color, config.bgAlpha),
        color: config.color,
        fontWeight: 600,
        fontSize: '0.75rem',
        letterSpacing: '0.02em',
        borderRadius: 1.5,
        '& .MuiChip-icon': {
          marginLeft: '8px',
        },
        ...props.sx,
      }}
      {...props}
    />
  );
}

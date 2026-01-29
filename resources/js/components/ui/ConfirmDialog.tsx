import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

type DialogVariant = 'warning' | 'danger' | 'info' | 'success';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
  loading?: boolean;
}

const variantConfig: Record<DialogVariant, { icon: typeof WarningIcon; color: string }> = {
  warning: { icon: WarningIcon, color: '#F59E0B' },
  danger: { icon: DeleteIcon, color: '#EF4444' },
  info: { icon: InfoIcon, color: '#3B82F6' },
  success: { icon: SuccessIcon, color: '#10B981' },
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
  loading = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
      disablePortal
      hideBackdrop={false}
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'text.secondary',
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogTitle sx={{ pt: 4, pb: 1, textAlign: 'center' }}>
        {/* Icon */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: alpha(config.color, 0.1),
            mx: 'auto',
            mb: 2,
          }}
        >
          <Icon sx={{ fontSize: 32, color: config.color }} />
        </Box>
        {title}
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center' }}>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          sx={{
            minWidth: 100,
            backgroundColor: variant === 'danger' ? 'error.main' : 'primary.main',
            '&:hover': {
              backgroundColor: variant === 'danger' ? 'error.dark' : 'primary.dark',
            },
          }}
        >
          {loading ? 'Loading...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

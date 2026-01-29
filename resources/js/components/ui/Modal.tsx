import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close as CloseIcon } from '@mui/icons-material';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'md',
}: ModalProps) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth={maxWidth}
            fullWidth
            fullScreen={fullScreen}
            disableEnforceFocus
            disableAutoFocus
            disableRestoreFocus
            disablePortal
            disableScrollLock
            hideBackdrop={false}
            PaperProps={{
                sx: {
                    borderRadius: fullScreen ? 0 : 3,
                    maxHeight: fullScreen ? '100%' : '90vh',
                },
            }}
            TransitionProps={{
                timeout: 300,
            }}
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1300,
                        '& + *': {
                            zIndex: 1301,
                        },
                    },
                },
            }}
            sx={{
                '& .MuiDialog-container': {
                    '& > *': {
                        zIndex: 1301,
                    },
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                {title}
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        color: 'text.secondary',
                        '&:hover': {
                            color: 'text.primary',
                        },
                    }}
                    aria-label="Close modal"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent
                sx={{
                    pt: 3,
                    pb: 3,
                }}
            >
                {children}
            </DialogContent>
        </Dialog>
    );
}

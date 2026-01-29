import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Typography,
    Box,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Check as CheckIcon } from '@mui/icons-material';

interface LanguageOption {
    code: string;
    label: string;
    flag: string;
}

const languages: LanguageOption[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ro', label: 'Română', flag: '🇷🇴' },
];

export default function LanguageSelector() {
    const { i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
        handleClose();
    };

    const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

    return (
        <>
            <Tooltip title="Change language">
                <IconButton
                    onClick={handleClick}
                    sx={{
                        color: 'text.secondary',
                        backgroundColor: open 
                            ? (theme) => alpha(theme.palette.primary.main, 0.1)
                            : 'transparent',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                        }}
                    >
                        <Typography component="span" sx={{ fontSize: '1.2rem' }}>
                            {currentLanguage.flag}
                        </Typography>
                    </Box>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    sx: { minWidth: 160, mt: 1 },
                }}
            >
                <Typography
                    variant="overline"
                    sx={{
                        px: 2,
                        py: 1,
                        display: 'block',
                        color: 'text.secondary',
                        fontSize: '0.65rem',
                    }}
                >
                    Select Language
                </Typography>
                {languages.map((lang) => (
                    <MenuItem
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        selected={i18n.language === lang.code}
                    >
                        <ListItemIcon sx={{ fontSize: '1.25rem', minWidth: 36 }}>
                            {lang.flag}
                        </ListItemIcon>
                        <ListItemText>{lang.label}</ListItemText>
                        {i18n.language === lang.code && (
                            <CheckIcon fontSize="small" color="primary" />
                        )}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { alpha, useTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

interface CustomDatePickerProps {
    label: string;
    value: string | null;
    onChange: (value: string | null) => void;
    required?: boolean;
    fullWidth?: boolean;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    sx?: SxProps<Theme>;
}

export default function DatePicker({
    label,
    value,
    onChange,
    required = false,
    fullWidth = true,
    sx,
    ...props
}: CustomDatePickerProps) {
    const theme = useTheme();

    // Convert string value to Date object for DatePicker
    const dateValue = value ? new Date(value + 'T00:00:00') : null;

    // Handle date change and convert back to string format YYYY-MM-DD
    const handleChange = (newValue: Date | null) => {
        if (newValue && !isNaN(newValue.getTime())) {
            const year = newValue.getFullYear();
            const month = String(newValue.getMonth() + 1).padStart(2, '0');
            const day = String(newValue.getDate()).padStart(2, '0');
            onChange(`${year}-${month}-${day}`);
        } else {
            onChange(null);
        }
    };

    return (
        <MuiDatePicker
            label={label}
            value={dateValue}
            onChange={handleChange}
            slotProps={{
                textField: {
                    fullWidth,
                    required,
                    variant: 'outlined',
                    sx: [
                        {
                            '& .MuiOutlinedInput-root': {
                                borderRadius: theme.shape.borderRadius || 8,
                                backgroundColor: theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.background.paper, 0.8)
                                    : theme.palette.background.paper,
                                '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark'
                                        ? alpha(theme.palette.background.paper, 0.9)
                                        : alpha(theme.palette.primary.main, 0.02),
                                },
                                '&.Mui-focused': {
                                    backgroundColor: theme.palette.mode === 'dark'
                                        ? theme.palette.background.paper
                                        : theme.palette.background.paper,
                                },
                            },
                        },
                        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
                    ],
                },
                popper: {
                    placement: 'bottom-start',
                    disablePortal: true, // Prevents aria-hidden issue - render in the same DOM tree
                    modifiers: [
                        {
                            name: 'preventOverflow',
                            options: {
                                rootBoundary: 'viewport',
                                tether: false,
                                altAxis: true,
                            },
                        },
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 8],
                            },
                        },
                    ],
                    sx: {
                        zIndex: 1400, // Ensure it's above modals (which have z-index 1300)
                        '& .MuiPaper-root': {
                            borderRadius: 4, // Reduced from 8 to 4 for less rounded corners
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow: theme.shadows[8],
                        },
                        '& .MuiPickersCalendarHeader-root': {
                            backgroundColor: theme.palette.mode === 'dark'
                                ? alpha(theme.palette.background.paper, 0.8)
                                : theme.palette.background.paper,
                        },
                        '& .MuiDayCalendar-weekContainer': {
                            '& .MuiPickersDay-root': {
                                borderRadius: 4, // Reduced from 8 to 4 for less rounded corners
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                },
                                '&.Mui-selected': {
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.dark,
                                    },
                                },
                            },
                        },
                    },
                },
                field: {
                    clearable: false,
                },
            }}
            {...props}
        />
    );
}

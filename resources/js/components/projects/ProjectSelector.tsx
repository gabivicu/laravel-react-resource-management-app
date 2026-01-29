import { useState, useEffect, useRef, useMemo, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projects';
import useDebounce from '@/hooks/useDebounce';
import type { Project } from '@/types';
import {
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Typography,
  Popper,
  ClickAwayListener,
  Fade,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import StatusChip from '@/components/ui/StatusChip';

interface ProjectSelectorProps {
    value?: string | number;
    onChange: (projectId: string) => void;
    label?: string;
    error?: string;
    disabled?: boolean;
    initialProject?: Project; // Pass initial project object to avoid extra fetch
    containerSx?: object; // Allow overriding container styles
}

export default function ProjectSelector({ 
    value, 
    onChange, 
    label = "Project", 
    error, 
    disabled = false,
    initialProject,
    containerSx
}: ProjectSelectorProps) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProject, setSelectedProject] = useState<Project | null>(initialProject || null);
    const [open, setOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const anchorRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const debouncedSearch = useDebounce(searchQuery, 300);

    // Update selected project when initialProject changes (e.g. data load)
    useEffect(() => {
        if (initialProject) {
            setSelectedProject(initialProject);
            setSearchQuery(initialProject.name);
        }
    }, [initialProject]);

    // Fetch project details if we have an ID but no object (and no initialProject)
    // This handles the case where we might edit a task but don't have the full project object passed down yet
    const { data: fetchedProject } = useQuery({
        queryKey: ['project', value],
        queryFn: () => projectService.getProject(Number(value)),
        enabled: !!value && !selectedProject && !initialProject,
    });

    useEffect(() => {
        if (fetchedProject) {
            setSelectedProject(fetchedProject);
            setSearchQuery(fetchedProject.name);
        }
    }, [fetchedProject]);

    // Fetch suggestions based on search
    const { data: suggestionsData, isLoading } = useQuery({
        queryKey: ['projects-suggestions', debouncedSearch],
        queryFn: () => projectService.getProjects({ search: debouncedSearch }, 1, 5),
        enabled: debouncedSearch.length > 1 && !selectedProject && open,
    });

    const suggestions = useMemo(() => suggestionsData?.data || [], [suggestionsData?.data]);
    const showSuggestions = open && suggestions.length > 0 && !selectedProject;

    // Reset keyboard index when suggestions change
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [suggestions]);

    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions) {
            if (e.key === 'ArrowDown' && debouncedSearch.length > 1) {
                setOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) => {
                    const next = prev < suggestions.length - 1 ? prev + 1 : prev;
                    scrollToIndex(next);
                    return next;
                });
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) => {
                    const next = prev > 0 ? prev - 1 : -1;
                    scrollToIndex(next);
                    return next;
                });
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
                    handleSelect(suggestions[highlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    // Scroll to highlighted item
    const scrollToIndex = (index: number) => {
        if (listRef.current && index >= 0) {
            const items = listRef.current.querySelectorAll('[role="option"]');
            items[index]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    };

    const handleSelect = (project: Project) => {
        setSelectedProject(project);
        setSearchQuery(project.name);
        setOpen(false);
        setHighlightedIndex(-1);
        onChange(project.id.toString());
    };

    const handleClear = () => {
        setSelectedProject(null);
        setSearchQuery('');
        onChange('');
        setOpen(true); // Re-open suggestions to allow new search
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (selectedProject && e.target.value !== selectedProject.name) {
            setSelectedProject(null); // Clear selection if user modifies text
            onChange('');
        }
        setOpen(true);
        setHighlightedIndex(-1);
    };

    return (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
            <Box sx={{ mb: 3, ...containerSx }} ref={anchorRef}>
                <TextField
                    inputProps={{ "data-testid": "project-selector-input" }}
                    fullWidth
                    label={label}
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setOpen(true)}
                    disabled={disabled}
                    placeholder={t('projects.searchProjects')}
                    error={!!error}
                    helperText={error}
                    InputLabelProps={{
                        sx: {
                            color: 'text.primary',
                            top: '-2px', // Adjust label position for more space
                            '&.Mui-focused': {
                                color: 'text.primary',
                            },
                            '&.MuiInputLabel-shrink': {
                                color: 'text.primary',
                            },
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                {isLoading && !selectedProject && debouncedSearch.length > 1 ? (
                                    <CircularProgress size={20} />
                                ) : selectedProject && !disabled ? (
                                    <IconButton
                                        size="small"
                                        onClick={handleClear}
                                        edge="end"
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        <CloseIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                ) : null}
                            </InputAdornment>
                        ),
                    }}
                />

                <Popper
                    open={showSuggestions}
                    anchorEl={anchorRef.current}
                    placement="bottom-start"
                    transition
                    style={{ width: anchorRef.current?.clientWidth, zIndex: 1300 }}
                >
                    {({ TransitionProps }) => (
                        <Fade {...TransitionProps} timeout={200}>
                            <Paper
                                elevation={8}
                                sx={{
                                    mt: 0.5,
                                    maxHeight: 300,
                                    overflow: 'auto',
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                {isLoading ? (
                                    <Box sx={{ p: 2, textAlign: 'center' }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : (
                                    <List ref={listRef} dense disablePadding>
                                        {suggestions.map((project, index) => (
                                            <ListItemButton
                                                key={project.id}
                                                role="option"
                                                selected={index === highlightedIndex}
                                                onClick={() => handleSelect(project)}
                                                sx={{
                                                    py: 1.5,
                                                    px: 2,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    '&.Mui-selected': {
                                                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                                                        borderLeft: 2,
                                                        borderColor: 'primary.main',
                                                    },
                                                }}
                                            >
                                                <ListItemText
                                                    primary={project.name}
                                                    primaryTypographyProps={{
                                                        fontWeight: index === highlightedIndex ? 600 : 400,
                                                    }}
                                                />
                                                <StatusChip status={project.status} size="small" />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                )}
                            </Paper>
                        </Fade>
                    )}
                </Popper>

                {open && debouncedSearch.length > 1 && suggestions.length === 0 && !isLoading && !selectedProject && (
                    <Popper
                        open={true}
                        anchorEl={anchorRef.current}
                        placement="bottom-start"
                        transition
                        style={{ width: anchorRef.current?.clientWidth, zIndex: 1300 }}
                    >
                        {({ TransitionProps }) => (
                            <Fade {...TransitionProps} timeout={200}>
                                <Paper
                                    elevation={8}
                                    sx={{
                                        mt: 0.5,
                                        border: 1,
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Box sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {t('projects.noProjectsFound')}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Fade>
                        )}
                    </Popper>
                )}
            </Box>
        </ClickAwayListener>
    );
}

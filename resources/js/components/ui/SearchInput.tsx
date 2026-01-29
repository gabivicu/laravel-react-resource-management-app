import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Typography,
  Popper,
  ClickAwayListener,
  Fade,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';

interface SearchSuggestion {
  id: number | string;
  label: string;
  secondary?: string;
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: SearchSuggestion) => void;
  suggestions?: SearchSuggestion[];
  placeholder?: string;
  loading?: boolean;
  fullWidth?: boolean;
}

export default function SearchInput({
  value,
  onChange,
  onSelect,
  suggestions = [],
  placeholder = 'Search...',
  loading = false,
  fullWidth = true,
}: SearchInputProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const anchorRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const showSuggestions = open && suggestions.length > 0;

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (e.key === 'ArrowDown' && value.length > 1) {
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

  const scrollToIndex = (index: number) => {
    if (listRef.current && index >= 0) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[index]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  };

  const handleSelect = (item: SearchSuggestion) => {
    onChange(item.label);
    setOpen(false);
    setHighlightedIndex(-1);
    onSelect?.(item);
  };

  const handleClear = () => {
    onChange('');
    setOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box ref={anchorRef} sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
        <TextField
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          fullWidth={fullWidth}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: value && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClear} edge="end">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: (theme) => 
                theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.background.paper, 0.8)
                  : theme.palette.background.paper,
            },
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
                {loading ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading...
                    </Typography>
                  </Box>
                ) : (
                  <List ref={listRef} dense disablePadding>
                    {suggestions.map((item, index) => (
                      <ListItemButton
                        key={item.id}
                        role="option"
                        selected={index === highlightedIndex}
                        onClick={() => handleSelect(item)}
                        sx={{
                          py: 1.5,
                          px: 2,
                          '&.Mui-selected': {
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                            borderLeft: 2,
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <ListItemText
                          primary={item.label}
                          secondary={item.secondary}
                          primaryTypographyProps={{
                            fontWeight: index === highlightedIndex ? 600 : 400,
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}

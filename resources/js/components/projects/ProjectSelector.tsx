import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projects';
import useDebounce from '@/hooks/useDebounce';
import type { Project } from '@/types';

interface ProjectSelectorProps {
    value?: string | number;
    onChange: (projectId: string) => void;
    label?: string;
    error?: string;
    disabled?: boolean;
    initialProject?: Project; // Pass initial project object to avoid extra fetch
}

export default function ProjectSelector({ 
    value, 
    onChange, 
    label = "Project", 
    error, 
    disabled = false,
    initialProject 
}: ProjectSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProject, setSelectedProject] = useState<Project | null>(initialProject || null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [keyboardIndex, setKeyboardIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const suggestionsListRef = useRef<HTMLUListElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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
        enabled: debouncedSearch.length > 1 && !selectedProject && showSuggestions,
    });

    const suggestions = suggestionsData?.data || [];

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
                setKeyboardIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset keyboard index when suggestions change
    useEffect(() => {
        setKeyboardIndex(-1);
    }, [suggestions]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || suggestions.length === 0) {
            if (e.key === 'ArrowDown' && debouncedSearch.length > 1) {
                setShowSuggestions(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setKeyboardIndex((prev) => {
                    const nextIndex = prev < suggestions.length - 1 ? prev + 1 : prev;
                    scrollToIndex(nextIndex);
                    return nextIndex;
                });
                break;
            case 'ArrowUp':
                e.preventDefault();
                setKeyboardIndex((prev) => {
                    const nextIndex = prev > 0 ? prev - 1 : -1;
                    scrollToIndex(nextIndex);
                    return nextIndex;
                });
                break;
            case 'Enter':
                e.preventDefault();
                if (keyboardIndex >= 0 && keyboardIndex < suggestions.length) {
                    handleSelect(suggestions[keyboardIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowSuggestions(false);
                setKeyboardIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    // Scroll to highlighted item
    const scrollToIndex = (index: number) => {
        if (suggestionsListRef.current && index >= 0) {
            const items = suggestionsListRef.current.querySelectorAll('li');
            const item = items[index];
            if (item) {
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    };

    const handleSelect = (project: Project) => {
        setSelectedProject(project);
        setSearchQuery(project.name);
        setShowSuggestions(false);
        setKeyboardIndex(-1);
        onChange(project.id.toString());
    };

    const handleClear = () => {
        setSelectedProject(null);
        setSearchQuery('');
        onChange('');
        setShowSuggestions(true); // Re-open suggestions to allow new search
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (selectedProject && e.target.value !== selectedProject.name) {
            setSelectedProject(null); // Clear selection if user modifies text
            onChange('');
        }
        setShowSuggestions(true);
        setKeyboardIndex(-1);
    };

    return (
        <div className="mb-4 relative" ref={containerRef}>
            <label className="block text-sm font-medium mb-2">{label}</label>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    disabled={disabled}
                    placeholder="Search for a project..."
                    className={`w-full px-3 py-2 border rounded-lg pr-8 ${
                        error ? 'border-red-500' : 'border-gray-300'
                    } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                
                {selectedProject && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {isLoading && !selectedProject && debouncedSearch.length > 1 && (
                    <div className="absolute right-2 top-2.5 text-gray-400">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                )}
            </div>

            {showSuggestions && suggestions.length > 0 && !selectedProject && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <ul ref={suggestionsListRef}>
                        {suggestions.map((project, index) => (
                            <li
                                key={project.id}
                                onClick={() => handleSelect(project)}
                                className={`px-4 py-2 cursor-pointer text-sm text-gray-700 flex justify-between items-center ${
                                    index === keyboardIndex 
                                        ? 'bg-blue-50 border-l-2 border-blue-500' 
                                        : 'hover:bg-gray-50'
                                }`}
                            >
                                <span>{project.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600`}>
                                    {project.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {showSuggestions && debouncedSearch.length > 1 && suggestions.length === 0 && !isLoading && !selectedProject && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
                    No projects found.
                </div>
            )}

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}

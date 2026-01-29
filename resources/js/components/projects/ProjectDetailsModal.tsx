import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { projectService } from '@/services/projects';
import { taskService } from '@/services/tasks';
import Modal from '@/components/ui/Modal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Button,
    CircularProgress,
    Avatar,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ViewKanban as KanbanIcon } from '@mui/icons-material';
import StatusChip from '@/components/ui/StatusChip';
import EmptyState from '@/components/ui/EmptyState';

interface ProjectDetailsModalProps {
    projectId: number;
    isOpen: boolean;
    onClose: () => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`project-tabpanel-${index}`}
            aria-labelledby={`project-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

export default function ProjectDetailsModal({ projectId, isOpen, onClose }: ProjectDetailsModalProps) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();

    const { data: project, isLoading: isLoadingProject } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => projectService.getProject(projectId),
        enabled: isOpen && projectId > 0,
    });

    const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
        queryKey: ['project-tasks', projectId],
        queryFn: () => taskService.getTasks({ project_id: projectId }, 1, 100),
        enabled: isOpen && activeTab === 1 && projectId > 0,
    });

    const tasks = tasksData?.data || [];

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={project ? project.name : t('common.loading')}>
            {isLoadingProject ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <CircularProgress />
                </Box>
            ) : project ? (
                <Box>
                    {/* Header Summary */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            mb: 3,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 2,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.5),
                            border: 1,
                            borderColor: 'divider',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <StatusChip status={project.status} />
                            <Typography variant="body2" color="text.secondary">
                                <Typography component="span" fontWeight={600} color="text.primary">
                                    {t('projects.budgetLabel')}:
                                </Typography>{' '}
                                ${project.budget?.toLocaleString() || '0'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <Typography component="span" fontWeight={600} color="text.primary">
                                    {t('projects.timeline')}:
                                </Typography>{' '}
                                {formatDate(project.start_date)} - {formatDate(project.end_date)}
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<KanbanIcon />}
                            onClick={() => navigate(`/tasks/kanban?project_id=${projectId}`)}
                            size="small"
                        >
                            {t('projects.kanbanBoard')}
                        </Button>
                    </Paper>

                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                            <Tab label={t('projects.overview')} />
                            <Tab label={t('projects.tasks')} />
                            <Tab label={t('projects.members')} />
                        </Tabs>
                    </Box>

                    {/* Tab Content */}
                    <Box sx={{ minHeight: 200 }}>
                        <TabPanel value={activeTab} index={0}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                        {t('projects.description')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                        {project.description || t('projects.noDescriptionProvided')}
                                    </Typography>
                                </Box>

                                {project.settings && Object.keys(project.settings).length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                            {t('projects.additionalSettings')}
                                        </Typography>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.5),
                                                border: 1,
                                                borderColor: 'divider',
                                                overflow: 'auto',
                                            }}
                                        >
                                            <Typography
                                                component="pre"
                                                variant="caption"
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    color: 'text.secondary',
                                                    m: 0,
                                                }}
                                            >
                                                {JSON.stringify(project.settings, null, 2)}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                )}
                            </Box>
                        </TabPanel>

                        <TabPanel value={activeTab} index={1}>
                            {isLoadingTasks ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : tasks.length === 0 ? (
                                <EmptyState type="tasks" description={t('projects.noTasksFoundForProject')} />
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                        maxHeight: 400,
                                        overflowY: 'auto',
                                        pr: 1,
                                    }}
                                >
                                    {tasks.map((task) => (
                                        <Paper
                                            key={task.id}
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                border: 1,
                                                borderColor: 'divider',
                                                '&:hover': {
                                                    boxShadow: 2,
                                                },
                                                transition: 'box-shadow 0.2s',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {task.title}
                                                </Typography>
                                                <StatusChip status={task.status} size="small" />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <StatusChip priority={task.priority} size="small" />
                                                <Typography variant="caption" color="text.secondary">
                                                    {t('tasks.dueDate')}: {formatDate(task.due_date)}
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Box>
                            )}
                        </TabPanel>

                        <TabPanel value={activeTab} index={2}>
                            {project.members && project.members.length > 0 ? (
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                    {project.members.map((member) => (
                                        <Paper
                                            key={member.id}
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                border: 1,
                                                borderColor: 'divider',
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    mr: 1.5,
                                                    bgcolor: 'primary.main',
                                                    fontSize: '0.75rem',
                                                }}
                                            >
                                                {member.name.substring(0, 2).toUpperCase()}
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {member.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {member.email}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                    {t('projects.role')}: {member.pivot?.role || t('projects.member')}
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Box>
                            ) : (
                                <EmptyState type="users" description={t('projects.noMembersAssigned')} />
                            )}
                        </TabPanel>
                    </Box>
                </Box>
            ) : (
                <Box sx={{ p: 2 }}>
                    <Typography color="error">{t('projects.projectNotFound')}</Typography>
                </Box>
            )}
        </Modal>
    );
}

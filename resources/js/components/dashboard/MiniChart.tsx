import { Card, CardContent, Typography, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface ChartData {
    label: string;
    value: number;
}

interface MiniChartProps {
    data: ChartData[];
    title: string;
}

// Colors for different statuses/labels
const colorMap: Record<string, string> = {
    // Task statuses
    todo: '#64748B',
    in_progress: '#3B82F6',
    review: '#F59E0B',
    done: '#10B981',
    // Project statuses
    planning: '#64748B',
    active: '#10B981',
    on_hold: '#F59E0B',
    completed: '#3B82F6',
    cancelled: '#EF4444',
    // Priorities
    low: '#64748B',
    medium: '#3B82F6',
    high: '#F59E0B',
    urgent: '#EF4444',
};

const getColor = (label: string, index: number): string => {
    const normalizedLabel = label.toLowerCase().replace(/\s+/g, '_');
    if (colorMap[normalizedLabel]) {
        return colorMap[normalizedLabel];
    }
    // Fallback colors
    const fallbackColors = ['#FFC107', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    return fallbackColors[index % fallbackColors.length];
};

const formatLabel = (label: string): string => {
    return label
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export default function MiniChart({ data, title }: MiniChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const maxValue = Math.max(...data.map((item) => item.value));

    if (total === 0) {
        return (
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        {title}
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 200,
                            color: 'text.secondary',
                        }}
                    >
                        No data available
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    {title}
                </Typography>

                {/* Donut Chart Visualization */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        my: 3,
                    }}
                >
                    <Box sx={{ position: 'relative', width: 140, height: 140 }}>
                        <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                            {data.reduce(
                                (acc, item, index) => {
                                    const percentage = (item.value / total) * 100;
                                    const strokeDasharray = `${percentage * 2.51327} ${251.327}`;
                                    const strokeDashoffset = -acc.offset;
                                    acc.elements.push(
                                        <circle
                                            key={item.label}
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke={getColor(item.label, index)}
                                            strokeWidth="12"
                                            strokeDasharray={strokeDasharray}
                                            strokeDashoffset={strokeDashoffset}
                                            style={{
                                                transition: 'stroke-dasharray 0.5s ease',
                                            }}
                                        />
                                    );
                                    acc.offset += percentage * 2.51327;
                                    return acc;
                                },
                                { elements: [] as React.ReactElement[], offset: 0 }
                            ).elements}
                        </svg>
                        {/* Center text */}
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography variant="h4" fontWeight={700}>
                                {total}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Total
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Legend with bars */}
                <Box sx={{ space: 2 }}>
                    {data.map((item, index) => {
                        const color = getColor(item.label, index);
                        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

                        return (
                            <Box key={item.label} sx={{ mb: 1.5 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 0.5,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: '50%',
                                                backgroundColor: color,
                                            }}
                                        />
                                        <Typography variant="body2" fontWeight={500}>
                                            {formatLabel(item.label)}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight={600}>
                                        {item.value}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: alpha(color, 0.15),
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            height: '100%',
                                            width: `${percentage}%`,
                                            borderRadius: 3,
                                            backgroundColor: color,
                                            transition: 'width 0.5s ease',
                                        }}
                                    />
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </CardContent>
        </Card>
    );
}

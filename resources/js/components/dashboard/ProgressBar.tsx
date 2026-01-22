interface ProgressBarProps {
    label: string;
    value: number;
    max: number;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
    showPercentage?: boolean;
}

const barColors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
};

export default function ProgressBar({ label, value, max, color = 'blue', showPercentage = true }: ProgressBarProps) {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
                {showPercentage && (
                    <span className="text-gray-600 dark:text-gray-400">{Math.round(percentage)}%</span>
                )}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div
                    className={`h-full ${barColors[color]} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

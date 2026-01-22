interface MiniChartProps {
    data: Array<{ label: string; value: number; color?: string }>;
    title: string;
}

export default function MiniChart({ data, title }: MiniChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const maxValue = Math.max(...data.map((item) => item.value), 1);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
            <div className="space-y-4">
                {data.map((item, index) => {
                    const percentage = total > 0 ? (item.value / total) * 100 : 0;
                    const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                    const color = item.color || `hsl(${(index * 360) / data.length}, 70%, 50%)`;

                    return (
                        <div key={item.label} className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                                    {item.label.replace('_', ' ')}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600 dark:text-gray-400">{item.value}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-500">
                                        ({Math.round(percentage)}%)
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500 ease-out"
                                    style={{
                                        width: `${barWidth}%`,
                                        backgroundColor: color,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

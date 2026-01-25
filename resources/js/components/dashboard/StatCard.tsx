import { Link } from 'react-router-dom';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: ReactNode;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
    link?: string;
    subtitle?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

const iconBgClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    orange: 'bg-orange-100 dark:bg-orange-900/30',
    pink: 'bg-pink-100 dark:bg-pink-900/30',
};

const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400',
    pink: 'text-pink-600 dark:text-pink-400',
};

export default function StatCard({ title, value, icon, color, link, subtitle, trend }: StatCardProps) {
    const { t } = useTranslation();
    const content = (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700 group">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${iconBgClasses[color]} transition-transform group-hover:scale-110`}>
                    <div className={iconColorClasses[color]}>{icon}</div>
                </div>
                {trend && (
                    <div className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
                {subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
                )}
            </div>
            {link && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {t('dashboard.viewAll')} →
                    </span>
                </div>
            )}
        </div>
    );

    if (link) {
        return <Link to={link}>{content}</Link>;
    }

    return content;
}

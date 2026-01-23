import Modal from '@/components/ui/Modal';
import type { Task } from '@/types';

interface TaskDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    task: Task | null;
    isDeleting: boolean;
}

const statusColors = {
    todo: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    review: 'bg-yellow-100 text-yellow-800',
    done: 'bg-green-100 text-green-800',
};

const priorityColors = {
    low: 'bg-gray-200 text-gray-700',
    medium: 'bg-blue-200 text-blue-700',
    high: 'bg-orange-200 text-orange-700',
    urgent: 'bg-red-200 text-red-700',
};

export default function TaskDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    task,
    isDeleting,
}: TaskDeleteModalProps) {
    if (!task) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Task">
            <div className="space-y-4">
                <p className="text-gray-600">
                    Are you sure you want to delete this task? This action cannot be undone.
                </p>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="mb-2">
                        <span className="text-sm font-medium text-gray-500">Title:</span>
                        <p className="text-gray-900 font-medium">{task.title}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm font-medium text-gray-500">Status:</span>
                            <div className="mt-1">
                                <span className={`px-2 py-1 text-xs rounded ${statusColors[task.status]}`}>
                                    {task.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-500">Priority:</span>
                            <div className="mt-1">
                                <span className={`px-2 py-1 text-xs rounded ${priorityColors[task.priority]}`}>
                                    {task.priority}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <span className="animate-spin -ml-1 mr-2 h-4 w-4 text-white">
                                    <svg className="opacity-75" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </span>
                                Deleting...
                            </>
                        ) : (
                            'Delete Task'
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

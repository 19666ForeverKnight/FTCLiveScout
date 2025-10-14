'use client';

import { createT } from '@/lib/simple-i18n';
const t = createT('checklists/page')
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEvent } from '@/context/EventContext';
import { Navigation } from '@/components/Navigation';
import {
    getChecklists,
    getChecklistByRole,
    initializeChecklists,
    createChecklist,
    updateChecklist,
    parseItems,
    Checklist,
    ChecklistItem,
    ChecklistRole,
} from '@/lib/checklists';
import { getUserRole } from '@/lib/events';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function ChecklistsPage() {
    const { user, loading } = useRequireAuth();
    const { currentEvent } = useEvent();
    const router = useRouter();
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && user && !currentEvent) {
            router.push('/events');
        }
    }, [user, loading, currentEvent, router]);

    useEffect(() => {
        if (currentEvent && user) {
            const role = getUserRole(currentEvent, user.$id);
            setUserRole(role);
            loadChecklists();
        }
    }, [currentEvent, user]);

    const loadChecklists = async () => {
        if (!currentEvent || !user) return;

        try {
            setLoadingData(true);

            // Get user's role
            const role = getUserRole(currentEvent, user.$id);

            // Determine which checklist to load based on role
            let targetRole: ChecklistRole | null = null;
            if (role === 'driver') targetRole = 'driver';
            else if (role === 'engineer') targetRole = 'engineer';
            else if (role === 'technician') targetRole = 'technician';
            else if (role === 'admin') {
                // Admin sees all three checklists - load or create each one
                const roles: ChecklistRole[] = ['driver', 'engineer', 'technician'];
                const loadedChecklists: Checklist[] = [];

                for (const targetRole of roles) {
                    let checklist = await getChecklistByRole(currentEvent.$id, targetRole);
                    if (!checklist) {
                        checklist = await createChecklist(currentEvent.$id, targetRole, user.$id, user.name);
                    }
                    if (checklist) {
                        loadedChecklists.push(checklist);
                    }
                }

                setChecklists(loadedChecklists);
                setLoadingData(false);
                return;
            }

            if (targetRole) {
                // Load or create only the user's specific checklist
                let checklist = await getChecklistByRole(currentEvent.$id, targetRole);
                if (!checklist) {
                    checklist = await createChecklist(currentEvent.$id, targetRole, user.$id, user.name);
                }
                if (checklist) {
                    setChecklists([checklist]);
                }
            } else {
                // Scouter and viewer don't see checklists
                setChecklists([]);
            }
        } catch (error) {
            console.error(t('Error loading checklists:'), error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleToggleItem = async (
        checklistId: string,
        itemId: string,
        currentItems: ChecklistItem[]
    ) => {
        if (!user) return;

        // Optimistic update - update UI immediately
        const updatedItems = currentItems.map(item => {
            if (item.id === itemId) {
                const newCompleted = !item.completed;
                return {
                    ...item,
                    completed: newCompleted,
                    completedBy: newCompleted ? user.$id : undefined,
                    completedByName: newCompleted ? user.name : undefined,
                    completedAt: newCompleted ? new Date().toISOString() : undefined,
                };
            }
            return item;
        });

        // Update local state immediately
        setChecklists(prevChecklists =>
            prevChecklists.map(c =>
                c.$id === checklistId ? { ...c, items: JSON.stringify(updatedItems) } : c
            )
        );

        // Save to database in background
        try {
            await updateChecklist(checklistId, updatedItems, user.$id, user.name);
        } catch (error) {
            console.error(t('Error toggling item:'), error);
            alert(t('Failed to update checklist. Please try again.'));
            // Reload to get correct state on error
            await loadChecklists();
        }
    };

    const handleAddItem = async (checklistId: string, currentItems: ChecklistItem[], text: string) => {
        if (!user || !text.trim()) return;

        const newItem: ChecklistItem = {
            id: `item-${Date.now()}`,
            text: text.trim(),
            completed: false,
        };

        const updatedItems = [...currentItems, newItem];

        // Update local state immediately
        setChecklists(prevChecklists =>
            prevChecklists.map(c =>
                c.$id === checklistId ? { ...c, items: JSON.stringify(updatedItems) } : c
            )
        );

        // Save to database in background
        try {
            await updateChecklist(checklistId, updatedItems, user.$id, user.name);
        } catch (error) {
            console.error(t('Error adding item:'), error);
            alert(t('Failed to add item. Please try again.'));
            // Reload to get correct state on error
            await loadChecklists();
        }
    };

    const handleDeleteItem = async (
        checklistId: string,
        itemId: string,
        currentItems: ChecklistItem[]
    ) => {
        if (!user) return;

        const updatedItems = currentItems.filter(item => item.id !== itemId);

        // Update local state immediately
        setChecklists(prevChecklists =>
            prevChecklists.map(c =>
                c.$id === checklistId ? { ...c, items: JSON.stringify(updatedItems) } : c
            )
        );

        // Save to database in background
        try {
            await updateChecklist(checklistId, updatedItems, user.$id, user.name);
        } catch (error) {
            console.error(t('Error deleting item:'), error);
            alert(t('Failed to delete item. Please try again.'));
            // Reload to get correct state on error
            await loadChecklists();
        }
    };

    const handleClearChecklist = async (checklistId: string, currentItems: ChecklistItem[]) => {
        if (!user) return;

        // Confirm before clearing
        if (!confirm(t(
            'Clear all completed items? This will uncheck all items but keep them in the list.'
        ))) {
            return;
        }

        // Uncheck all items
        const clearedItems = currentItems.map(item => ({
            ...item,
            completed: false,
            completedBy: undefined,
            completedByName: undefined,
            completedAt: undefined,
        }));

        // Update local state immediately
        setChecklists(prevChecklists =>
            prevChecklists.map(c =>
                c.$id === checklistId ? { ...c, items: JSON.stringify(clearedItems) } : c
            )
        );

        // Save to database in background
        try {
            await updateChecklist(checklistId, clearedItems, user.$id, user.name);
        } catch (error) {
            console.error(t('Error clearing checklist:'), error);
            alert(t('Failed to clear checklist. Please try again.'));
            // Reload to get correct state on error
            await loadChecklists();
        }
    };

    const getRoleDisplayName = (role: ChecklistRole) => {
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    const getRoleColor = (role: ChecklistRole) => {
        const colors = {
            driver: 'from-blue-500 to-blue-600',
            engineer: 'from-purple-500 to-purple-600',
            technician: 'from-green-500 to-green-600',
        };
        return colors[role];
    };

    const getRoleIcon = (role: ChecklistRole) => {
        const icons = {
            driver: '🎮',
            engineer: '⚙️',
            technician: '🔧',
        };
        return icons[role];
    };

    if (loading || loadingData) {
        return (
            (<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="text-lg text-gray-900 dark:text-gray-100">{t('Loading...')}</div>
            </div>)
        );
    }

    if (!user || !currentEvent) {
        return null;
    }

    // Check if user has access to checklists
    if (!userRole || (userRole !== 'admin' && userRole !== 'driver' && userRole !== 'engineer' && userRole !== 'technician')) {
        return (
            (<div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                <Navigation />
                <main className="lg:pl-64 pb-20 lg:pb-8">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                {t('Access Restricted')}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {t('You don\'t have permission to view checklists for this event.')}
                            </p>
                        </div>
                    </div>
                </main>
            </div>)
        );
    }

    return (
        (<div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navigation />
            <main className="lg:pl-64 pb-20 lg:pb-8">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {userRole === 'admin' ? t('Event Checklists') : `${userRole?.charAt(0).toUpperCase()}${userRole?.slice(1)} ${t('Checklist')}`}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {currentEvent.name}
                        </p>
                        {userRole === 'admin' ? (
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                {t('As an admin, you can view and manage all three role checklists')}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                {t('Manage your personal checklist • Updates save automatically')}
                            </p>
                        )}
                    </div>

                    {/* Checklists */}
                    {checklists.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 dark:text-gray-400">
                                {t('No checklists available')}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {checklists.map(checklist => (
                                <ChecklistCard
                                    key={checklist.$id}
                                    checklist={checklist}
                                    onToggleItem={handleToggleItem}
                                    onAddItem={handleAddItem}
                                    onDeleteItem={handleDeleteItem}
                                    onClearChecklist={handleClearChecklist}
                                    getRoleDisplayName={getRoleDisplayName}
                                    getRoleColor={getRoleColor}
                                    getRoleIcon={getRoleIcon}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>)
    );
}

interface ChecklistCardProps {
    checklist: Checklist;
    onToggleItem: (checklistId: string, itemId: string, items: ChecklistItem[]) => void;
    onAddItem: (checklistId: string, items: ChecklistItem[], text: string) => void;
    onDeleteItem: (checklistId: string, itemId: string, items: ChecklistItem[]) => void;
    onClearChecklist: (checklistId: string, items: ChecklistItem[]) => void;
    getRoleDisplayName: (role: ChecklistRole) => string;
    getRoleColor: (role: ChecklistRole) => string;
    getRoleIcon: (role: ChecklistRole) => string;
}

function ChecklistCard({
    checklist,
    onToggleItem,
    onAddItem,
    onDeleteItem,
    onClearChecklist,
    getRoleDisplayName,
    getRoleColor,
    getRoleIcon,
}: ChecklistCardProps) {
    const [newItemText, setNewItemText] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const items = parseItems(checklist.items);
    const completedCount = items.filter(item => item.completed).length;
    const totalCount = items.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const handleSubmitNewItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemText.trim()) {
            onAddItem(checklist.$id, items, newItemText);
            setNewItemText('');
            setShowAddForm(false);
        }
    };

    return (
        (<div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className={`bg-gradient-to-r ${getRoleColor(checklist.role)} p-4`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{getRoleIcon(checklist.role)}</span>
                        <h3 className="text-xl font-bold text-white">
                            {getRoleDisplayName(checklist.role)}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-white text-sm font-medium">
                            {completedCount}/{totalCount}
                        </div>
                        {completedCount > 0 && (
                            <button
                                onClick={() => onClearChecklist(checklist.$id, items)}
                                className="text-white/90 hover:text-white hover:bg-white/20 rounded-lg px-2 py-1 text-xs font-medium transition-colors"
                                title={t('Clear all checkmarks for next match')}
                            >
                                {t('Clear')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-white h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
            {/* Items */}
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {items.map(item => (
                    <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                        <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => onToggleItem(checklist.$id, item.id, items)}
                            className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                            <p
                                className={`text-sm ${item.completed
                                    ? 'line-through text-gray-500 dark:text-gray-500'
                                    : 'text-gray-900 dark:text-gray-100'
                                    }`}
                            >
                                {item.text}
                            </p>
                            {item.completed && item.completedByName && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    ✓ {item.completedByName}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => onDeleteItem(checklist.$id, item.id, items)}
                            className="flex-shrink-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors lg:opacity-0 lg:group-hover:opacity-100 lg:transition-opacity"
                            title={t('Delete item')}
                            aria-label={t('Delete item')}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
            {/* Add Item Form */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                {showAddForm ? (
                    <form onSubmit={handleSubmitNewItem} className="space-y-2">
                        <input
                            type="text"
                            value={newItemText}
                            onChange={e => setNewItemText(e.target.value)}
                            placeholder={t('Enter new checklist item...')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={!newItemText.trim()}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                {t('Add')}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewItemText('');
                                }}
                                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
                            >
                                {t('Cancel')}
                            </button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm font-medium"
                    >
                        {t('+ Add Item')}
                    </button>
                )}
            </div>
            {/* Footer */}
            {checklist.lastEditedByName && (
                <div className="px-4 pb-3 text-xs text-gray-500 dark:text-gray-500">
                    {t('Last edited by')} {checklist.lastEditedByName}
                </div>
            )}
        </div>)
    );
}

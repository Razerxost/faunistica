import { type FC } from "react";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, X, MoreHorizontal, Trash2 } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    return (
        <>
            {/* Мобильный оверлей для боковой панели */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Боковая панель навигации (Адаптивная) */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col
                lg:translate-x-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-64 lg:shadow-none lg:z-30
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">
                    <div>
                        <div className="text-lg font-bold text-slate-900">Менеджер образцов</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Текущая сессия</div>
                    </div>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsOpen(false)}>
                        <X className="h-5 w-5 text-slate-500" />
                    </Button>
                </div>

                <div className="p-4">
                    <Button className="w-full gap-2 font-semibold shadow-sm bg-slate-900 hover:bg-slate-800 text-white">
                        <Plus className="h-4 w-4" />
                        Добавить образец
                    </Button>
                </div>

                <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-4">
                    <div className="py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Созданные записи</div>

                    {/* Активный редактируемый образец */}
                    <div className="group flex flex-col rounded-lg border-2 border-slate-900 bg-slate-100/50 p-3 transition-all relative">
                        <div className="pr-10">
                            <span className="block text-xs font-bold text-slate-900">Образец #3: Pardosa lugubris</span>
                            <span className="block text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                Редактируется...
                            </span>
                        </div>
                        {/* Элементы управления активного образца */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-900">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Ранее сохраненный образец */}
                    <a href="#" className="flex flex-col gap-1 rounded-lg border border-transparent px-3 py-3 transition-colors hover:bg-slate-100">
                        <span className="text-xs font-medium text-slate-700">Образец #2: Salticidae</span>
                        <span className="text-[10px] text-slate-500">Сохранено 2 ч. назад</span>
                    </a>
                </nav>

                <div className="mt-auto border-t border-slate-200 p-4 bg-slate-50/50">
                    <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50">
                        <LogOut className="h-4 w-4" />
                        Завершить сессию
                    </Button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

import { type FC, useState } from "react";
import { Outlet, useLocation } from "react-router";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Layout: FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const isFormFilling = location.pathname.includes('/article/');
    const isLanding = location.pathname === '/';

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            <Header
                isSidebarEnabled={isFormFilling}
                setSidebarOpen={setIsSidebarOpen}
            />

            <div className={`flex-1 flex max-w-[100vw] relative ${isLanding ? 'bg-white' : ''}`}>
                {isFormFilling && (
                    <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                )}

                <main className={`flex-1 flex flex-col w-full min-h-0`}>
                    <div className={isFormFilling ? 'flex-1 w-full p-4 md:p-8 overflow-y-auto pb-32' : isLanding ? 'w-full' : 'flex-1 w-full max-w-5xl mx-auto p-4 md:py-8 space-y-8'}>
                        <Outlet />
                    </div>
                    {isFormFilling && <Footer />}
                </main>
            </div>
        </div>
    );
};

export default Layout;
import React from "react";
import clsx from "clsx";

type SidebarItemProps = {
    icon: React.ReactNode;
    tooltip?: string;
    onClick?: () => void;
    active?: boolean;
};

export const SidebarItem: React.FC<SidebarItemProps> = ({ icon, tooltip, onClick, active }) => {
    return (
        <button
            className={clsx(
                "w-10 h-10 flex items-center justify-center rounded-full transition-colors text-3xl p-4 ",
                active ? "bg-primary" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white",
                "hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
        >
            {icon}
        </button>

    );
};

type SidebarProps = {
    items: SidebarItemProps[];
    className?: string;
};

export const Sidebar: React.FC<SidebarProps> = ({ items, className }) => {
    return (
        <aside
            className={clsx(
                "fixed left-0 h-screen  flex flex-col items-center gap-4 p-2  shadow-md",
                className
            )}
        >
            {items.map((item, index) => (
                <SidebarItem key={index} {...item} />
            ))}
        </aside>
    );
};

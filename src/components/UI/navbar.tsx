import React, { useState } from "react";

type NavbarProps = { children: React.ReactNode };

// Navbar principal
const Navbar: React.FC<NavbarProps> = ({ children }) => {
    const [open, setOpen] = useState(false);

    return (
        <nav className="shadow-md px-4 py-2">
            <div className="container mx-auto flex items-center justify-between list-none">
                {children}
                {/* Toggle mobile */}
                <button
                    className=" ml-2"
                    onClick={() => setOpen(!open)}
                >
                    <span className="block w-6 h-0.5  mb-1"></span>
                    <span className="block w-6 h-0.5  mb-1"></span>
                    <span className="block w-6 h-0.5 "></span>
                </button>
            </div>
            {/* Menu mobile */}
            {open && (
                <div className=" mt-2">
                    {children}
                </div>
            )}
        </nav>
    );
};

// Brand do Navbar
const NavbarBrand: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} className="gradient-text italic font-bold text-2xl list-none">
        {children}
    </a>
);

// Nav container
const Nav: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <ul className={`flex gap-4 items-center !list-none ${className}`}>{children}</ul>
);

// Item do Nav
const NavItem: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <li>
        <a href={href}>{children}</a>
    </li>
);

// Exportando todos os componentes juntos
export { Navbar, NavbarBrand, Nav, NavItem };

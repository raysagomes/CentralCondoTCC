import { Sidebar } from "../UI/sidebar.tsx"
import { FiHome, FiUser, FiSettings } from "react-icons/fi";

export default function SidebarCore() {
    const sidebarItems = [
        { icon: <FiHome size={40} />, tooltip: "Home",  },
        { icon: <FiUser size={40} />, tooltip: "Profile" },
        { icon: <FiSettings size={40} />, tooltip: "Settings" },
    ];

    return <Sidebar items={sidebarItems} />;
}

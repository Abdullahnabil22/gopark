import { useLocation } from "react-router";
import { FaSquareParking, FaTicket } from "react-icons/fa6";
import { FaUserCog, FaHome } from "react-icons/fa";
import BaseNavbar from "./BaseNavbar";

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: FaHome },
    { path: "/checkpoint", label: "Check Point", icon: FaTicket },
    { path: "/admin", label: "Admin", icon: FaUserCog },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <BaseNavbar
      brandIcon={FaSquareParking}
      brandText="Go Park"
      navItems={navItems.map(({ path, label, icon }) => ({
        path,
        label,
        icon,
        isActive: isActive(path),
      }))}
    />
  );
}

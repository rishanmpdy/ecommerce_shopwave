import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout as adminLogout } from "../store/adminSlice";
import { logout as shopLogout } from "../../features/auth/authSlice";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShoppingBag,
  Users,
  Tag,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", Icon: Package },
  { to: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { to: "/admin/users", label: "Users", Icon: Users },
  { to: "/admin/categories", label: "Categories", Icon: Tag },
  { to: "/admin/coupons", label: "Coupons", Icon: Tag },
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin } = useSelector((state) => state.admin);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    // Admin logout aayal shop session-um clear cheyyunnu to keep in sync.
    dispatch(adminLogout());
    dispatch(shopLogout());
    navigate("/admin/login");
  };

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`${mobile
          ? "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 " +
          (sidebarOpen ? "translate-x-0" : "-translate-x-full")
          : "hidden lg:flex w-64 flex-col"
        } bg-gray-900 text-white flex flex-col`}
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-indigo-500" />
          <h1 className="text-lg font-bold text-white">ShopWave</h1>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold uppercase">
            {admin?.name?.[0] || "A"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{admin?.name || "Admin"}</p>
            <p className="text-xs text-gray-400 truncate">{admin?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <Sidebar mobile />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden h-14 bg-white border-b border-gray-200 flex items-center px-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={22} />
          </button>
          <span className="ml-3 font-semibold text-gray-800">ShopWave Admin</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

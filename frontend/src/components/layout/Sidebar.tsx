// no react imports needed with react-jsx transform
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BrainCircuit, 
  BarChart3, 
  AlertTriangle, 
  Shield, 
  Cpu, 
  Database,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const navItems = [
  { name: 'Overview', to: '/app', icon: LayoutDashboard },
  { name: 'Customers', to: '/app/customers', icon: Users },
  { name: 'Predictions', to: '/app/predictions', icon: BrainCircuit },
  { name: 'Analytics', to: '/app/analytics', icon: BarChart3 },
  { name: 'Risk Center', to: '/app/risk-center', icon: AlertTriangle },
  { name: 'Retention', to: '/app/retention', icon: Shield },
  { name: 'Model', to: '/app/model', icon: Cpu },
  { name: 'Data Quality', to: '/app/data-quality', icon: Database },
];

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useLocalStorage('sidebar_collapsed', false);

  // Handle mobile overlay click
  const handleOverlayClick = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out md:static
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-16' : 'w-64'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
          <span className={`font-bold text-slate-900 truncate transition-opacity duration-300 ${isCollapsed ? 'md:opacity-0 md:hidden' : 'opacity-100'}`}>
            Customer Intelligence
          </span>
          {isCollapsed && <span className="hidden md:block font-bold text-slate-900 text-center w-full">CI</span>}
          
          <button 
            className="md:hidden p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.to === '/app'}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <item.icon
                  className={`flex-shrink-0 w-5 h-5 transition-colors ${isCollapsed ? 'mx-auto' : 'mr-3'}`}
                />
                <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>
                  {item.name}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex flex-shrink-0 p-4 border-t border-slate-200">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center w-full p-2 text-slate-500 bg-slate-50 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>
    </>
  );
}

import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/trending', label: 'Trending', icon: '🔥' },
    { path: '/upload', label: '+', icon: '', isUpload: true },
    { path: '/live', label: 'Live', icon: '🔴' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant={item.isUpload ? "neon" : location.pathname === item.path ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate(item.path)}
            className={item.isUpload ? "px-6" : ""}
          >
            {item.icon && <span className="mr-1">{item.icon}</span>}
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
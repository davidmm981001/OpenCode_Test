import { Bell, ChevronDown, LogOut } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useApp();

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 h-14 border-b border-[#202950]/[0.06]"
      style={{
        background: 'rgba(240, 242, 245, 0.55)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      }}
    >
      {/* Left: Hamburger menu icon */}
      <button
        onClick={onToggleSidebar}
        className="flex items-center justify-center w-8 h-8 rounded-md transition-colors text-[#717182] hover:bg-black/5"
      >
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1h16M1 7h16M1 13h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Phone icon with status dot */}
        <div className="relative">
          <Bell size={18} className="text-[#717182]" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#58B888] border-2 border-white" />
        </div>

        {/* User info + avatar + chevron */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-3 cursor-pointer group outline-none">
              <div className="text-right hidden sm:block">
                <div className="text-sm text-[#0f1117]" style={{ fontWeight: 500 }}>Administrador</div>
                <div className="text-xs text-[#717182]">admin@nexti.com</div>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-[#202950] bg-gradient-to-br from-[#202950]/10 to-[#202950]/5"
                style={{ fontWeight: 600 }}
              >
                AD
              </div>
              <ChevronDown
                size={14}
                className={`text-[#717182] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-64 p-0 rounded-xl border border-[#e5e7eb] shadow-lg bg-white"
          >
            <div className="flex items-center gap-3 p-4 border-b border-[#e5e7eb]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm text-white bg-[#58B888]" style={{ fontWeight: 600 }}>
                AD
              </div>
              <div>
                <div className="text-sm text-[#0f1117]" style={{ fontWeight: 600 }}>Administrador</div>
                <div className="text-xs text-[#717182]">admin@nexti.com</div>
              </div>
            </div>
            <div className="p-2">
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#ef4444] hover:bg-[#fef2f2] transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
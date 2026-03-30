import React from 'react';
import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  FolderOpen,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { motion } from 'motion/react';

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; disabled?: boolean };

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Módulos',
    items: [
      { href: '/', label: 'Panel', icon: LayoutDashboard },
      { href: '/projects', label: 'Proyectos', icon: FolderOpen },
    ],
  },
  // {
  //   label: 'Próximamente',
  //   items: [
  //     { href: '#', label: 'Ajustes', icon: Settings, disabled: true },
  //   ],
  // },
];

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    if (href === '/projects') return location.pathname === '/projects' || location.pathname.startsWith('/projects/');
    return location.pathname.startsWith(href);
  };

  return (
    <aside className={`relative flex flex-col h-full w-full text-white overflow-hidden`}>
      {/* Gradient background layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#202950] via-[#1a2242] to-[#131a35]" />

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 20% 20%, rgba(88,184,136,0.12) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 80% 80%, rgba(99,102,241,0.08) 0%, transparent 50%),
          radial-gradient(ellipse 50% 60% at 50% 50%, rgba(88,184,136,0.05) 0%, transparent 60%)
        `,
        backgroundSize: '100% 100%',
      }} />

      {/* Glass highlight on left edge */}
      <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

      {/* Glass highlight on right edge */}
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-white/5 via-white/[0.02] to-transparent" />

      {/* Ambient glow orb top */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#58B888]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Ambient glow orb bottom */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#6366f1]/8 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <motion.div
        className={`relative flex items-center gap-2 py-5 ${collapsed ? 'px-3 justify-center' : 'px-5'}`}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden">
          <img src="/logo-nexti.png" alt="NexTI" className="h-8 w-8 object-contain" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-white text-sm leading-tight" style={{ fontWeight: 700, letterSpacing: '0.06em' }}>NexTI</div>
            <div className="text-xs leading-tight uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 500, fontSize: '0.6rem' }}>Modernización</div>
          </motion.div>
        )}
      </motion.div>

      {/* Navigation */}
      <nav className={`relative flex-1 py-4 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
        {navGroups.map(group => (
          <div key={group.label} className="mb-5">
            {!collapsed && (
              <motion.div
                className="px-3 mb-2 text-xs uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 600, fontSize: '0.65rem' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                {group.label}
              </motion.div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item, idx) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={item.disabled ? '#' : item.href}
                      onClick={e => item.disabled && e.preventDefault()}
                      className={`flex items-center rounded-md transition-all duration-150 group relative ${collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2'}`}
                      title={collapsed ? item.label : undefined}
                      style={{
                        backgroundColor: active ? 'rgba(88,184,136,0.15)' : 'transparent',
                        borderLeft: collapsed ? 'none' : active ? '2px solid #58B888' : '2px solid transparent',
                        color: item.disabled ? 'rgba(255,255,255,0.25)' : active ? '#ffffff' : 'rgba(255,255,255,0.65)',
                        cursor: item.disabled ? 'not-allowed' : 'pointer',
                      }}
                      onMouseEnter={e => {
                        if (!active && !item.disabled) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.08)';
                          (e.currentTarget as HTMLElement).style.color = '#ffffff';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active && !item.disabled) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)';
                        }
                      }}
                    >
                      <Icon size={16} className="flex-shrink-0" />
                      {!collapsed && <span className="text-sm flex-1" style={{ fontWeight: active ? 500 : 400 }}>{item.label}</span>}
                      {!collapsed && item.disabled && <Lock size={11} style={{ color: 'rgba(255,255,255,0.25)' }} />}
                      {!collapsed && active && !item.disabled && <ChevronRight size={12} style={{ color: '#58B888', opacity: 0.7 }} />}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

    </aside>
  );
}
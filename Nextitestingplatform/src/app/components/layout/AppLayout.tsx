import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar with animated width */}
      <motion.div
        animate={{ width: sidebarCollapsed ? 64 : 220 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="flex-shrink-0 h-full overflow-hidden"
        style={{ position: 'relative' }}
      >
        <Sidebar collapsed={sidebarCollapsed} />
      </motion.div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar onToggleSidebar={() => setSidebarCollapsed(c => !c)} />
        <main className="flex-1 overflow-auto" style={{ backgroundColor: '#f5f6fa' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
import { useState } from 'react';
import {
  TrendingUp, Package, Plus, ShoppingBag, FileText,
  Tags, LayoutDashboard, MapPin, RefreshCw, ChevronDown, ChevronRight
} from 'lucide-react';
import type { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onResetData: () => void;
}

export default function Sidebar({ currentView, onNavigate, onResetData }: SidebarProps) {
  const [tiresOpen, setTiresOpen] = useState(
    ['tire-types', 'tire-names', 'inventory'].includes(currentView)
  );
  const [salesOpen, setSalesOpen] = useState(
    ['sales-logs', 'log-sale'].includes(currentView)
  );

  const navBtn = (view: AppView, icon: React.ReactNode, label: string, indent = false) => (
    <button
      className={`sidebar-nav-btn ${currentView === view ? 'active' : ''} ${indent ? 'sidebar-nav-indent' : ''}`}
      onClick={() => onNavigate(view)}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand-section" style={{ marginBottom: '0.5rem' }}>
        <div className="brand-icon">TF</div>
        <h1 className="brand-title">
          TreadFlow
          <span className="brand-subtitle">Inventory & Sales Manager</span>
        </h1>
      </div>

      {/* Nav */}
      <nav className="sidebar-menu">
        {/* Dashboard */}
        <div className="sidebar-group">
          <span className="sidebar-group-title">
            <LayoutDashboard size={12} /> Overview
          </span>
          {navBtn('dashboard', <TrendingUp size={16} />, 'Dashboard')}
        </div>

        {/* Tires Section - Collapsible */}
        <div className="sidebar-group">
          <button className="sidebar-group-title sidebar-group-toggle" onClick={() => setTiresOpen(p => !p)}>
            <Package size={12} /> Tires Management
            <span className="sidebar-chevron">{tiresOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>
          </button>
          {tiresOpen && (
            <div className="sidebar-sub-items">
              {navBtn('tire-types', <Tags size={16} />, 'Tire Types', true)}
              {navBtn('tire-names', <Plus size={16} />, 'Tire Names / Models', true)}
              {navBtn('inventory', <Package size={16} />, 'Stock Inventory', true)}
            </div>
          )}
        </div>

        {/* Sales Section - Collapsible */}
        <div className="sidebar-group">
          <button className="sidebar-group-title sidebar-group-toggle" onClick={() => setSalesOpen(p => !p)}>
            <ShoppingBag size={12} /> Sales Operations
            <span className="sidebar-chevron">{salesOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>
          </button>
          {salesOpen && (
            <div className="sidebar-sub-items">
              {navBtn('log-sale', <ShoppingBag size={16} />, 'Log Sale', true)}
              {navBtn('sales-logs', <FileText size={16} />, 'Sales History', true)}
            </div>
          )}
        </div>

        {/* Locations */}
        <div className="sidebar-group">
          <span className="sidebar-group-title">
            <MapPin size={12} /> Stores
          </span>
          {navBtn('locations', <MapPin size={16} />, 'Manage Locations')}
        </div>
      </nav>

      {/* Reset */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
        <button onClick={onResetData} className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}>
          <RefreshCw size={12} style={{ marginRight: '4px' }} />
          Reset Demo Data
        </button>
      </div>
    </aside>
  );
}

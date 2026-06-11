import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  DollarSign,
  AlertTriangle,
  Plus,
  ShoppingBag,
  Calendar,
  Search,
  Trash2,
  RefreshCw,
  Award,
  FileText,
  Info,
  CheckCircle,
  X
} from 'lucide-react';

interface Tire {
  id: string;
  name: string;
  type: string;
  price: number;
  quantity: number;
}

interface Sale {
  id: string;
  tireId: string;
  tireName: string;
  tireType: string;
  quantity: number;
  saleDate: string; // YYYY-MM-DD
  priceAtSale: number;
}

interface Notification {
  message: string;
  type: 'success' | 'error';
}

// Helper to get relative dates formatted as YYYY-MM-DD in local time
const getRelativeDateString = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Default Mock Data for Demonstration
const DEFAULT_TIRES: Tire[] = [
  { id: 't1', name: 'Michelin Pilot Sport 4S', type: 'Performance', price: 249.99, quantity: 24 },
  { id: 't2', name: 'Bridgestone Blizzak WS90', type: 'Winter', price: 169.99, quantity: 18 },
  { id: 't3', name: 'Goodyear Wrangler Duratrac', type: 'Off-Road', price: 219.99, quantity: 12 },
  { id: 't4', name: 'Continental ExtremeContact DWS06', type: 'All-Season', price: 189.99, quantity: 3 },
  { id: 't5', name: 'Pirelli Scorpion Verde', type: 'SUV/Truck', price: 209.99, quantity: 8 },
];

const DEFAULT_SALES = (): Sale[] => [
  { id: 's1', tireId: 't1', tireName: 'Michelin Pilot Sport 4S', tireType: 'Performance', quantity: 2, saleDate: getRelativeDateString(0), priceAtSale: 249.99 },
  { id: 's2', tireId: 't4', tireName: 'Continental ExtremeContact DWS06', tireType: 'All-Season', quantity: 1, saleDate: getRelativeDateString(0), priceAtSale: 189.99 },
  { id: 's3', tireId: 't2', tireName: 'Bridgestone Blizzak WS90', tireType: 'Winter', quantity: 4, saleDate: getRelativeDateString(1), priceAtSale: 169.99 },
  { id: 's4', tireId: 't3', tireName: 'Goodyear Wrangler Duratrac', tireType: 'Off-Road', quantity: 2, saleDate: getRelativeDateString(3), priceAtSale: 219.99 },
  { id: 's5', tireId: 't5', tireName: 'Pirelli Scorpion Verde', tireType: 'SUV/Truck', quantity: 2, saleDate: getRelativeDateString(8), priceAtSale: 209.99 },
  { id: 's6', tireId: 't1', tireName: 'Michelin Pilot Sport 4S', tireType: 'Performance', quantity: 4, saleDate: getRelativeDateString(10), priceAtSale: 249.99 },
  { id: 's7', tireId: 't2', tireName: 'Bridgestone Blizzak WS90', tireType: 'Winter', quantity: 6, saleDate: getRelativeDateString(35), priceAtSale: 169.99 },
  { id: 's8', tireId: 't4', tireName: 'Continental ExtremeContact DWS06', tireType: 'All-Season', quantity: 4, saleDate: getRelativeDateString(40), priceAtSale: 189.99 },
  { id: 's9', tireId: 't3', tireName: 'Goodyear Wrangler Duratrac', tireType: 'Off-Road', quantity: 3, saleDate: getRelativeDateString(42), priceAtSale: 219.99 },
];

// Date Boundary Helpers
const getStartOfWeek = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const start = new Date(date.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfWeek = (d: Date): Date => {
  const start = getStartOfWeek(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

const getStartOfCurrentMonth = (d: Date): Date => {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
};

const getEndOfCurrentMonth = (d: Date): Date => {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
};

const getStartOfLastMonth = (d: Date): Date => {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1, 0, 0, 0, 0);
};

const getEndOfLastMonth = (d: Date): Date => {
  return new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999);
};

const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  // State Initialization
  const [tires, setTires] = useState<Tire[]>(() => {
    const saved = localStorage.getItem('treadflow_tires');
    return saved ? JSON.parse(saved) : DEFAULT_TIRES;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('treadflow_sales');
    return saved ? JSON.parse(saved) : DEFAULT_SALES();
  });

  // Notifications State
  const [notification, setNotification] = useState<Notification | null>(null);

  // Add Tire Form State
  const [tireName, setTireName] = useState('');
  const [tireType, setTireType] = useState('All-Season');
  const [tirePrice, setTirePrice] = useState('');
  const [tireQuantity, setTireQuantity] = useState('');

  // Log Sale Form State
  const [saleTireId, setSaleTireId] = useState('');
  const [saleQuantity, setSaleQuantity] = useState('1');
  const [saleDate, setSaleDate] = useState(getRelativeDateString(0));

  // Reporting Filters
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'lastMonth' | 'custom'>('week');
  const [customFromDate, setCustomFromDate] = useState(getRelativeDateString(30));
  const [customToDate, setCustomToDate] = useState(getRelativeDateString(0));

  // Inventory Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('treadflow_tires', JSON.stringify(tires));
  }, [tires]);

  useEffect(() => {
    localStorage.setItem('treadflow_sales', JSON.stringify(sales));
  }, [sales]);

  // Utility to show temporary toast notification
  const triggerNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Reset to default mock data
  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data to the demo defaults? This will overwrite your current changes.')) {
      setTires(DEFAULT_TIRES);
      setSales(DEFAULT_SALES());
      triggerNotification('Inventory and sales reset to demo values!');
    }
  };

  // Action: Add New Tire
  const handleAddTire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tireName.trim()) {
      triggerNotification('Please enter a valid tire model name.', 'error');
      return;
    }
    const priceNum = parseFloat(tirePrice);
    const qtyNum = parseInt(tireQuantity);

    if (isNaN(priceNum) || priceNum <= 0) {
      triggerNotification('Please enter a valid unit price greater than 0.', 'error');
      return;
    }
    if (isNaN(qtyNum) || qtyNum < 0) {
      triggerNotification('Please enter a valid initial stock quantity.', 'error');
      return;
    }

    const newTire: Tire = {
      id: `t_${Date.now()}`,
      name: tireName.trim(),
      type: tireType,
      price: priceNum,
      quantity: qtyNum
    };

    setTires(prev => [newTire, ...prev]);

    // Reset form
    setTireName('');
    setTirePrice('');
    setTireQuantity('');
    triggerNotification(`Successfully added ${newTire.name} to inventory!`);
  };

  // Action: Log Sale
  const handleLogSale = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!saleTireId) {
      triggerNotification('Please select a tire model to log a sale.', 'error');
      return;
    }

    const qtyNum = parseInt(saleQuantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      triggerNotification('Please enter a valid sale quantity greater than 0.', 'error');
      return;
    }

    const targetTire = tires.find(t => t.id === saleTireId);
    if (!targetTire) {
      triggerNotification('Selected tire was not found in inventory.', 'error');
      return;
    }

    if (targetTire.quantity < qtyNum) {
      triggerNotification(`Insufficient stock! ${targetTire.name} only has ${targetTire.quantity} remaining.`, 'error');
      return;
    }

    // Deduct quantity from tire stock
    setTires(prev => prev.map(t => {
      if (t.id === saleTireId) {
        return { ...t, quantity: t.quantity - qtyNum };
      }
      return t;
    }));

    // Record the sale log
    const newSale: Sale = {
      id: `s_${Date.now()}`,
      tireId: saleTireId,
      tireName: targetTire.name,
      tireType: targetTire.type,
      quantity: qtyNum,
      saleDate: saleDate || getRelativeDateString(0),
      priceAtSale: targetTire.price
    };

    setSales(prev => [newSale, ...prev]);
    setSaleQuantity('1');
    triggerNotification(`Logged sale of ${qtyNum}x ${targetTire.name}!`);
  };

  // Action: Quick Sale (directly from tire cards/tables)
  const handleQuickSale = (tireId: string, quantity: number) => {
    const targetTire = tires.find(t => t.id === tireId);
    if (!targetTire) return;

    if (targetTire.quantity < quantity) {
      triggerNotification(`Insufficient stock! Only ${targetTire.quantity} remaining for ${targetTire.name}.`, 'error');
      return;
    }

    // Deduct stock
    setTires(prev => prev.map(t => {
      if (t.id === tireId) {
        return { ...t, quantity: t.quantity - quantity };
      }
      return t;
    }));

    // Record sale
    const newSale: Sale = {
      id: `s_${Date.now()}`,
      tireId: tireId,
      tireName: targetTire.name,
      tireType: targetTire.type,
      quantity: quantity,
      saleDate: getRelativeDateString(0),
      priceAtSale: targetTire.price
    };

    setSales(prev => [newSale, ...prev]);
    triggerNotification(`Logged quick sale of ${quantity}x ${targetTire.name}!`);
  };

  // Action: Undo/Delete Sale Log
  const handleDeleteSale = (saleId: string) => {
    const saleToDelete = sales.find(s => s.id === saleId);
    if (!saleToDelete) return;

    // Check if the tire still exists in inventory to restore stock
    const tireExists = tires.some(t => t.id === saleToDelete.tireId);

    if (tireExists) {
      setTires(prev => prev.map(t => {
        if (t.id === saleToDelete.tireId) {
          return { ...t, quantity: t.quantity + saleToDelete.quantity };
        }
        return t;
      }));
    }

    setSales(prev => prev.filter(s => s.id !== saleId));
    triggerNotification(`Cancelled sale record. ${tireExists ? 'Stock restored.' : 'Tire no longer in inventory.'}`);
  };

  // Action: Delete Tire completely
  const handleDeleteTire = (tireId: string) => {
    const targetTire = tires.find(t => t.id === tireId);
    if (!targetTire) return;

    if (window.confirm(`Are you sure you want to delete "${targetTire.name}"? Historical sales will not be affected, but you won't be able to log new sales for it.`)) {
      setTires(prev => prev.filter(t => t.id !== tireId));
      if (saleTireId === tireId) {
        setSaleTireId('');
      }
      triggerNotification(`Deleted ${targetTire.name} from active inventory.`);
    }
  };

  // Quick Adjustment of stock (+ / - buttons)
  const adjustStock = (tireId: string, adjustment: number) => {
    setTires(prev => prev.map(t => {
      if (t.id === tireId) {
        const newQty = Math.max(0, t.quantity + adjustment);
        return { ...t, quantity: newQty };
      }
      return t;
    }));
  };

  // REPORT FILTER BOUNDARIES CALCULATION
  const getFilterRange = () => {
    const today = new Date();
    let startStr = '';
    let endStr = '';

    switch (activeTab) {
      case 'week':
        startStr = formatDateString(getStartOfWeek(today));
        endStr = formatDateString(getEndOfWeek(today));
        break;
      case 'month':
        startStr = formatDateString(getStartOfCurrentMonth(today));
        endStr = formatDateString(getEndOfCurrentMonth(today));
        break;
      case 'lastMonth':
        startStr = formatDateString(getStartOfLastMonth(today));
        endStr = formatDateString(getEndOfLastMonth(today));
        break;
      case 'custom':
        startStr = customFromDate;
        endStr = customToDate;
        break;
    }

    return { startStr, endStr };
  };

  const { startStr, endStr } = getFilterRange();

  // Filtered Sales according to Date Tab
  const filteredSales = sales.filter(sale => {
    return sale.saleDate >= startStr && sale.saleDate <= endStr;
  });

  // CRITICAL ANALYTICS CALCULATIONS
  const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.quantity * s.priceAtSale), 0);
  const totalTiresSold = filteredSales.reduce((sum, s) => sum + s.quantity, 0);

  const totalCurrentStock = tires.reduce((sum, t) => sum + t.quantity, 0);
  const lowStockCount = tires.filter(t => t.quantity < 5).length;

  // CHART DATA 1: Daily Sales Trend (Chronological bar chart)
  const getDailyTrendData = () => {
    if (activeTab === 'week') {
      // Show Mon-Sun of current week
      const days = [];
      const monday = getStartOfWeek(new Date());
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push({
          dateStr: formatDateString(d),
          label: d.toLocaleDateString('en-US', { weekday: 'short' })
        });
      }
      return days.map(day => {
        const daySales = filteredSales.filter(s => s.saleDate === day.dateStr);
        const qty = daySales.reduce((acc, curr) => acc + curr.quantity, 0);
        const rev = daySales.reduce((acc, curr) => acc + (curr.quantity * curr.priceAtSale), 0);
        return { label: day.label, quantity: qty, revenue: rev };
      });
    } else {
      // For Month / Last Month / Custom: Find all unique dates in filtered sales
      const dateMap: { [key: string]: { qty: number, rev: number } } = {};

      // Pre-fill last 8 dates of the range that have sales (or just all if less)
      filteredSales.forEach(sale => {
        if (!dateMap[sale.saleDate]) {
          dateMap[sale.saleDate] = { qty: 0, rev: 0 };
        }
        dateMap[sale.saleDate].qty += sale.quantity;
        dateMap[sale.saleDate].rev += sale.quantity * sale.priceAtSale;
      });

      const sortedDates = Object.keys(dateMap).sort();
      // Take up to last 8 days with activity to keep chart clean
      const displayedDates = sortedDates.slice(-8);

      return displayedDates.map(dateStr => {
        const dateObj = new Date(dateStr + 'T00:00:00'); // avoid timezone shifts
        const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return {
          label,
          quantity: dateMap[dateStr].qty,
          revenue: dateMap[dateStr].rev
        };
      });
    }
  };

  const chartData = getDailyTrendData();
  const maxChartQty = Math.max(...chartData.map(d => d.quantity), 1);

  // CHART DATA 2: Top Selling Tires Breakdown
  const getTopSellingTires = () => {
    const modelMap: { [key: string]: { name: string, type: string, quantity: number, revenue: number } } = {};
    filteredSales.forEach(sale => {
      if (!modelMap[sale.tireName]) {
        modelMap[sale.tireName] = { name: sale.tireName, type: sale.tireType, quantity: 0, revenue: 0 };
      }
      modelMap[sale.tireName].quantity += sale.quantity;
      modelMap[sale.tireName].revenue += sale.quantity * sale.priceAtSale;
    });

    return Object.values(modelMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4); // Top 4 best sellers
  };

  const topSellers = getTopSellingTires();
  const maxSellerQty = Math.max(...topSellers.map(s => s.quantity), 1);

  // CHART DATA 3: Sales by Tire Type Category
  const getTypeSales = () => {
    const typeMap: { [key: string]: { type: string, quantity: number, revenue: number } } = {
      'Passenger': { type: 'Passenger', quantity: 0, revenue: 0 },
      'SUV/Truck': { type: 'SUV/Truck', quantity: 0, revenue: 0 },
      'Performance': { type: 'Performance', quantity: 0, revenue: 0 },
      'Winter': { type: 'Winter', quantity: 0, revenue: 0 },
      'All-Season': { type: 'All-Season', quantity: 0, revenue: 0 },
      'Off-Road': { type: 'Off-Road', quantity: 0, revenue: 0 },
    };

    filteredSales.forEach(sale => {
      if (typeMap[sale.tireType]) {
        typeMap[sale.tireType].quantity += sale.quantity;
        typeMap[sale.tireType].revenue += sale.quantity * sale.priceAtSale;
      }
    });

    return Object.values(typeMap)
      .filter(t => t.quantity > 0)
      .sort((a, b) => b.quantity - a.quantity);
  };

  const typeSales = getTypeSales();
  const totalTypeQuantity = typeSales.reduce((acc, curr) => acc + curr.quantity, 0);

  // Filtered inventory list based on search term & category selection
  const filteredInventory = tires.filter(tire => {
    const matchesSearch = tire.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tire.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || tire.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {notification && (
        <div className={`notification ${notification.type === 'error' ? 'notification-error' : ''}`}>
          {notification.type === 'success' ? (
            <CheckCircle size={20} color="var(--color-success)" />
          ) : (
            <X size={20} color="var(--color-danger)" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon">TF</div>
          <h1 className="brand-title">
            TreadFlow
            <span className="brand-subtitle">Inventory & Sales Tracker</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            System Date: <strong style={{ color: '#fff' }}>{getRelativeDateString(0)}</strong>
          </span>
          <button onClick={handleResetData} className="btn btn-secondary" style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem' }} title="Reset to dynamic mock data">
            <RefreshCw size={14} style={{ marginRight: '4px' }} />
            Demo Data
          </button>
        </div>
      </header>

      {/* KPI Stats Cards */}
      <section className="dashboard-grid">
        <div className="glass-panel stat-card" style={{ '--card-accent': 'var(--grad-accent)' } as any}>
          <div className="stat-header">
            <span>SALES REVENUE ({activeTab.toUpperCase()})</span>
            <div className="stat-icon" style={{ '--icon-color': 'var(--accent-primary)' } as any}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="stat-value">Rs. {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="stat-footer">
            <TrendingUp size={12} color="var(--color-success)" />
            <span>Based on selected date range</span>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ '--card-accent': 'var(--grad-cyan-blue)' } as any}>
          <div className="stat-header">
            <span>TIRES SOLD ({activeTab.toUpperCase()})</span>
            <div className="stat-icon" style={{ '--icon-color': 'var(--accent-cyan)' } as any}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="stat-value">{totalTiresSold} <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>units</span></div>
          <div className="stat-footer">
            <span>Avg price: Rs. {totalTiresSold > 0 ? (totalRevenue / totalTiresSold).toFixed(2) : '0.00'}</span>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ '--card-accent': 'linear-gradient(135deg, #10b981 0%, #059669 100%)' } as any}>
          <div className="stat-header">
            <span>CURRENT IN STOCK</span>
            <div className="stat-icon" style={{ '--icon-color': 'var(--color-success)', background: 'rgba(16, 185, 129, 0.1)' } as any}>
              <Package size={18} />
            </div>
          </div>
          <div className="stat-value">{totalCurrentStock} <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>items</span></div>
          <div className="stat-footer">
            <span>Across {tires.length} tire models</span>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ '--card-accent': lowStockCount > 0 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'rgba(255,255,255,0.05)' } as any}>
          <div className="stat-header">
            <span>LOW STOCK ALERTS</span>
            <div className="stat-icon" style={{
              '--icon-color': lowStockCount > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)',
              background: lowStockCount > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.05)'
            } as any}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: lowStockCount > 0 ? 'var(--color-warning)' : 'inherit' }}>
            {lowStockCount} <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          </div>
          <div className="stat-footer">
            <span>Threshold: less than 5 units</span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="dashboard-grid">

        {/* Left Side: Analytics & Inventory list */}
        <main className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Sales Analytics Dashboard */}
          <section className="glass-panel" style={{ padding: '1.75rem' }}>
            <div className="card-header-actions" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <h2 className="form-title" style={{ margin: 0 }}>
                <TrendingUp size={20} color="var(--accent-primary)" />
                Sales Performance
              </h2>

              {/* Tabs */}
              <div className="tabs-header" style={{ margin: 0, border: 0, padding: 0 }}>
                <button
                  onClick={() => setActiveTab('week')}
                  className={`tab-btn ${activeTab === 'week' ? 'active' : ''}`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setActiveTab('month')}
                  className={`tab-btn ${activeTab === 'month' ? 'active' : ''}`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setActiveTab('lastMonth')}
                  className={`tab-btn ${activeTab === 'lastMonth' ? 'active' : ''}`}
                >
                  Last Month
                </button>
                <button
                  onClick={() => setActiveTab('custom')}
                  className={`tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
                >
                  Custom Range
                </button>
              </div>
            </div>

            {/* Custom Date Picker row */}
            {activeTab === 'custom' && (
              <div className="date-picker-row">
                <div className="form-group" style={{ margin: 0, flex: 1 }}>
                  <label className="form-label">From Date</label>
                  <input
                    type="date"
                    className="input-control"
                    value={customFromDate}
                    onChange={e => setCustomFromDate(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0, flex: 1 }}>
                  <label className="form-label">To Date</label>
                  <input
                    type="date"
                    className="input-control"
                    value={customToDate}
                    onChange={e => setCustomToDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              <Calendar size={14} />
              <span>
                Report Period: <strong style={{ color: '#fff' }}>{startStr}</strong> to <strong style={{ color: '#fff' }}>{endStr}</strong>
              </span>
            </div>

            {/* Charts Visual Block */}
            {filteredSales.length === 0 ? (
              <div className="empty-state">
                <Info size={40} className="empty-state-icon" />
                <h3 className="empty-state-title">No Sales Data</h3>
                <p style={{ fontSize: '0.85rem' }}>There are no logged sales recorded during the selected period.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>

                {/* 1. Daily/Chronological Trend Chart (SVG) */}
                <div className="glass-panel" style={{ gridColumn: 'span 7', padding: '1.25rem', background: 'rgba(255,255,255,0.01)' }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Sales Trend (Quantity Sold)</h3>

                  <div className="chart-container">
                    <div className="chart-bar-group">
                      {chartData.map((item, idx) => {
                        const height = (item.quantity / maxChartQty) * 85;
                        return (
                          <div key={idx} className="chart-bar-wrapper">
                            <div
                              className="chart-bar"
                              style={{ height: `${Math.max(height, 6)}%` }}
                            >
                              <div className="chart-tooltip">
                                <strong>{item.label}</strong>
                                <br />
                                {item.quantity} tires sold
                                <br />
                                Revenue: Rs. {item.revenue.toFixed(2)}
                              </div>
                            </div>
                            <div className="chart-label" title={item.label}>{item.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. Top Products Chart (Linear breakdown) */}
                <div className="glass-panel" style={{ gridColumn: 'span 5', padding: '1.25rem', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Top Selling Models</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {topSellers.map((seller, idx) => {
                        const widthPct = (seller.quantity / maxSellerQty) * 100;
                        return (
                          <div key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }} title={seller.name}>
                                {seller.name}
                              </span>
                              <span style={{ color: 'var(--color-text-secondary)' }}>
                                <strong>{seller.quantity} sold</strong> (Rs. {seller.revenue.toFixed(0)})
                              </span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{
                                height: '100%',
                                width: `${widthPct}%`,
                                background: idx === 0 ? 'var(--grad-accent)' : 'var(--grad-cyan-blue)',
                                borderRadius: '3px'
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category share summaries */}
                  <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Sales Share by Type</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {typeSales.slice(0, 3).map((item, idx) => {
                        const pct = totalTypeQuantity > 0 ? Math.round((item.quantity / totalTypeQuantity) * 100) : 0;
                        return (
                          <span key={idx} className="type-tag" style={{ fontSize: '0.7rem', display: 'flex', gap: '0.25rem' }}>
                            <strong>{item.type}</strong>: {pct}%
                          </span>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>
            )}
          </section>

          {/* Active Inventory List */}
          <section className="glass-panel" style={{ padding: '1.75rem' }}>
            <div className="card-header-actions" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <h2 className="form-title" style={{ margin: 0 }}>
                <Package size={20} color="var(--accent-cyan)" />
                Tire Inventory
              </h2>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* Search Bar */}
                <div className="search-wrapper" style={{ margin: 0 }}>
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search tires..."
                    className="input-control search-input"
                    style={{ padding: '0.4rem 0.8rem 0.4rem 2rem', fontSize: '0.85rem', width: '180px' }}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Type Filter */}
                <select
                  className="input-control"
                  style={{ padding: '0.4rem 2.2rem 0.4rem 0.8rem', fontSize: '0.85rem', width: '130px', margin: 0 }}
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Passenger">Passenger</option>
                  <option value="SUV/Truck">SUV/Truck</option>
                  <option value="Performance">Performance</option>
                  <option value="Winter">Winter</option>
                  <option value="All-Season">All-Season</option>
                  <option value="Off-Road">Off-Road</option>
                </select>
              </div>
            </div>

            {filteredInventory.length === 0 ? (
              <div className="empty-state">
                <Search size={40} className="empty-state-icon" />
                <h3 className="empty-state-title">No Tires Found</h3>
                <p style={{ fontSize: '0.85rem' }}>Try clearing the search or adding a new tire.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Model Name</th>
                      <th>Type</th>
                      <th>Unit Price</th>
                      <th>Stock Quantity</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map(tire => {
                      const isLowStock = tire.quantity < 5;
                      const isOutOfStock = tire.quantity === 0;

                      return (
                        <tr key={tire.id}>
                          <td>
                            <strong style={{ display: 'block', color: 'var(--color-text-primary)' }}>{tire.name}</strong>
                          </td>
                          <td>
                            <span className="type-tag">{tire.type}</span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>Rs. {tire.price.toFixed(2)}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <button
                                onClick={() => adjustStock(tire.id, -1)}
                                className="btn btn-secondary"
                                style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                                title="Subtract 1 stock"
                              >
                                -
                              </button>

                              <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 'bold' }}>
                                {tire.quantity}
                              </span>

                              <button
                                onClick={() => adjustStock(tire.id, 1)}
                                className="btn btn-secondary"
                                style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                                title="Add 1 stock"
                              >
                                +
                              </button>

                              {isOutOfStock ? (
                                <span className="badge badge-danger">Out of Stock</span>
                              ) : isLowStock ? (
                                <span className="badge badge-warning">Low Stock</span>
                              ) : (
                                <span className="badge badge-success">In Stock</span>
                              )}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                              {/* Quick Sale buttons directly in grid */}
                              <button
                                onClick={() => handleQuickSale(tire.id, 1)}
                                className="btn btn-primary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                                disabled={isOutOfStock}
                              >
                                Sell 1
                              </button>
                              <button
                                onClick={() => handleDeleteTire(tire.id)}
                                className="btn btn-danger-outline btn"
                                style={{ padding: '0.35rem' }}
                                title="Delete Tire Model"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </main>

        {/* Right Side: Quick Sell & Add Tire & Recent Logs */}
        <aside className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Quick Sales (Buy sets of 2 or 4) */}
          <section className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 className="form-title">
              <Award size={20} color="var(--accent-secondary)" />
              Quick Sales Panel
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
              Common transaction sets. Instantly register sales for sets of 2 or 4 tires:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tires.slice(0, 3).map(tire => (
                <div key={tire.id} className="quick-action-card">
                  <div className="quick-action-title" title={tire.name}>{tire.name}</div>
                  <div className="quick-action-footer">
                    <span className="quick-action-qty">Stock: <strong>{tire.quantity}</strong></span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleQuickSale(tire.id, 2)}
                        className="btn btn-secondary quick-action-btn"
                        disabled={tire.quantity < 2}
                      >
                        Set of 2
                      </button>
                      <button
                        onClick={() => handleQuickSale(tire.id, 4)}
                        className="btn btn-primary quick-action-btn"
                        disabled={tire.quantity < 4}
                      >
                        Set of 4
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {tires.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  Add tires to view quick sale actions.
                </p>
              )}
            </div>
          </section>

          {/* Add Tire Form */}
          <section className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 className="form-title">
              <Plus size={20} color="var(--accent-primary)" />
              Add Tire Model
            </h2>
            <form onSubmit={handleAddTire}>
              <div className="form-group">
                <label className="form-label">Tire Name / Model</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Michelin Pilot Sport 4S"
                  value={tireName}
                  onChange={e => setTireName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tire Type</label>
                <select
                  className="input-control"
                  value={tireType}
                  onChange={e => setTireType(e.target.value)}
                >
                  <option value="Passenger">Passenger</option>
                  <option value="SUV/Truck">SUV/Truck</option>
                  <option value="Performance">Performance</option>
                  <option value="Winter">Winter</option>
                  <option value="All-Season">All-Season</option>
                  <option value="Off-Road">Off-Road</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Price (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="249.99"
                    className="input-control"
                    value={tirePrice}
                    onChange={e => setTirePrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="24"
                    className="input-control"
                    value={tireQuantity}
                    onChange={e => setTireQuantity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Plus size={16} />
                Register Tire
              </button>
            </form>
          </section>

          {/* Log Custom Sale Form */}
          <section className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 className="form-title">
              <ShoppingBag size={20} color="var(--accent-cyan)" />
              Log Custom Sale
            </h2>
            <form onSubmit={handleLogSale}>
              <div className="form-group">
                <label className="form-label">Select Tire Model</label>
                <select
                  className="input-control"
                  value={saleTireId}
                  onChange={e => setSaleTireId(e.target.value)}
                  required
                >
                  <option value="">-- Choose a tire --</option>
                  {tires.map(t => (
                    <option key={t.id} value={t.id} disabled={t.quantity === 0}>
                      {t.name} (Rs. {t.price.toFixed(2)} - Stock: {t.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Qty Sold</label>
                  <input
                    type="number"
                    min="1"
                    className="input-control"
                    value={saleQuantity}
                    onChange={e => setSaleQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1.5 }}>
                  <label className="form-label">Sale Date</label>
                  <input
                    type="date"
                    className="input-control"
                    value={saleDate}
                    onChange={e => setSaleDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-secondary"
                style={{ width: '100%', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
              >
                Log Transaction
              </button>
            </form>
          </section>

          {/* Recent Sales History */}
          <section className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 className="form-title">
              <FileText size={20} color="var(--color-text-secondary)" />
              Recent Logs ({filteredSales.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredSales.slice(0, 6).map(sale => (
                <div key={sale.id} className="glass-panel" style={{ padding: '0.85rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.01)', borderStyle: 'dashed' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                      {sale.tireName}
                    </span>
                    <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
                      +Rs. {(sale.quantity * sale.priceAtSale).toFixed(2)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                    <span>
                      Qty: <strong>{sale.quantity}</strong> @ Rs. {sale.priceAtSale.toFixed(2)}
                    </span>
                    <span>{sale.saleDate}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => handleDeleteSale(sale.id)}
                      className="btn btn-danger-outline"
                      style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                      title="Delete sale and restore stock"
                    >
                      Undo Sale
                    </button>
                  </div>
                </div>
              ))}

              {filteredSales.length === 0 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>
                  No logged sales for selected range.
                </p>
              )}
            </div>
          </section>

        </aside>

      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div>
          <strong>TreadFlow</strong> - Designed for High-Performance Tire Shop Operations.
        </div>
        <div>
          React Local Sandbox Mode (No Backend Connected)
        </div>
      </footer>
    </div>
  );
}

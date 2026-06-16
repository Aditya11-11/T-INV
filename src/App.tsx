import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Plus,
  ShoppingBag,
  Calendar,
  Search,
  Trash2,
  RefreshCw,
  FileText,
  Info,
  CheckCircle,
  X,
  MapPin,
  Tags,
  LayoutDashboard,
  Edit2,
  Menu,
  Save
} from 'lucide-react';

interface Tire {
  id: string;
  name: string;
  type: string;
  quantity: number;
  locationId: string;
}

interface Sale {
  id: string;
  tireId: string;
  tireName: string;
  tireType: string;
  quantity: number;
  saleDate: string; // YYYY-MM-DD
  locationId: string;
}

interface Location {
  id: string;
  name: string;
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

// Default Mock Data for Demonstration
const DEFAULT_LOCATIONS: Location[] = [
  { id: 'loc1', name: 'Main Warehouse' },
  { id: 'loc2', name: 'Downtown Store' },
];

const DEFAULT_TIRE_TYPES = ['Passenger', 'SUV/Truck', 'Performance', 'Winter', 'All-Season', 'Off-Road'];

const DEFAULT_TIRES: Tire[] = [
  { id: 't1', name: 'Michelin Pilot Sport 4S', type: 'Performance', quantity: 24, locationId: 'loc1' },
  { id: 't2', name: 'Bridgestone Blizzak WS90', type: 'Winter', quantity: 18, locationId: 'loc1' },
  { id: 't3', name: 'Goodyear Wrangler Duratrac', type: 'Off-Road', quantity: 12, locationId: 'loc1' },
  { id: 't4', name: 'Continental ExtremeContact DWS06', type: 'All-Season', quantity: 3, locationId: 'loc1' },
  { id: 't5', name: 'Pirelli Scorpion Verde', type: 'SUV/Truck', quantity: 8, locationId: 'loc1' },
  
  // Downtown Store tires
  { id: 't6', name: 'Michelin Defender LTX', type: 'SUV/Truck', quantity: 15, locationId: 'loc2' },
  { id: 't7', name: 'Nokian Hakkapeliitta R3', type: 'Winter', quantity: 20, locationId: 'loc2' },
  { id: 't8', name: 'Toyo Open Country M/T', type: 'Off-Road', quantity: 10, locationId: 'loc2' },
];

const DEFAULT_SALES = (): Sale[] => [
  { id: 's1', tireId: 't1', tireName: 'Michelin Pilot Sport 4S', tireType: 'Performance', quantity: 2, saleDate: getRelativeDateString(0), locationId: 'loc1' },
  { id: 's2', tireId: 't4', tireName: 'Continental ExtremeContact DWS06', tireType: 'All-Season', quantity: 1, saleDate: getRelativeDateString(0), locationId: 'loc1' },
  { id: 's3', tireId: 't2', tireName: 'Bridgestone Blizzak WS90', tireType: 'Winter', quantity: 4, saleDate: getRelativeDateString(1), locationId: 'loc1' },
  { id: 's4', tireId: 't3', tireName: 'Goodyear Wrangler Duratrac', tireType: 'Off-Road', quantity: 2, saleDate: getRelativeDateString(3), locationId: 'loc1' },
  { id: 's5', tireId: 't5', tireName: 'Pirelli Scorpion Verde', tireType: 'SUV/Truck', quantity: 2, saleDate: getRelativeDateString(8), locationId: 'loc1' },
  { id: 's6', tireId: 't1', tireName: 'Michelin Pilot Sport 4S', tireType: 'Performance', quantity: 4, saleDate: getRelativeDateString(10), locationId: 'loc1' },
  
  // Downtown Store sales
  { id: 's7', tireId: 't6', tireName: 'Michelin Defender LTX', tireType: 'SUV/Truck', quantity: 3, saleDate: getRelativeDateString(1), locationId: 'loc2' },
  { id: 's8', tireId: 't7', tireName: 'Nokian Hakkapeliitta R3', tireType: 'Winter', quantity: 5, saleDate: getRelativeDateString(2), locationId: 'loc2' },
];

type AppView = 'dashboard' | 'inventory' | 'add-tire' | 'tire-types' | 'sales-logs' | 'log-sale';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>(() => {
    const saved = localStorage.getItem('treadflow_current_view');
    return (saved as AppView) || 'dashboard';
  });

  // Location States
  const [locations, setLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem('treadflow_locations');
    return saved ? JSON.parse(saved) : DEFAULT_LOCATIONS;
  });

  const [activeLocationId, setActiveLocationId] = useState<string>(() => {
    const saved = localStorage.getItem('treadflow_active_location_id');
    return saved || (DEFAULT_LOCATIONS[0] ? DEFAULT_LOCATIONS[0].id : 'loc1');
  });

  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  // Tire Types State
  const [tireTypes, setTireTypes] = useState<string[]>(() => {
    const saved = localStorage.getItem('treadflow_tire_types');
    return saved ? JSON.parse(saved) : DEFAULT_TIRE_TYPES;
  });

  const [newTireType, setNewTireType] = useState('');

  // Tires & Sales State
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
  const [tireType, setTireType] = useState(DEFAULT_TIRE_TYPES[0] || 'All-Season');
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

  // Edit States
  const [editingTireId, setEditingTireId] = useState<string | null>(null);
  const [editTireName, setEditTireName] = useState('');
  const [editTireType, setEditTireType] = useState('');
  const [editTireQty, setEditTireQty] = useState('');
  const [editingTypeOld, setEditingTypeOld] = useState<string | null>(null);
  const [editTypeName, setEditTypeName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddTireForm, setShowAddTireForm] = useState(false);
  const [showAddTypeForm, setShowAddTypeForm] = useState(false);
  const [showLogSaleForm, setShowLogSaleForm] = useState(false);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('treadflow_current_view', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('treadflow_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('treadflow_active_location_id', activeLocationId);
  }, [activeLocationId]);

  useEffect(() => {
    localStorage.setItem('treadflow_tire_types', JSON.stringify(tireTypes));
  }, [tireTypes]);

  useEffect(() => {
    localStorage.setItem('treadflow_tires', JSON.stringify(tires));
  }, [tires]);

  useEffect(() => {
    localStorage.setItem('treadflow_sales', JSON.stringify(sales));
  }, [sales]);

  // Sync default tireType when tireTypes array changes
  useEffect(() => {
    if (tireTypes.length > 0 && !tireTypes.includes(tireType)) {
      setTireType(tireTypes[0]);
    }
  }, [tireTypes, tireType]);

  // Utility to show temporary toast notification
  const triggerNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const getCurrentLocationName = () => {
    return locations.find(l => l.id === activeLocationId)?.name || 'Unknown Location';
  };

  // Reset to default mock data
  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data to the demo defaults? This will overwrite your current changes.')) {
      setLocations(DEFAULT_LOCATIONS);
      setActiveLocationId(DEFAULT_LOCATIONS[0].id);
      setTires(DEFAULT_TIRES);
      setSales(DEFAULT_SALES());
      setTireTypes(DEFAULT_TIRE_TYPES);
      setSearchTerm('');
      setTypeFilter('All');
      setSaleTireId('');
      setCurrentView('dashboard');
      triggerNotification('Inventory, sales, locations, and tire types reset to demo values!');
    }
  };

  // Action: Add Location
  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newLocationName.trim();
    if (!trimmed) return;
    if (locations.some(loc => loc.name.toLowerCase() === trimmed.toLowerCase())) {
      triggerNotification('Location already exists.', 'error');
      return;
    }
    const newLoc: Location = {
      id: `loc_${Date.now()}`,
      name: trimmed
    };
    setLocations(prev => [...prev, newLoc]);
    setActiveLocationId(newLoc.id);
    setNewLocationName('');
    setIsAddingLocation(false);
    triggerNotification(`Location "${trimmed}" added and selected.`);
  };

  // Action: Delete Location
  const handleDeleteLocation = (locId: string, locName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (locations.length <= 1) {
      triggerNotification('You must keep at least one location.', 'error');
      return;
    }
    const hasTires = tires.some(t => t.locationId === locId);
    const hasSales = sales.some(s => s.locationId === locId);
    if (hasTires || hasSales) {
      triggerNotification(`Cannot delete "${locName}" because it contains active inventory or sales records.`, 'error');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the location "${locName}"?`)) {
      const remaining = locations.filter(loc => loc.id !== locId);
      setLocations(remaining);
      if (activeLocationId === locId) {
        setActiveLocationId(remaining[0].id);
      }
      triggerNotification(`Deleted location "${locName}".`);
    }
  };

  // Action: Add Tire Type
  const handleAddTireType = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTireType.trim();
    if (!trimmed) return;
    if (tireTypes.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      triggerNotification('Tire type already exists.', 'error');
      return;
    }
    setTireTypes(prev => [...prev, trimmed]);
    setNewTireType('');
    triggerNotification(`Added tire type: ${trimmed}`);
  };

  // Action: Delete Tire Type
  const handleDeleteTireType = (typeToDelete: string) => {
    const isUsed = tires.some(t => t.type === typeToDelete);
    if (isUsed) {
      triggerNotification(`Cannot delete type "${typeToDelete}" because it is currently in use.`, 'error');
      return;
    }
    setTireTypes(prev => prev.filter(t => t !== typeToDelete));
    triggerNotification(`Removed tire type: ${typeToDelete}`);
  };

  // Action: Add New Tire
  const handleAddTire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tireName.trim()) {
      triggerNotification('Please enter a valid tire model name.', 'error');
      return;
    }
    const qtyNum = parseInt(tireQuantity);

    if (isNaN(qtyNum) || qtyNum < 0) {
      triggerNotification('Please enter a valid initial stock quantity.', 'error');
      return;
    }

    const newTire: Tire = {
      id: `t_${Date.now()}`,
      name: tireName.trim(),
      type: tireType,
      quantity: qtyNum,
      locationId: activeLocationId
    };

    setTires(prev => [newTire, ...prev]);

    // Reset form
    setTireName('');
    setTireQuantity('');
    triggerNotification(`Successfully added ${newTire.name} to ${getCurrentLocationName()} inventory!`);
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

    if (targetTire.locationId !== activeLocationId) {
      triggerNotification('Selected tire is not in the active location.', 'error');
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
      locationId: activeLocationId
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
      locationId: activeLocationId
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

    if (window.confirm(`Are you sure you want to delete "${targetTire.name}"? Historical sales will not be affected.`)) {
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

  // Action: Start editing a tire
  const startEditTire = (tire: Tire) => {
    setEditingTireId(tire.id);
    setEditTireName(tire.name);
    setEditTireType(tire.type);
    setEditTireQty(String(tire.quantity));
  };

  const handleUpdateTire = () => {
    if (!editingTireId || !editTireName.trim()) return;
    const qtyNum = parseInt(editTireQty);
    if (isNaN(qtyNum) || qtyNum < 0) { triggerNotification('Invalid quantity.', 'error'); return; }
    setTires(prev => prev.map(t => t.id === editingTireId ? { ...t, name: editTireName.trim(), type: editTireType, quantity: qtyNum } : t));
    setSales(prev => prev.map(s => s.tireId === editingTireId ? { ...s, tireName: editTireName.trim(), tireType: editTireType } : s));
    setEditingTireId(null);
    triggerNotification('Tire updated successfully!');
  };

  const startEditType = (oldType: string) => {
    setEditingTypeOld(oldType);
    setEditTypeName(oldType);
  };

  const handleUpdateTireType = () => {
    if (!editingTypeOld || !editTypeName.trim()) return;
    const trimmed = editTypeName.trim();
    if (trimmed.toLowerCase() !== editingTypeOld.toLowerCase() && tireTypes.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      triggerNotification('Tire type already exists.', 'error'); return;
    }
    setTireTypes(prev => prev.map(t => t === editingTypeOld ? trimmed : t));
    setTires(prev => prev.map(t => t.type === editingTypeOld ? { ...t, type: trimmed } : t));
    setSales(prev => prev.map(s => s.tireType === editingTypeOld ? { ...s, tireType: trimmed } : s));
    setEditingTypeOld(null);
    triggerNotification(`Updated tire type to "${trimmed}".`);
  };

  // Filter Data by Active Location first
  const activeTires = tires.filter(t => t.locationId === activeLocationId);
  const activeSales = sales.filter(s => s.locationId === activeLocationId);

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

  // Filtered Sales according to Date Tab & Location
  const filteredSales = activeSales.filter(sale => {
    return sale.saleDate >= startStr && sale.saleDate <= endStr;
  });

  // ANALYTICS CALCULATIONS (Price completely removed)
  const totalTiresSold = filteredSales.reduce((sum, s) => sum + s.quantity, 0);
  const totalCurrentStock = activeTires.reduce((sum, t) => sum + t.quantity, 0);
  const lowStockCount = activeTires.filter(t => t.quantity < 5).length;

  // Most Active Tire Type calculation for active location
  const getTopTireType = () => {
    const typeMap: { [key: string]: number } = {};
    filteredSales.forEach(sale => {
      typeMap[sale.tireType] = (typeMap[sale.tireType] || 0) + sale.quantity;
    });
    let topType = 'N/A';
    let maxQty = 0;
    Object.entries(typeMap).forEach(([type, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        topType = type;
      }
    });
    return { type: topType, qty: maxQty };
  };
  const topTireTypeInfo = getTopTireType();

  // CHART DATA 1: Daily Sales Trend (Quantity sold chronological bar chart)
  const getDailyTrendData = () => {
    if (activeTab === 'week') {
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
        return { label: day.label, quantity: qty };
      });
    } else {
      const dateMap: { [key: string]: number } = {};

      filteredSales.forEach(sale => {
        dateMap[sale.saleDate] = (dateMap[sale.saleDate] || 0) + sale.quantity;
      });

      const sortedDates = Object.keys(dateMap).sort();
      const displayedDates = sortedDates.slice(-8);

      return displayedDates.map(dateStr => {
        const dateObj = new Date(dateStr + 'T00:00:00');
        const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return {
          label,
          quantity: dateMap[dateStr]
        };
      });
    }
  };

  const chartData = getDailyTrendData();
  const maxChartQty = Math.max(...chartData.map(d => d.quantity), 1);

  // CHART DATA 2: Top Selling Tires Breakdown
  const getTopSellingTires = () => {
    const modelMap: { [key: string]: { name: string, type: string, quantity: number } } = {};
    filteredSales.forEach(sale => {
      if (!modelMap[sale.tireName]) {
        modelMap[sale.tireName] = { name: sale.tireName, type: sale.tireType, quantity: 0 };
      }
      modelMap[sale.tireName].quantity += sale.quantity;
    });

    return Object.values(modelMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4); // Top 4 best sellers
  };

  const topSellers = getTopSellingTires();
  const maxSellerQty = Math.max(...topSellers.map(s => s.quantity), 1);

  // CHART DATA 3: Sales by Tire Type Category
  const getTypeSales = () => {
    const typeMap: { [key: string]: { type: string, quantity: number } } = {};
    tireTypes.forEach(t => {
      typeMap[t] = { type: t, quantity: 0 };
    });

    filteredSales.forEach(sale => {
      if (typeMap[sale.tireType]) {
        typeMap[sale.tireType].quantity += sale.quantity;
      } else {
        typeMap[sale.tireType] = { type: sale.tireType, quantity: sale.quantity };
      }
    });

    return Object.values(typeMap)
      .filter(t => t.quantity > 0)
      .sort((a, b) => b.quantity - a.quantity);
  };

  const typeSales = getTypeSales();
  const totalTypeQuantity = typeSales.reduce((acc, curr) => acc + curr.quantity, 0);

  // Filtered inventory list based on search term & category selection
  const filteredInventory = activeTires.filter(tire => {
    const matchesSearch = tire.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tire.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || tire.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Render Dashboard View
  const renderDashboardView = () => {
    return (
      <>
        {/* KPI Stats Cards */}
        <section className="dashboard-grid">
          <div className="glass-panel stat-card" style={{ '--card-accent': 'var(--grad-accent)' } as any}>
            <div className="stat-header">
              <span>TIRES SOLD ({activeTab.toUpperCase()})</span>
              <div className="stat-icon" style={{ '--icon-color': 'var(--accent-primary)' } as any}>
                <ShoppingBag size={18} />
              </div>
            </div>
            <div className="stat-value">{totalTiresSold} <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>units</span></div>
            <div className="stat-footer">
              <TrendingUp size={12} color="var(--color-success)" />
              <span>Based on selected date range</span>
            </div>
          </div>

          <div className="glass-panel stat-card" style={{ '--card-accent': 'var(--grad-cyan-blue)' } as any}>
            <div className="stat-header">
              <span>CURRENT STOCK</span>
              <div className="stat-icon" style={{ '--icon-color': 'var(--accent-cyan)' } as any}>
                <Package size={18} />
              </div>
            </div>
            <div className="stat-value">{totalCurrentStock} <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>units</span></div>
            <div className="stat-footer">
              <span>Across {activeTires.length} tire models</span>
            </div>
          </div>

          <div className="glass-panel stat-card" style={{ '--card-accent': 'linear-gradient(135deg, #10b981 0%, #059669 100%)' } as any}>
            <div className="stat-header">
              <span>TOP TIRE TYPE</span>
              <div className="stat-icon" style={{ '--icon-color': 'var(--color-success)', background: 'rgba(16, 185, 129, 0.1)' } as any}>
                <Tags size={18} />
              </div>
            </div>
            <div className="stat-value" style={{ fontSize: '1.4rem', paddingTop: '0.3rem', paddingBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={topTireTypeInfo.type}>
              {topTireTypeInfo.type}
            </div>
            <div className="stat-footer">
              <span>{topTireTypeInfo.qty} units sold at this location</span>
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

        {/* Dashboard Charts & Lists */}
        <div className="dashboard-grid">
          {/* Left Side: Analytics */}
          <div className="col-12" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Sales Volume Performance */}
            <section className="glass-panel" style={{ padding: '1.75rem' }}>
              <div className="card-header-actions" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <h2 className="form-title" style={{ margin: 0 }}>
                  <TrendingUp size={20} color="var(--accent-primary)" />
                  Sales Volume Trend & Breakdown
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
                  <p style={{ fontSize: '0.85rem' }}>There are no logged sales recorded in {getCurrentLocationName()} during this period.</p>
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
                                  <strong>{seller.quantity} sold</strong>
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

          </div>


        </div>
      </>
    );
  };

  // Render Inventory View
  const renderInventoryView = () => {
    return (
      <section className="glass-panel" style={{ padding: '2rem' }}>
        <div className="card-header-actions" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h2 className="form-title" style={{ margin: 0 }}>
            <Package size={20} color="var(--accent-cyan)" />
            Tire Stock Inventory
          </h2>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Search Bar */}
            <div className="search-wrapper" style={{ margin: 0 }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search tires..."
                className="input-control search-input"
                style={{ padding: '0.4rem 0.8rem 0.4rem 2rem', fontSize: '0.85rem', width: '220px' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <select
              className="input-control"
              style={{ padding: '0.4rem 2.2rem 0.4rem 0.8rem', fontSize: '0.85rem', width: '150px', margin: 0 }}
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              {tireTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredInventory.length === 0 ? (
          <div className="empty-state">
            <Search size={40} className="empty-state-icon" />
            <h3 className="empty-state-title">No Tires Found</h3>
            <p style={{ fontSize: '0.85rem' }}>Try registering a new tire model or clearing the search filters.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Model Name</th>
                  <th>Type</th>
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
    );
  };

  // Render Register Tire View
  const renderAddTireView = () => {
    return (
      <section className="glass-panel" style={{ padding: '2rem' }}>
        <div className="card-header-actions" style={{ marginBottom: '1.5rem' }}>
          <h2 className="form-title" style={{ margin: 0 }}>
            <Package size={20} color="var(--accent-cyan)" />
            Registered Tire Models — {getCurrentLocationName()}
          </h2>
          <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setShowAddTireForm(!showAddTireForm)}>
            {showAddTireForm ? <X size={14} /> : <Plus size={14} />}
            {showAddTireForm ? 'Close' : 'Add New Tire'}
          </button>
        </div>

        {/* Collapsible Add Form */}
        {showAddTireForm && (
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', animation: 'slideDown 0.3s ease-out' }}>
            <form onSubmit={(e) => { handleAddTire(e); setShowAddTireForm(false); }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Tire Name / Model</label>
                <input type="text" className="input-control" placeholder="e.g. Michelin Pilot Sport 5" value={tireName} onChange={e => setTireName(e.target.value)} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Type Category</label>
                <select className="input-control" value={tireType} onChange={e => setTireType(e.target.value)}>
                  {tireTypes.map(t => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Initial Stock</label>
                <input type="number" min="0" placeholder="e.g. 24" className="input-control" value={tireQuantity} onChange={e => setTireQuantity(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: 'fit-content' }}>
                <Plus size={14} /> Register
              </button>
            </form>
          </div>
        )}

        {/* Table */}
        {activeTires.length === 0 ? (
          <div className="empty-state">
            <Package size={40} className="empty-state-icon" />
            <h3 className="empty-state-title">No Tires Registered</h3>
            <p style={{ fontSize: '0.85rem' }}>Click "Add New Tire" to register your first tire model.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tire Model</th>
                  <th>Type</th>
                  <th>Stock</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeTires.map((t, idx) => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--color-text-muted)' }}>{idx + 1}</td>
                    {editingTireId === t.id ? (
                      <>
                        <td><input type="text" className="input-control" style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }} value={editTireName} onChange={e => setEditTireName(e.target.value)} /></td>
                        <td>
                          <select className="input-control" style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }} value={editTireType} onChange={e => setEditTireType(e.target.value)}>
                            {tireTypes.map(tp => (<option key={tp} value={tp}>{tp}</option>))}
                          </select>
                        </td>
                        <td><input type="number" min="0" className="input-control" style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem', width: '80px' }} value={editTireQty} onChange={e => setEditTireQty(e.target.value)} /></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button onClick={handleUpdateTire} className="btn btn-primary btn-xs" title="Save"><Save size={12} /> Save</button>
                            <button onClick={() => setEditingTireId(null)} className="btn btn-secondary btn-xs" title="Cancel"><X size={12} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td><strong style={{ color: 'var(--color-text-primary)' }}>{t.name}</strong></td>
                        <td><span className="type-tag">{t.type}</span></td>
                        <td><strong>{t.quantity}</strong></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button onClick={() => startEditTire(t)} className="btn btn-secondary btn-xs" title="Edit"><Edit2 size={12} /> Edit</button>
                            <button onClick={() => handleDeleteTire(t.id)} className="btn btn-danger-outline btn-xs" title="Delete"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  };

  // Render Tire Types View
  const renderTireTypesView = () => {
    return (
      <section className="glass-panel" style={{ padding: '2rem' }}>
        <div className="card-header-actions" style={{ marginBottom: '1.5rem' }}>
          <h2 className="form-title" style={{ margin: 0 }}>
            <Tags size={20} color="var(--accent-cyan)" />
            Manage Tire Types
          </h2>
          <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setShowAddTypeForm(!showAddTypeForm)}>
            {showAddTypeForm ? <X size={14} /> : <Plus size={14} />}
            {showAddTypeForm ? 'Close' : 'Add New Type'}
          </button>
        </div>

        {/* Collapsible Add Form */}
        {showAddTypeForm && (
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', animation: 'slideDown 0.3s ease-out' }}>
            <form onSubmit={(e) => { handleAddTireType(e); setShowAddTypeForm(false); }} style={{ display: 'flex', gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '200px' }}>
                <label className="form-label">Tire Type Name</label>
                <input type="text" className="input-control" placeholder="e.g. Mud-Terrain, Commercial" value={newTireType} onChange={e => setNewTireType(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: 'fit-content' }}>
                <Plus size={14} /> Add Type
              </button>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Type Name</th>
                <th>Active Models</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tireTypes.map((type, idx) => {
                const count = activeTires.filter(t => t.type === type).length;
                return (
                  <tr key={type}>
                    <td style={{ color: 'var(--color-text-muted)' }}>{idx + 1}</td>
                    {editingTypeOld === type ? (
                      <>
                        <td><input type="text" className="input-control" style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }} value={editTypeName} onChange={e => setEditTypeName(e.target.value)} /></td>
                        <td><span className="type-tag">{count} models</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button onClick={handleUpdateTireType} className="btn btn-primary btn-xs"><Save size={12} /> Save</button>
                            <button onClick={() => setEditingTypeOld(null)} className="btn btn-secondary btn-xs"><X size={12} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td><strong style={{ color: 'var(--color-text-primary)' }}>{type}</strong></td>
                        <td><span className="type-tag">{count} models</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button onClick={() => startEditType(type)} className="btn btn-secondary btn-xs"><Edit2 size={12} /> Edit</button>
                            {tireTypes.length > 1 && (
                              <button onClick={() => handleDeleteTireType(type)} className="btn btn-danger-outline btn-xs"><Trash2 size={12} /></button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  // Render Sales logs list
  const renderSalesLogsView = () => {
    return (
      <section className="glass-panel" style={{ padding: '2rem' }}>
        <div className="card-header-actions" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h2 className="form-title" style={{ margin: 0 }}>
            <FileText size={20} color="var(--accent-primary)" />
            Sales History Logs
          </h2>

          {/* Date range filter tabs */}
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

        {activeTab === 'custom' && (
          <div className="date-picker-row" style={{ marginBottom: '1.5rem' }}>
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Calendar size={14} />
            <span>
              Selected Period: <strong style={{ color: '#fff' }}>{startStr}</strong> to <strong style={{ color: '#fff' }}>{endStr}</strong>
            </span>
          </div>
          <div>
            Total Sold: <strong style={{ color: 'var(--accent-primary)', fontSize: '1rem' }}>{totalTiresSold} tires</strong>
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} className="empty-state-icon" />
            <h3 className="empty-state-title">No Transactions Found</h3>
            <p style={{ fontSize: '0.85rem' }}>There are no logged sales recorded at {getCurrentLocationName()} in this date range.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tire Model</th>
                  <th>Type</th>
                  <th>Quantity Sold</th>
                  <th>Sale Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => (
                  <tr key={sale.id}>
                    <td><strong style={{ color: 'var(--color-text-primary)' }}>{sale.tireName}</strong></td>
                    <td><span className="type-tag">{sale.tireType}</span></td>
                    <td><strong style={{ color: 'var(--accent-primary)' }}>{sale.quantity} units</strong></td>
                    <td>{sale.saleDate}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteSale(sale.id)}
                        className="btn btn-danger-outline btn-xs"
                        title="Delete this transaction log and restore stock quantity"
                      >
                        Undo Sale
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  };

  // Render Log Custom Sale View
  const renderLogSaleView = () => {
    return (
      <section className="glass-panel" style={{ padding: '2rem' }}>
        <div className="card-header-actions" style={{ marginBottom: '1.5rem' }}>
          <h2 className="form-title" style={{ margin: 0 }}>
            <ShoppingBag size={20} color="var(--accent-cyan)" />
            Sales Transactions — {getCurrentLocationName()}
          </h2>
          <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setShowLogSaleForm(!showLogSaleForm)}>
            {showLogSaleForm ? <X size={14} /> : <Plus size={14} />}
            {showLogSaleForm ? 'Close' : 'Log New Sale'}
          </button>
        </div>

        {/* Collapsible Sale Form */}
        {showLogSaleForm && (
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', animation: 'slideDown 0.3s ease-out' }}>
            <form onSubmit={handleLogSale} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Tire Model</label>
                <select className="input-control" value={saleTireId} onChange={e => setSaleTireId(e.target.value)} required>
                  <option value="">-- Choose --</option>
                  {activeTires.map(t => (<option key={t.id} value={t.id} disabled={t.quantity === 0}>{t.name} (Stock: {t.quantity})</option>))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Quantity</label>
                <input type="number" min="1" className="input-control" value={saleQuantity} onChange={e => setSaleQuantity(e.target.value)} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Sale Date</label>
                <input type="date" className="input-control" value={saleDate} onChange={e => setSaleDate(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: 'fit-content' }}>
                <ShoppingBag size={14} /> Log Sale
              </button>
            </form>
          </div>
        )}

        {/* Recent Sales Table */}
        {activeSales.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={40} className="empty-state-icon" />
            <h3 className="empty-state-title">No Sales Yet</h3>
            <p style={{ fontSize: '0.85rem' }}>Click "Log New Sale" to record your first transaction.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tire Model</th>
                  <th>Type</th>
                  <th>Qty Sold</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeSales.map((s, idx) => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--color-text-muted)' }}>{idx + 1}</td>
                    <td><strong style={{ color: 'var(--color-text-primary)' }}>{s.tireName}</strong></td>
                    <td><span className="type-tag">{s.tireType}</span></td>
                    <td><strong style={{ color: 'var(--accent-primary)' }}>{s.quantity} units</strong></td>
                    <td>{s.saleDate}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDeleteSale(s.id)} className="btn btn-danger-outline btn-xs" title="Undo sale & restore stock">
                        <Trash2 size={12} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="app-layout">
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

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Brand Header */}
        <div className="brand-section" style={{ marginBottom: '1.5rem' }}>
          <div className="brand-icon">TF</div>
          <h1 className="brand-title">
            TreadFlow
            <span className="brand-subtitle">Quantity & Sales Tracker</span>
          </h1>
        </div>

        {/* Sidebar Navigation Menu */}
        <nav className="sidebar-menu">
          <div className="sidebar-group">
            <span className="sidebar-group-title">
              <LayoutDashboard size={12} /> Overview
            </span>
            <button
              className={`sidebar-nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              <TrendingUp size={16} />
              Dashboard
            </button>
          </div>

          <div className="sidebar-group">
            <span className="sidebar-group-title">
              <Package size={12} /> Tires Management
            </span>
            <button
              className={`sidebar-nav-btn ${currentView === 'inventory' ? 'active' : ''}`}
              onClick={() => setCurrentView('inventory')}
            >
              <Package size={16} />
              Tire Inventory
            </button>
            <button
              className={`sidebar-nav-btn ${currentView === 'add-tire' ? 'active' : ''}`}
              onClick={() => setCurrentView('add-tire')}
            >
              <Plus size={16} />
              Register Tire Model
            </button>
            <button
              className={`sidebar-nav-btn ${currentView === 'tire-types' ? 'active' : ''}`}
              onClick={() => setCurrentView('tire-types')}
            >
              <Tags size={16} />
              Manage Tire Types
            </button>
          </div>

          <div className="sidebar-group">
            <span className="sidebar-group-title">
              <ShoppingBag size={12} /> Sales Operations
            </span>
            <button
              className={`sidebar-nav-btn ${currentView === 'sales-logs' ? 'active' : ''}`}
              onClick={() => setCurrentView('sales-logs')}
            >
              <FileText size={16} />
              Sales History Logs
            </button>
            <button
              className={`sidebar-nav-btn ${currentView === 'log-sale' ? 'active' : ''}`}
              onClick={() => setCurrentView('log-sale')}
            >
              <ShoppingBag size={16} />
              Log Custom Sale
            </button>
          </div>
        </nav>

        {/* Reset Demo Data */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
          <button onClick={handleResetData} className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem 0.8rem', fontSize: '0.8rem' }} title="Reset to default mock data">
            <RefreshCw size={12} style={{ marginRight: '4px' }} />
            Reset Demo Data
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Toggle */}
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <Menu size={22} />
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content Area */}
      <main className="main-content" onClick={() => sidebarOpen && setSidebarOpen(false)}>
        {/* Location Selector - Dropdown */}
        <section className="glass-panel location-bar">
          <div className="location-info">
            <MapPin size={18} color="var(--accent-primary)" />
            <span>Location:</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="input-control"
              style={{ width: '220px', padding: '0.5rem 2.2rem 0.5rem 0.8rem', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}
              value={activeLocationId}
              onChange={e => setActiveLocationId(e.target.value)}
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            {isAddingLocation ? (
              <form onSubmit={handleAddLocation} className="add-location-form">
                <input type="text" className="input-control location-input" placeholder="New location" value={newLocationName} onChange={e => setNewLocationName(e.target.value)} autoFocus required />
                <button type="submit" className="btn btn-primary btn-xs">Save</button>
                <button type="button" className="btn btn-secondary btn-xs" onClick={() => setIsAddingLocation(false)}>Cancel</button>
              </form>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-xs" onClick={() => setIsAddingLocation(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={12} /> Add
                </button>
                <button className="btn btn-danger-outline btn-xs" onClick={(e) => handleDeleteLocation(activeLocationId, getCurrentLocationName(), e)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} title="Delete current location">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Date / Info Header Panel */}
        <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            <Calendar size={14} />
            <span>
              System Date: <strong style={{ color: '#fff' }}>{getRelativeDateString(0)}</strong>
            </span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
            Navigation: <strong>{currentView.replace('-', ' ')}</strong> at <strong>{getCurrentLocationName()}</strong>
          </div>
        </div>

        {/* Conditional Rendering of Views */}
        {currentView === 'dashboard' && renderDashboardView()}
        {currentView === 'inventory' && renderInventoryView()}
        {currentView === 'add-tire' && renderAddTireView()}
        {currentView === 'tire-types' && renderTireTypesView()}
        {currentView === 'sales-logs' && renderSalesLogsView()}
        {currentView === 'log-sale' && renderLogSaleView()}

        {/* Footer */}
        <footer className="app-footer">
          <div>
            <strong>TreadFlow</strong> - Performance Tire Quantity & Sales Tracker.
          </div>
          <div>
            Active Location: <strong>{getCurrentLocationName()}</strong>
          </div>
        </footer>
      </main>
    </div>
  );
}

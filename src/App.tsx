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
  Save,
  Database,
  CloudLightning,
  ChevronRight,
  ChevronDown
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

const getRelativeDateString = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getStartOfWeek = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
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

// Default Mock Data
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
  { id: 's7', tireId: 't6', tireName: 'Michelin Defender LTX', tireType: 'SUV/Truck', quantity: 3, saleDate: getRelativeDateString(1), locationId: 'loc2' },
  { id: 's8', tireId: 't7', tireName: 'Nokian Hakkapeliitta R3', tireType: 'Winter', quantity: 5, saleDate: getRelativeDateString(2), locationId: 'loc2' },
];

type AppView = 'dashboard' | 'tire-types' | 'tire-names' | 'inventory' | 'log-sale' | 'sales-logs';

export default function App() {
  const API_URL = import.meta.env.VITE_API_URL || 'https://t-inv-backend.onrender.com';

  // Navigation & UI States
  const [currentView, setCurrentView] = useState<AppView>(() => {
    const saved = localStorage.getItem('treadflow_current_view');
    return (saved as AppView) || 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tiresMenuOpen, setTiresMenuOpen] = useState(true);
  const [salesMenuOpen, setSalesMenuOpen] = useState(true);

  // Database Connection Status
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  // App Data States
  const [locations, setLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem('treadflow_locations');
    return saved ? JSON.parse(saved) : DEFAULT_LOCATIONS;
  });
  const [activeLocationId, setActiveLocationId] = useState<string>(() => {
    const saved = localStorage.getItem('treadflow_active_location_id');
    return saved || 'loc1';
  });
  const [tireTypes, setTireTypes] = useState<string[]>(() => {
    const saved = localStorage.getItem('treadflow_tire_types');
    return saved ? JSON.parse(saved) : DEFAULT_TIRE_TYPES;
  });
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

  // Collapsible Form States
  const [showAddTireForm, setShowAddTireForm] = useState(false);
  const [showAddTypeForm, setShowAddTypeForm] = useState(false);
  const [showLogSaleForm, setShowLogSaleForm] = useState(false);
  const [isAddingLocation, setIsAddingLocation] = useState(false);

  // Form Input States
  const [newLocationName, setNewLocationName] = useState('');
  const [newTireType, setNewTireType] = useState('');
  const [tireName, setTireName] = useState('');
  const [tireType, setTireType] = useState(DEFAULT_TIRE_TYPES[0] || 'All-Season');
  const [tireQuantity, setTireQuantity] = useState('');
  const [saleTireId, setSaleTireId] = useState('');
  const [saleQuantity, setSaleQuantity] = useState('1');
  const [saleDate, setSaleDate] = useState(getRelativeDateString(0));

  // Editing States
  const [editingTireId, setEditingTireId] = useState<string | null>(null);
  const [editTireName, setEditTireName] = useState('');
  const [editTireType, setEditTireType] = useState('');
  const [editTireQty, setEditTireQty] = useState('');
  const [editingTypeOld, setEditingTypeOld] = useState<string | null>(null);
  const [editTypeName, setEditTypeName] = useState('');

  // Reporting/Filters
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'lastMonth' | 'custom'>('week');
  const [customFromDate, setCustomFromDate] = useState(getRelativeDateString(30));
  const [customToDate, setCustomToDate] = useState(getRelativeDateString(0));
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Trigger temporary notification
  const triggerNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Sync default type in form
  useEffect(() => {
    if (tireTypes.length > 0 && !tireTypes.includes(tireType)) {
      setTireType(tireTypes[0]);
    }
  }, [tireTypes, tireType]);

  // Check Backend DB Connection
  useEffect(() => {
    const checkConn = async () => {
      try {
        const res = await fetch(`${API_URL}/api/health`);
        const data = await res.json();
        setDbConnected(data.status === 'healthy');
      } catch {
        setDbConnected(false);
      }
    };
    checkConn();
    const interval = setInterval(checkConn, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all data from DB if connected, otherwise save local state to LocalStorage
  useEffect(() => {
    const syncData = async () => {
      if (dbConnected === true) {
        try {
          const locRes = await fetch(`${API_URL}/api/locations`);
          if (locRes.ok) setLocations(await locRes.json());

          const typeRes = await fetch(`${API_URL}/api/tire-types`);
          if (typeRes.ok) setTireTypes(await typeRes.json());

          const tireRes = await fetch(`${API_URL}/api/tires`);
          if (tireRes.ok) setTires(await tireRes.json());

          const saleRes = await fetch(`${API_URL}/api/sales`);
          if (saleRes.ok) setSales(await saleRes.json());
        } catch (e) {
          console.error("Backend fetch error:", e);
        }
      }
    };
    syncData();
  }, [dbConnected]);

  // Write changes to LocalStorage when offline
  useEffect(() => {
    if (dbConnected === false) {
      localStorage.setItem('treadflow_locations', JSON.stringify(locations));
      localStorage.setItem('treadflow_tire_types', JSON.stringify(tireTypes));
      localStorage.setItem('treadflow_tires', JSON.stringify(tires));
      localStorage.setItem('treadflow_sales', JSON.stringify(sales));
    }
    localStorage.setItem('treadflow_current_view', currentView);
    localStorage.setItem('treadflow_active_location_id', activeLocationId);
  }, [locations, tireTypes, tires, sales, currentView, activeLocationId, dbConnected]);

  const getCurrentLocationName = () => {
    return locations.find(l => l.id === activeLocationId)?.name || 'Unknown Store';
  };

  // Reset to default mock data
  const handleResetData = async () => {
    if (window.confirm('Are you sure you want to reset all data to the demo defaults?')) {
      if (dbConnected) {
        try {
          const res = await fetch(`${API_URL}/api/reset`, { method: 'POST' });
          if (res.ok) {
            triggerNotification('Database reset successfully!');
            // Re-fetch
            const locRes = await fetch(`${API_URL}/api/locations`);
            if (locRes.ok) setLocations(await locRes.json());
            const typeRes = await fetch(`${API_URL}/api/tire-types`);
            if (typeRes.ok) setTireTypes(await typeRes.json());
            const tireRes = await fetch(`${API_URL}/api/tires`);
            if (tireRes.ok) setTires(await tireRes.json());
            const saleRes = await fetch(`${API_URL}/api/sales`);
            if (saleRes.ok) setSales(await saleRes.json());
          } else {
            triggerNotification('Failed to reset DB.', 'error');
          }
        } catch {
          triggerNotification('Network error during reset.', 'error');
        }
      } else {
        setLocations(DEFAULT_LOCATIONS);
        setActiveLocationId(DEFAULT_LOCATIONS[0].id);
        setTires(DEFAULT_TIRES);
        setSales(DEFAULT_SALES());
        setTireTypes(DEFAULT_TIRE_TYPES);
        triggerNotification('Local storage reset to demo values!');
      }
      setSearchTerm('');
      setTypeFilter('All');
      setSaleTireId('');
      setCurrentView('dashboard');
    }
  };

  // Locations CRUD
  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newLocationName.trim();
    if (!trimmed) return;
    if (locations.some(loc => loc.name.toLowerCase() === trimmed.toLowerCase())) {
      triggerNotification('Location already exists.', 'error');
      return;
    }
    const newLoc: Location = { id: `loc_${Date.now()}`, name: trimmed };

    if (dbConnected) {
      try {
        const res = await fetch(`${API_URL}/api/locations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLoc)
        });
        if (res.ok) {
          const savedLoc = await res.json();
          setLocations(prev => [...prev, savedLoc]);
          setActiveLocationId(savedLoc.id);
          triggerNotification(`Store "${trimmed}" added.`);
        } else {
          const err = await res.json();
          triggerNotification(err.error || 'Failed to add location.', 'error');
        }
      } catch {
        triggerNotification('Server connection error.', 'error');
      }
    } else {
      setLocations(prev => [...prev, newLoc]);
      setActiveLocationId(newLoc.id);
      triggerNotification(`Store "${trimmed}" added (Local).`);
    }
    setNewLocationName('');
    setIsAddingLocation(false);
  };

  const handleDeleteLocation = async (locId: string, locName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (locations.length <= 1) {
      triggerNotification('You must keep at least one location.', 'error');
      return;
    }
    const hasTires = tires.some(t => t.locationId === locId);
    const hasSales = sales.some(s => s.locationId === locId);
    if (hasTires || hasSales) {
      triggerNotification(`Cannot delete "${locName}" because it has active inventory or sales records.`, 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the location "${locName}"?`)) {
      if (dbConnected) {
        try {
          const res = await fetch(`${API_URL}/api/locations/${locId}`, { method: 'DELETE' });
          if (res.ok) {
            const remaining = locations.filter(loc => loc.id !== locId);
            setLocations(remaining);
            if (activeLocationId === locId) setActiveLocationId(remaining[0].id);
            triggerNotification(`Deleted store "${locName}".`);
          } else {
            const err = await res.json();
            triggerNotification(err.error || 'Failed to delete store.', 'error');
          }
        } catch {
          triggerNotification('Server connection error.', 'error');
        }
      } else {
        const remaining = locations.filter(loc => loc.id !== locId);
        setLocations(remaining);
        if (activeLocationId === locId) setActiveLocationId(remaining[0].id);
        triggerNotification(`Deleted store "${locName}" (Local).`);
      }
    }
  };

  // Tire Types CRUD
  const handleAddTireType = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTireType.trim();
    if (!trimmed) return;
    if (tireTypes.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      triggerNotification('Tire type already exists.', 'error');
      return;
    }

    if (dbConnected) {
      try {
        const res = await fetch(`${API_URL}/api/tire-types`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmed })
        });
        if (res.ok) {
          setTireTypes(prev => [...prev, trimmed]);
          triggerNotification(`Added tire type: ${trimmed}`);
        } else {
          const err = await res.json();
          triggerNotification(err.error || 'Failed to add type.', 'error');
        }
      } catch {
        triggerNotification('Server connection error.', 'error');
      }
    } else {
      setTireTypes(prev => [...prev, trimmed]);
      triggerNotification(`Added tire type: ${trimmed} (Local)`);
    }
    setNewTireType('');
  };

  const handleUpdateTireType = async () => {
    if (!editingTypeOld || !editTypeName.trim()) return;
    const trimmed = editTypeName.trim();
    if (trimmed.toLowerCase() !== editingTypeOld.toLowerCase() && tireTypes.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      triggerNotification('Tire type already exists.', 'error');
      return;
    }

    if (dbConnected) {
      try {
        const res = await fetch(`${API_URL}/api/tire-types/${encodeURIComponent(editingTypeOld)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmed })
        });
        if (res.ok) {
          setTireTypes(prev => prev.map(t => t === editingTypeOld ? trimmed : t));
          setTires(prev => prev.map(t => t.type === editingTypeOld ? { ...t, type: trimmed } : t));
          setSales(prev => prev.map(s => s.tireType === editingTypeOld ? { ...s, tireType: trimmed } : s));
          triggerNotification(`Updated tire type to "${trimmed}".`);
        } else {
          const err = await res.json();
          triggerNotification(err.error || 'Failed to update type.', 'error');
        }
      } catch {
        triggerNotification('Server connection error.', 'error');
      }
    } else {
      setTireTypes(prev => prev.map(t => t === editingTypeOld ? trimmed : t));
      setTires(prev => prev.map(t => t.type === editingTypeOld ? { ...t, type: trimmed } : t));
      setSales(prev => prev.map(s => s.tireType === editingTypeOld ? { ...s, tireType: trimmed } : s));
      triggerNotification(`Updated tire type to "${trimmed}" (Local).`);
    }
    setEditingTypeOld(null);
  };

  const handleDeleteTireType = async (typeToDelete: string) => {
    const isUsed = tires.some(t => t.type === typeToDelete);
    if (isUsed) {
      triggerNotification(`Cannot delete type "${typeToDelete}" because it is currently assigned to models.`, 'error');
      return;
    }

    if (dbConnected) {
      try {
        const res = await fetch(`${API_URL}/api/tire-types/${encodeURIComponent(typeToDelete)}`, { method: 'DELETE' });
        if (res.ok) {
          setTireTypes(prev => prev.filter(t => t !== typeToDelete));
          triggerNotification(`Removed tire type: ${typeToDelete}`);
        } else {
          const err = await res.json();
          triggerNotification(err.error || 'Failed to delete type.', 'error');
        }
      } catch {
        triggerNotification('Server connection error.', 'error');
      }
    } else {
      setTireTypes(prev => prev.filter(t => t !== typeToDelete));
      triggerNotification(`Removed tire type: ${typeToDelete} (Local)`);
    }
  };

  // Tires CRUD
  const handleAddTire = async (e: React.FormEvent) => {
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

    if (dbConnected) {
      try {
        const res = await fetch(`${API_URL}/api/tires`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTire)
        });
        if (res.ok) {
          const savedTire = await res.json();
          setTires(prev => [savedTire, ...prev]);
          triggerNotification(`Registered tire model: ${savedTire.name}`);
        } else {
          const err = await res.json();
          triggerNotification(err.error || 'Failed to register model.', 'error');
        }
      } catch {
        triggerNotification('Server connection error.', 'error');
      }
    } else {
      setTires(prev => [newTire, ...prev]);
      triggerNotification(`Registered tire model: ${newTire.name} (Local)`);
    }

    setTireName('');
    setTireQuantity('');
  };

  const startEditTire = (tire: Tire) => {
    setEditingTireId(tire.id);
    setEditTireName(tire.name);
    setEditTireType(tire.type);
    setEditTireQty(String(tire.quantity));
  };

  const handleUpdateTire = async () => {
    if (!editingTireId || !editTireName.trim()) return;
    const qtyNum = parseInt(editTireQty);
    if (isNaN(qtyNum) || qtyNum < 0) {
      triggerNotification('Invalid quantity.', 'error');
      return;
    }

    if (dbConnected) {
      try {
        const res = await fetch(`${API_URL}/api/tires/${editingTireId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editTireName.trim(), type: editTireType, quantity: qtyNum })
        });
        if (res.ok) {
          const updatedTire = await res.json();
          setTires(prev => prev.map(t => t.id === editingTireId ? updatedTire : t));
          setSales(prev => prev.map(s => s.tireId === editingTireId ? { ...s, tireName: updatedTire.name, tireType: updatedTire.type } : s));
          triggerNotification('Tire updated successfully!');
        } else {
          const err = await res.json();
          triggerNotification(err.error || 'Failed to update tire.', 'error');
        }
      } catch {
        triggerNotification('Server connection error.', 'error');
      }
    } else {
      setTires(prev => prev.map(t => t.id === editingTireId ? { ...t, name: editTireName.trim(), type: editTireType, quantity: qtyNum } : t));
      setSales(prev => prev.map(s => s.tireId === editingTireId ? { ...s, tireName: editTireName.trim(), tireType: editTireType } : s));
      triggerNotification('Tire updated successfully (Local)!');
    }
    setEditingTireId(null);
  };

  const handleDeleteTire = async (tireId: string) => {
    const targetTire = tires.find(t => t.id === tireId);
    if (!targetTire) return;

    if (window.confirm(`Are you sure you want to delete "${targetTire.name}"? Historical sales will not be affected.`)) {
      if (dbConnected) {
        try {
          const res = await fetch(`${API_URL}/api/tires/${tireId}`, { method: 'DELETE' });
          if (res.ok) {
            setTires(prev => prev.filter(t => t.id !== tireId));
            if (saleTireId === tireId) setSaleTireId('');
            triggerNotification(`Deleted ${targetTire.name} from active inventory.`);
          } else {
            const err = await res.json();
            triggerNotification(err.error || 'Failed to delete tire.', 'error');
          }
        } catch {
          triggerNotification('Server connection error.', 'error');
        }
      } else {
        setTires(prev => prev.filter(t => t.id !== tireId));
        if (saleTireId === tireId) setSaleTireId('');
        triggerNotification(`Deleted ${targetTire.name} from active inventory (Local).`);
      }
    }
  };

  const adjustStock = async (tireId: string, adjustment: number) => {
    const tire = tires.find(t => t.id === tireId);
    if (!tire) return;
    const newQty = Math.max(0, tire.quantity + adjustment);

    if (dbConnected) {
      try {
        const res = await fetch(`${API_URL}/api/tires/${tireId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newQty })
        });
        if (res.ok) {
          const updatedTire = await res.json();
          setTires(prev => prev.map(t => t.id === tireId ? updatedTire : t));
        } else {
          triggerNotification('Failed to update stock.', 'error');
        }
      } catch {
        triggerNotification('Server connection error.', 'error');
      }
    } else {
      setTires(prev => prev.map(t => t.id === tireId ? { ...t, quantity: newQty } : t));
    }
  };

  // Sales CRUD
  const handleLogSale = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!saleTireId) {
      triggerNotification('Please select a tire model to log a sale.', 'error');
      return;
    }
    const qtyNum = parseInt(saleQuantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      triggerNotification('Please enter a valid sale quantity.', 'error');
      return;
    }
    const targetTire = tires.find(t => t.id === saleTireId);
    if (!targetTire) {
      triggerNotification('Tire not found.', 'error');
      return;
    }
    if (targetTire.quantity < qtyNum) {
      triggerNotification(`Insufficient stock! Only ${targetTire.quantity} remaining.`, 'error');
      return;
    }

    const newSale = {
      id: `s_${Date.now()}`,
      tireId: saleTireId,
      quantity: qtyNum,
      saleDate: saleDate || getRelativeDateString(0),
      locationId: activeLocationId
    };

    if (dbConnected) {
      try {
        const res = await fetch(`${API_URL}/api/sales`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSale)
        });
        if (res.ok) {
          const loggedSale = await res.json();
          setSales(prev => [loggedSale, ...prev]);
          // Subtract local quantity state to match DB response
          setTires(prev => prev.map(t => t.id === saleTireId ? { ...t, quantity: t.quantity - qtyNum } : t));
          triggerNotification(`Logged sale of ${qtyNum}x ${targetTire.name}!`);
        } else {
          const err = await res.json();
          triggerNotification(err.error || 'Failed to log sale.', 'error');
        }
      } catch {
        triggerNotification('Server connection error.', 'error');
      }
    } else {
      setTires(prev => prev.map(t => t.id === saleTireId ? { ...t, quantity: t.quantity - qtyNum } : t));
      const offlineSale: Sale = {
        id: newSale.id,
        tireId: saleTireId,
        tireName: targetTire.name,
        tireType: targetTire.type,
        quantity: qtyNum,
        saleDate: newSale.saleDate,
        locationId: activeLocationId
      };
      setSales(prev => [offlineSale, ...prev]);
      triggerNotification(`Logged sale of ${qtyNum}x ${targetTire.name} (Local)!`);
    }
    setSaleQuantity('1');
  };

  const handleQuickSale = async (tireId: string, quantity: number) => {
    const targetTire = tires.find(t => t.id === tireId);
    if (!targetTire) return;
    if (targetTire.quantity < quantity) {
      triggerNotification(`Insufficient stock for quick sale.`, 'error');
      return;
    }

    const newSale = {
      id: `s_${Date.now()}`,
      tireId: tireId,
      quantity: quantity,
      saleDate: getRelativeDateString(0),
      locationId: activeLocationId
    };

    if (dbConnected) {
      try {
        const res = await fetch(`${API_URL}/api/sales`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSale)
        });
        if (res.ok) {
          const loggedSale = await res.json();
          setSales(prev => [loggedSale, ...prev]);
          setTires(prev => prev.map(t => t.id === tireId ? { ...t, quantity: t.quantity - quantity } : t));
          triggerNotification(`Logged quick sale of ${quantity}x ${targetTire.name}!`);
        }
      } catch {
        triggerNotification('Server connection error.', 'error');
      }
    } else {
      setTires(prev => prev.map(t => t.id === tireId ? { ...t, quantity: t.quantity - quantity } : t));
      const offlineSale: Sale = {
        id: newSale.id,
        tireId: tireId,
        tireName: targetTire.name,
        tireType: targetTire.type,
        quantity: quantity,
        saleDate: newSale.saleDate,
        locationId: activeLocationId
      };
      setSales(prev => [offlineSale, ...prev]);
      triggerNotification(`Logged quick sale of ${quantity}x ${targetTire.name} (Local)!`);
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    const saleToDelete = sales.find(s => s.id === saleId);
    if (!saleToDelete) return;

    if (dbConnected) {
      try {
        const res = await fetch(`${API_URL}/api/sales/${saleId}`, { method: 'DELETE' });
        if (res.ok) {
          setSales(prev => prev.filter(s => s.id !== saleId));
          const tireExists = tires.some(t => t.id === saleToDelete.tireId);
          if (tireExists) {
            setTires(prev => prev.map(t => t.id === saleToDelete.tireId ? { ...t, quantity: t.quantity + saleToDelete.quantity } : t));
          }
          triggerNotification('Sale transaction cancelled & stock restored.');
        } else {
          const err = await res.json();
          triggerNotification(err.error || 'Failed to undo sale.', 'error');
        }
      } catch {
        triggerNotification('Server connection error.', 'error');
      }
    } else {
      const tireExists = tires.some(t => t.id === saleToDelete.tireId);
      if (tireExists) {
        setTires(prev => prev.map(t => t.id === saleToDelete.tireId ? { ...t, quantity: t.quantity + saleToDelete.quantity } : t));
      }
      setSales(prev => prev.filter(s => s.id !== saleId));
      triggerNotification('Sale transaction cancelled & stock restored (Local).');
    }
  };

  // Filter Active Data
  const activeTires = tires.filter(t => t.locationId === activeLocationId);
  const activeSales = sales.filter(s => s.locationId === activeLocationId);

  // Date boundary filtering
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

  const filteredSales = activeSales.filter(sale => {
    return sale.saleDate >= startStr && sale.saleDate <= endStr;
  });

  // KPI Calculations
  const totalTiresSold = filteredSales.reduce((sum, s) => sum + s.quantity, 0);
  const totalCurrentStock = activeTires.reduce((sum, t) => sum + t.quantity, 0);
  const lowStockCount = activeTires.filter(t => t.quantity < 5).length;

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

  // Chart Chronological Calculations
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
        return { label, quantity: dateMap[dateStr] };
      });
    }
  };

  const chartData = getDailyTrendData();
  const maxChartQty = Math.max(...chartData.map(d => d.quantity), 1);

  const getTopSellingTires = () => {
    const modelMap: { [key: string]: { name: string, type: string, quantity: number } } = {};
    filteredSales.forEach(sale => {
      if (!modelMap[sale.tireName]) {
        modelMap[sale.tireName] = { name: sale.tireName, type: sale.tireType, quantity: 0 };
      }
      modelMap[sale.tireName].quantity += sale.quantity;
    });
    return Object.values(modelMap).sort((a, b) => b.quantity - a.quantity).slice(0, 4);
  };

  const topSellers = getTopSellingTires();
  const maxSellerQty = Math.max(...topSellers.map(s => s.quantity), 1);

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
    return Object.values(typeMap).filter(t => t.quantity > 0).sort((a, b) => b.quantity - a.quantity);
  };

  const typeSales = getTypeSales();
  const totalTypeQuantity = typeSales.reduce((acc, curr) => acc + curr.quantity, 0);

  const filteredInventory = activeTires.filter(tire => {
    const matchesSearch = tire.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tire.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || tire.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Views Renders
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
          <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Sales Volume Performance */}
            <section className="glass-panel" style={{ padding: '1.75rem' }}>
              <div className="card-header-actions" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <h2 className="form-title" style={{ margin: 0 }}>
                  <TrendingUp size={20} color="var(--accent-primary)" />
                  Sales Volume Trend & Breakdown
                </h2>

                {/* Tabs */}
                <div className="tabs-header" style={{ margin: 0, border: 0, padding: 0 }}>
                  <button onClick={() => setActiveTab('week')} className={`tab-btn ${activeTab === 'week' ? 'active' : ''}`}>This Week</button>
                  <button onClick={() => setActiveTab('month')} className={`tab-btn ${activeTab === 'month' ? 'active' : ''}`}>This Month</button>
                  <button onClick={() => setActiveTab('lastMonth')} className={`tab-btn ${activeTab === 'lastMonth' ? 'active' : ''}`}>Last Month</button>
                  <button onClick={() => setActiveTab('custom')} className={`tab-btn ${activeTab === 'custom' ? 'active' : ''}`}>Custom Range</button>
                </div>
              </div>

              {/* Custom Date Picker row */}
              {activeTab === 'custom' && (
                <div className="date-picker-row">
                  <div className="form-group" style={{ margin: 0, flex: 1 }}>
                    <label className="form-label">From Date</label>
                    <input type="date" className="input-control" value={customFromDate} onChange={e => setCustomFromDate(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0, flex: 1 }}>
                    <label className="form-label">To Date</label>
                    <input type="date" className="input-control" value={customToDate} onChange={e => setCustomToDate(e.target.value)} />
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
                  {/* Daily Trend Chart (SVG) */}
                  <div className="glass-panel" style={{ gridColumn: 'span 7', padding: '1.25rem', background: 'rgba(255,255,255,0.01)' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Sales Trend (Quantity Sold)</h3>
                    <div className="chart-container">
                      <div className="chart-bar-group">
                        {chartData.map((item, idx) => {
                          const height = (item.quantity / maxChartQty) * 85;
                          return (
                            <div key={idx} className="chart-bar-wrapper">
                              <div className="chart-bar" style={{ height: `${Math.max(height, 6)}%` }}>
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

                  {/* Top Selling Products */}
                  <div className="glass-panel" style={{ gridColumn: 'span 5', padding: '1.25rem', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Top Selling Models</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {topSellers.map((seller, idx) => {
                          const widthPct = (seller.quantity / maxSellerQty) * 100;
                          return (
                            <div key={idx}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }} title={seller.name}>
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

          {/* Right Side: Last Entry Logs */}
          <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Last Entry / Recent Logs */}
            <section className="glass-panel" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h2 className="form-title" style={{ marginBottom: '1rem' }}>
                <FileText size={20} color="var(--accent-secondary)" />
                Last Entry Logs ({filteredSales.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
                {filteredSales.slice(0, 6).map(sale => (
                  <div key={sale.id} className="glass-panel" style={{ padding: '0.85rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.01)', borderStyle: 'dashed' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }} title={sale.tireName}>
                        {sale.tireName}
                      </span>
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                        {sale.quantity} units
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                      <span>Type: <strong>{sale.tireType}</strong></span>
                      <span>{sale.saleDate}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button
                        onClick={() => handleDeleteSale(sale.id)}
                        className="btn btn-danger-outline"
                        style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                        title="Delete sale and restore stock"
                      >
                        Undo Sale
                      </button>
                    </div>
                  </div>
                ))}

                {filteredSales.length === 0 && (
                  <div style={{ margin: 'auto', textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)' }}>
                    <p style={{ fontSize: '0.85rem' }}>No sales recorded for this period.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </>
    );
  };

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

        {/* Add Type Form */}
        {showAddTypeForm && (
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', animation: 'slideDown 0.3s ease-out' }}>
            <form onSubmit={(e) => { handleAddTireType(e); setShowAddTypeForm(false); }} style={{ display: 'flex', gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '200px' }}>
                <label className="form-label">Tire Type Category Name</label>
                <input type="text" className="input-control" placeholder="e.g. Mud-Terrain, Commercial" value={newTireType} onChange={e => setNewTireType(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: 'fit-content' }}>
                <Plus size={14} /> Add Type
              </button>
            </form>
          </div>
        )}

        {/* Types Table */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Type Category Name</th>
                <th>Active Models at location</th>
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

  const startEditType = (oldType: string) => {
    setEditingTypeOld(oldType);
    setEditTypeName(oldType);
  };

  const renderTireNamesView = () => {
    return (
      <section className="glass-panel" style={{ padding: '2rem' }}>
        <div className="card-header-actions" style={{ marginBottom: '1.5rem' }}>
          <h2 className="form-title" style={{ margin: 0 }}>
            <Package size={20} color="var(--accent-cyan)" />
            Register Tire Model Name
          </h2>
          <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setShowAddTireForm(!showAddTireForm)}>
            {showAddTireForm ? <X size={14} /> : <Plus size={14} />}
            {showAddTireForm ? 'Close' : 'Register New Tire'}
          </button>
        </div>

        {/* Collapsible Register Form */}
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

        {/* Tires List */}
        {activeTires.length === 0 ? (
          <div className="empty-state">
            <Package size={40} className="empty-state-icon" />
            <h3 className="empty-state-title">No Tire Models Registered</h3>
            <p style={{ fontSize: '0.85rem' }}>Click "Register New Tire" to register your first model at this shop.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tire Model</th>
                  <th>Type</th>
                  <th>Stock Quantity</th>
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
            <p style={{ fontSize: '0.85rem' }}>Try registering a new model name under the Tire Model tab.</p>
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
                      <td><strong style={{ color: 'var(--color-text-primary)' }}>{tire.name}</strong></td>
                      <td><span className="type-tag">{tire.type}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button onClick={() => adjustStock(tire.id, -1)} className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '0.75rem' }} title="Subtract 1 stock">-</button>
                          <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 'bold' }}>{tire.quantity}</span>
                          <button onClick={() => adjustStock(tire.id, 1)} className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '0.75rem' }} title="Add 1 stock">+</button>
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
                        <button
                          onClick={() => handleQuickSale(tire.id, 1)}
                          className="btn btn-primary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          disabled={isOutOfStock}
                        >
                          Sell 1
                        </button>
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

  const renderLogSaleView = () => {
    return (
      <section className="glass-panel" style={{ padding: '2rem' }}>
        <div className="card-header-actions" style={{ marginBottom: '1.5rem' }}>
          <h2 className="form-title" style={{ margin: 0 }}>
            <ShoppingBag size={20} color="var(--accent-cyan)" />
            Log Custom Sale — {getCurrentLocationName()}
          </h2>
          <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setShowLogSaleForm(!showLogSaleForm)}>
            {showLogSaleForm ? <X size={14} /> : <Plus size={14} />}
            {showLogSaleForm ? 'Close' : 'Log New Sale'}
          </button>
        </div>

        {/* Collapsible Sale Form */}
        {showLogSaleForm && (
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', animation: 'slideDown 0.3s ease-out' }}>
            <form onSubmit={(e) => { handleLogSale(e); setShowLogSaleForm(false); }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
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

        {/* Recent sales table */}
        {activeSales.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={40} className="empty-state-icon" />
            <h3 className="empty-state-title">No Transactions Yet</h3>
            <p style={{ fontSize: '0.85rem' }}>Use the form to record custom sales at this location.</p>
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
                {activeSales.slice(0, 10).map((s, idx) => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--color-text-muted)' }}>{idx + 1}</td>
                    <td><strong style={{ color: 'var(--color-text-primary)' }}>{s.tireName}</strong></td>
                    <td><span className="type-tag">{s.tireType}</span></td>
                    <td><strong style={{ color: 'var(--accent-primary)' }}>{s.quantity} units</strong></td>
                    <td>{s.saleDate}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDeleteSale(s.id)} className="btn btn-danger-outline btn-xs" title="Undo sale & restore stock">
                        <Trash2 size={12} /> Undo
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

  const renderSalesLogsView = () => {
    return (
      <section className="glass-panel" style={{ padding: '2rem' }}>
        <div className="card-header-actions" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h2 className="form-title" style={{ margin: 0 }}>
            <FileText size={20} color="var(--accent-primary)" />
            Sales History Logs
          </h2>

          <div className="tabs-header" style={{ margin: 0, border: 0, padding: 0 }}>
            <button onClick={() => setActiveTab('week')} className={`tab-btn ${activeTab === 'week' ? 'active' : ''}`}>This Week</button>
            <button onClick={() => setActiveTab('month')} className={`tab-btn ${activeTab === 'month' ? 'active' : ''}`}>This Month</button>
            <button onClick={() => setActiveTab('lastMonth')} className={`tab-btn ${activeTab === 'lastMonth' ? 'active' : ''}`}>Last Month</button>
            <button onClick={() => setActiveTab('custom')} className={`tab-btn ${activeTab === 'custom' ? 'active' : ''}`}>Custom Range</button>
          </div>
        </div>

        {activeTab === 'custom' && (
          <div className="date-picker-row" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ margin: 0, flex: 1 }}>
              <label className="form-label">From Date</label>
              <input type="date" className="input-control" value={customFromDate} onChange={e => setCustomFromDate(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0, flex: 1 }}>
              <label className="form-label">To Date</label>
              <input type="date" className="input-control" value={customToDate} onChange={e => setCustomToDate(e.target.value)} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Calendar size={14} />
            <span>Selected Period: <strong style={{ color: '#fff' }}>{startStr}</strong> to <strong style={{ color: '#fff' }}>{endStr}</strong></span>
          </div>
          <div>Total Sold: <strong style={{ color: 'var(--accent-primary)' }}>{totalTiresSold} tires</strong></div>
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
                  <th>#</th>
                  <th>Tire Model</th>
                  <th>Type</th>
                  <th>Quantity Sold</th>
                  <th>Sale Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale, idx) => (
                  <tr key={sale.id}>
                    <td style={{ color: 'var(--color-text-muted)' }}>{idx + 1}</td>
                    <td><strong style={{ color: 'var(--color-text-primary)' }}>{sale.tireName}</strong></td>
                    <td><span className="type-tag">{sale.tireType}</span></td>
                    <td><strong style={{ color: 'var(--accent-primary)' }}>{sale.quantity} units</strong></td>
                    <td>{sale.saleDate}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDeleteSale(sale.id)} className="btn btn-danger-outline btn-xs" title="Undo transaction & restore stock">Undo Sale</button>
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
        {/* Brand */}
        <div className="brand-section" style={{ marginBottom: '1rem' }}>
          <div className="brand-icon">TF</div>
          <h1 className="brand-title">
            TreadFlow
            <span className="brand-subtitle">Quantity & Sales Tracker</span>
          </h1>
        </div>

        {/* Navigation menu */}
        <nav className="sidebar-menu">
          <div className="sidebar-group">
            <span className="sidebar-group-title">
              <LayoutDashboard size={12} /> Overview
            </span>
            <button
              className={`sidebar-nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setCurrentView('dashboard'); setSidebarOpen(false); }}
            >
              <TrendingUp size={16} />
              Dashboard
            </button>
          </div>

          <div className="sidebar-group">
            <button className="sidebar-group-title sidebar-group-toggle" onClick={() => setTiresMenuOpen(!tiresMenuOpen)}>
              <Package size={12} style={{ marginRight: '6px' }} /> Tires Management
              <span className="sidebar-chevron">{tiresMenuOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>
            </button>
            {tiresMenuOpen && (
              <div className="sidebar-sub-items">
                <button
                  className={`sidebar-nav-btn ${currentView === 'tire-types' ? 'active' : ''} sidebar-nav-indent`}
                  onClick={() => { setCurrentView('tire-types'); setSidebarOpen(false); }}
                >
                  <Tags size={14} />
                  Tire Type
                </button>
                <button
                  className={`sidebar-nav-btn ${currentView === 'tire-names' ? 'active' : ''} sidebar-nav-indent`}
                  onClick={() => { setCurrentView('tire-names'); setSidebarOpen(false); }}
                >
                  <Plus size={14} />
                  Tire Name
                </button>
                <button
                  className={`sidebar-nav-btn ${currentView === 'inventory' ? 'active' : ''} sidebar-nav-indent`}
                  onClick={() => { setCurrentView('inventory'); setSidebarOpen(false); }}
                >
                  <Package size={14} />
                  Tire Inventory
                </button>
              </div>
            )}
          </div>

          <div className="sidebar-group">
            <button className="sidebar-group-title sidebar-group-toggle" onClick={() => setSalesMenuOpen(!salesMenuOpen)}>
              <ShoppingBag size={12} style={{ marginRight: '6px' }} /> Sales Operations
              <span className="sidebar-chevron">{salesMenuOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>
            </button>
            {salesMenuOpen && (
              <div className="sidebar-sub-items">
                <button
                  className={`sidebar-nav-btn ${currentView === 'log-sale' ? 'active' : ''} sidebar-nav-indent`}
                  onClick={() => { setCurrentView('log-sale'); setSidebarOpen(false); }}
                >
                  <ShoppingBag size={14} />
                  Log Sale
                </button>
                <button
                  className={`sidebar-nav-btn ${currentView === 'sales-logs' ? 'active' : ''} sidebar-nav-indent`}
                  onClick={() => { setCurrentView('sales-logs'); setSidebarOpen(false); }}
                >
                  <FileText size={14} />
                  Sales History Logs
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Reset Data */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
          <button onClick={handleResetData} className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem 0.8rem', fontSize: '0.8rem' }} title="Reset to default mock data">
            <RefreshCw size={12} style={{ marginRight: '4px' }} />
            Reset Demo Data
          </button>
        </div>
      </aside>

      {/* Mobile Menu Trigger */}
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <Menu size={22} />
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content Area */}
      <main className="main-content" onClick={() => sidebarOpen && setSidebarOpen(false)}>
        {/* Top Header Selector & Connection Status */}
        <section className="glass-panel location-bar">
          <div className="location-info">
            <MapPin size={18} color="var(--accent-primary)" />
            <span>Active Store Location:</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Database status indicator */}
            {dbConnected === true ? (
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'none', background: 'rgba(16, 185, 129, 0.08)' }}>
                <CloudLightning size={12} /> Connected to Cloud DB
              </span>
            ) : dbConnected === false ? (
              <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'none', background: 'rgba(245, 158, 11, 0.08)' }}>
                <Database size={12} /> Offline Mode (Local Storage)
              </span>
            ) : (
              <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'none', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
                <RefreshCw size={12} className="animate-spin" /> Verifying Connection...
              </span>
            )}

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

        {/* Render Views conditionally */}
        {currentView === 'dashboard' && renderDashboardView()}
        {currentView === 'tire-types' && renderTireTypesView()}
        {currentView === 'tire-names' && renderTireNamesView()}
        {currentView === 'inventory' && renderInventoryView()}
        {currentView === 'log-sale' && renderLogSaleView()}
        {currentView === 'sales-logs' && renderSalesLogsView()}

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

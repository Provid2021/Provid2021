import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mobile-optimized hamburger menu
const MobileMenu = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl transform transition-transform">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button onClick={onClose} className="p-2 text-gray-500">✕</button>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-4">
            <li><a href="#" className="block py-2 text-gray-700">🏠 Dashboard</a></li>
            <li><a href="#" className="block py-2 text-gray-700">🐄 Animaux</a></li>
            <li><a href="#" className="block py-2 text-gray-700">💰 Finances</a></li>
            <li><a href="#" className="block py-2 text-gray-700">📊 Rapports</a></li>
            <li><a href="#" className="block py-2 text-gray-700">⚙️ Paramètres</a></li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

// Mobile Header Component with Hamburger
const MobileHeader = ({ onAddAnimal, onMenuToggle }) => {
  return (
    <header className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 sticky top-0 z-40 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-700 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-xl">🐄</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Élevage la Providence</h1>
            <p className="text-sm opacity-90">Mobile - Gestion d'élevage</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onAddAnimal}
            className="bg-green-700 px-4 py-2 rounded-lg text-sm font-medium active:bg-green-800 transform active:scale-95 transition-all shadow-md"
          >
            + Animal
          </button>
          <button
            onClick={onMenuToggle}
            className="p-2 text-white bg-green-700 rounded-lg active:bg-green-800 transition-colors"
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
};

// Statistics Card Component
const StatCard = ({ icon, title, value, subtitle, color }) => {
  return (
    <div className={`${color} rounded-lg p-4 text-white shadow-lg`}>
      <div className="flex items-center space-x-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <h3 className="text-sm font-medium opacity-90">{title}</h3>
          <p className="text-xl font-bold">{value}</p>
          {subtitle && <p className="text-xs opacity-80">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

// Animal Card Component for Mobile
const AnimalCard = ({ animal, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 mb-3">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-lg">{animal.type === 'poulet' ? '🐔' : '🐷'}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{animal.name}</h3>
          <p className="text-sm text-gray-600">{animal.category}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(animal)}
            className="p-2 text-blue-600 bg-blue-50 rounded-lg active:bg-blue-100 transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(animal.id)}
            className="p-2 text-red-600 bg-red-50 rounded-lg active:bg-red-100 transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Sexe</p>
          <p className="font-medium text-gray-900">{animal.sex}</p>
        </div>
        <div>
          <p className="text-gray-500">Âge</p>
          <p className="font-medium text-gray-900">{animal.age}</p>
        </div>
        <div>
          <p className="text-gray-500">Poids</p>
          <p className="font-medium text-gray-900">{animal.weight} kg</p>
        </div>
      </div>
    </div>
  );
};

// Filter Component
const FilterSection = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white p-4 shadow-sm border-b border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Filtres et tri</h2>
      
      <div className="space-y-4">
        {/* Status Filter */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Statut des animaux:</p>
          <div className="flex space-x-2">
            <button
              onClick={() => onFilterChange('status', 'actif')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.status === 'actif' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              ✅ Actifs
            </button>
            <button
              onClick={() => onFilterChange('status', 'vendu')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.status === 'vendu' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              💰 Vendus
            </button>
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Filtrer par type:</p>
          <div className="flex space-x-2">
            <button
              onClick={() => onFilterChange('type', 'all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.type === 'all' 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              🏠 Tous
            </button>
            <button
              onClick={() => onFilterChange('type', 'poulet')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.type === 'poulet' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              🐔 Poulets
            </button>
            <button
              onClick={() => onFilterChange('type', 'porc')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.type === 'porc' 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              🐷 Porcs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Home Component
const Home = () => {
  const [animals, setAnimals] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({ status: 'actif', type: 'all' });
  const [loading, setLoading] = useState(true);

  // Fetch data
  const fetchAnimals = async () => {
    try {
      const response = await axios.get(`${API}/animals`);
      setAnimals(response.data);
    } catch (error) {
      console.error('Error fetching animals:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const deleteAnimal = async (animalId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet animal ?')) {
      try {
        await axios.delete(`${API}/animals/${animalId}`);
        fetchAnimals();
        fetchStats();
      } catch (error) {
        console.error('Error deleting animal:', error);
      }
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  // Filter animals based on current filters
  const filteredAnimals = animals.filter(animal => {
    if (filters.status !== 'all' && animal.status !== filters.status) return false;
    if (filters.type !== 'all' && animal.type !== filters.type) return false;
    return true;
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAnimals(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader onAddAnimal={() => alert('Fonctionnalité à venir')} />
      
      {/* Statistics Section */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon="🏠"
            title="CHEPTEL TOTAL"
            value={stats.total_livestock || 0}
            subtitle="Animaux actifs"
            color="bg-green-500"
          />
          <StatCard
            icon="🐔"
            title="VOLAILLES"
            value={stats.poultry?.count || 0}
            subtitle="4 vague(s)"
            color="bg-orange-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon="🐷"
            title="PORCINS"
            value={stats.pigs?.count || 0}
            subtitle="Élevage individuel"
            color="bg-pink-500"
          />
          <StatCard
            icon="♂️"
            title="MÂLES"
            value={stats.males || 0}
            subtitle="Reproducteurs"
            color="bg-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon="♀️"
            title="FEMELLES"
            value={stats.females || 0}
            subtitle="Reproductrices"
            color="bg-purple-500"
          />
          <StatCard
            icon="💰"
            title="RENTABILITÉ"
            value="3504444"
            subtitle="FCFA - Bénéfice mensuel"
            color="bg-green-600"
          />
        </div>
      </div>

      {/* Filters */}
      <FilterSection filters={filters} onFilterChange={handleFilterChange} />

      {/* Animals List */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Liste des Animaux ({filteredAnimals.length})
          </h2>
        </div>
        
        <div className="space-y-3">
          {filteredAnimals.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              onEdit={() => alert('Fonctionnalité à venir')}
              onDelete={deleteAnimal}
            />
          ))}
        </div>
        
        {filteredAnimals.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun animal trouvé avec ces filtres</p>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
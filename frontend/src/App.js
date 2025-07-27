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

// Statistics Card Component with better mobile design
const StatCard = ({ icon, title, value, subtitle, color, className = "" }) => {
  return (
    <div className={`${color} rounded-xl p-4 text-white shadow-lg transform transition-transform active:scale-95 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <h3 className="text-sm font-medium opacity-90 uppercase tracking-wide">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs opacity-80 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

// Animal Card Component for Mobile - Completely redesigned
const AnimalCard = ({ animal, onEdit, onDelete }) => {
  const animalIcon = animal.type === 'poulet' ? '🐔' : '🐷';
  const sexIcon = animal.sex === 'Mâle' ? '♂️' : '♀️';
  const sexColor = animal.sex === 'Mâle' ? 'text-blue-600' : 'text-pink-600';
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 mb-4 transform transition-transform active:scale-[0.98]">
      {/* Header with animal info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
            <span className="text-xl">{animalIcon}</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{animal.name}</h3>
            <p className="text-sm text-gray-600">{animal.category}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xl ${sexColor}`}>{sexIcon}</span>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Âge</p>
          <p className="font-bold text-gray-900 text-lg">{animal.age}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Poids</p>
          <p className="font-bold text-gray-900 text-lg">{animal.weight} kg</p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(animal)}
          className="flex-1 py-3 px-4 bg-blue-50 text-blue-600 rounded-xl font-medium active:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
        >
          <span>✏️</span>
          <span>Modifier</span>
        </button>
        <button
          onClick={() => onDelete(animal.id)}
          className="flex-1 py-3 px-4 bg-red-50 text-red-600 rounded-xl font-medium active:bg-red-100 transition-colors flex items-center justify-center space-x-2"
        >
          <span>🗑️</span>
          <span>Supprimer</span>
        </button>
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

// Main Home Component with mobile menu
const Home = () => {
  const [animals, setAnimals] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({ status: 'actif', type: 'all' });
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <MobileHeader 
        onAddAnimal={() => alert('Fonctionnalité Ajouter Animal à venir')} 
        onMenuToggle={() => setIsMenuOpen(true)}
      />
      
      <MobileMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />
      
      {/* Statistics Section */}
      <div className="p-4 space-y-4">
        {/* Top Row */}
        <div className="grid grid-cols-1 gap-4">
          <StatCard
            icon="🏠"
            title="Cheptel Total"
            value={stats.total_livestock || 0}
            subtitle="Animaux actifs dans l'élevage"
            color="bg-gradient-to-r from-green-500 to-green-600"
            className="col-span-1"
          />
        </div>
        
        {/* Second Row */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon="🐔"
            title="Volailles"
            value={stats.poultry?.count || 0}
            subtitle="4 vague(s)"
            color="bg-gradient-to-r from-orange-500 to-orange-600"
          />
          <StatCard
            icon="🐷"
            title="Porcins"
            value={stats.pigs?.count || 0}
            subtitle="Élevage individuel"
            color="bg-gradient-to-r from-pink-500 to-pink-600"
          />
        </div>
        
        {/* Third Row */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon="♂️"
            title="Mâles"
            value={stats.males || 0}
            subtitle="Reproducteurs"
            color="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          <StatCard
            icon="♀️"
            title="Femelles"
            value={stats.females || 0}
            subtitle="Reproductrices"
            color="bg-gradient-to-r from-purple-500 to-purple-600"
          />
        </div>
        
        {/* Bottom Row */}
        <div className="grid grid-cols-1 gap-4">
          <StatCard
            icon="💰"
            title="Rentabilité Mensuelle"
            value="3,504,444 FCFA"
            subtitle="Bénéfice net mensuel"
            color="bg-gradient-to-r from-green-600 to-green-700"
          />
        </div>
      </div>

      {/* Filters */}
      <FilterSection filters={filters} onFilterChange={handleFilterChange} />

      {/* Animals List */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Liste des Animaux ({filteredAnimals.length})
          </h2>
        </div>
        
        <div className="space-y-4">
          {filteredAnimals.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              onEdit={() => alert('Fonctionnalité Modifier à venir')}
              onDelete={deleteAnimal}
            />
          ))}
        </div>
        
        {filteredAnimals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐄</div>
            <p className="text-gray-500 text-lg">Aucun animal trouvé avec ces filtres</p>
            <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>
      
      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => alert('Fonctionnalité Ajouter Animal à venir')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl active:scale-95 transform transition-transform lg:hidden"
      >
        +
      </button>
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
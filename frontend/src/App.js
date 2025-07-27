import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Formulaire d'ajout d'animal mobile
const AddAnimalModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    sex: 'Mâle',
    age: '',
    weight: '',
    type: 'poulet'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const animalData = {
        ...formData,
        weight: parseFloat(formData.weight)
      };
      
      const response = await axios.post(`${API}/animals`, animalData);
      
      if (response.status === 200 || response.status === 201) {
        onAdd(response.data);
        setFormData({
          name: '',
          category: '',
          sex: 'Mâle',
          age: '',
          weight: '',
          type: 'poulet'
        });
        onClose();
        alert('🎉 Animal ajouté avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      alert('❌ Erreur lors de l\'ajout de l\'animal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-green-600 text-white p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">🐄 Ajouter un Animal</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-green-700 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nom de l'animal */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom de l'animal *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Poulet #001, Cochon Marie..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Type d'animal */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type d'animal *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleChange('type', 'poulet')}
                className={`p-3 rounded-xl font-medium transition-all ${
                  formData.type === 'poulet'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                🐔 Poulet
              </button>
              <button
                type="button"
                onClick={() => handleChange('type', 'porc')}
                className={`p-3 rounded-xl font-medium transition-all ${
                  formData.type === 'porc'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                🐷 Porc
              </button>
            </div>
          </div>

          {/* Catégorie/Race */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Race/Catégorie *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Sélectionner une race...</option>
              {formData.type === 'poulet' ? (
                <>
                  <option value="Plymouth Rock">Plymouth Rock</option>
                  <option value="Sussex">Sussex</option>
                  <option value="Rhode Island Red">Rhode Island Red</option>
                  <option value="Leghorn">Leghorn</option>
                </>
              ) : (
                <>
                  <option value="Large White">Large White</option>
                  <option value="Landrace">Landrace</option>
                  <option value="Duroc">Duroc</option>
                  <option value="Yorkshire">Yorkshire</option>
                </>
              )}
            </select>
          </div>

          {/* Sexe */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sexe *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleChange('sex', 'Mâle')}
                className={`p-3 rounded-xl font-medium transition-all ${
                  formData.sex === 'Mâle'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                ♂️ Mâle
              </button>
              <button
                type="button"
                onClick={() => handleChange('sex', 'Femelle')}
                className={`p-3 rounded-xl font-medium transition-all ${
                  formData.sex === 'Femelle'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                ♀️ Femelle
              </button>
            </div>
          </div>

          {/* Âge */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Âge *
            </label>
            <input
              type="text"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              placeholder="Ex: 30 jours, 2 mois, 1 an..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Poids */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Poids (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              placeholder="Ex: 1.5"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Boutons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Ajout...
                </>
              ) : (
                <>
                  ➕ Ajouter l'animal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Menu mobile optimisé avec navigation française
const MobileMenu = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-xl transform transition-transform slide-in-right">
        <div className="p-4 border-b bg-green-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-green-800">Navigation</h2>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Fermer le menu"
            >
              ✕
            </button>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <a href="#" className="flex items-center py-3 px-4 text-gray-700 hover:bg-green-50 rounded-lg transition-colors">
                <span className="text-xl mr-3">🏠</span>
                <span className="font-medium">Tableau de bord</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center py-3 px-4 text-gray-700 hover:bg-green-50 rounded-lg transition-colors">
                <span className="text-xl mr-3">🐄</span>
                <span className="font-medium">Gestion des animaux</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center py-3 px-4 text-gray-700 hover:bg-green-50 rounded-lg transition-colors">
                <span className="text-xl mr-3">💰</span>
                <span className="font-medium">Finances</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center py-3 px-4 text-gray-700 hover:bg-green-50 rounded-lg transition-colors">
                <span className="text-xl mr-3">📊</span>
                <span className="font-medium">Rapports</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center py-3 px-4 text-gray-700 hover:bg-green-50 rounded-lg transition-colors">
                <span className="text-xl mr-3">⚙️</span>
                <span className="font-medium">Paramètres</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center py-3 px-4 text-gray-700 hover:bg-green-50 rounded-lg transition-colors">
                <span className="text-xl mr-3">📱</span>
                <span className="font-medium">Version mobile</span>
              </a>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-4 left-4 right-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            🌱 Élevage naturel & responsable
          </p>
        </div>
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

// Animal Card Component for Mobile - Avec fonction de vente
const AnimalCard = ({ animal, onEdit, onDelete, onSell }) => {
  const animalIcon = animal.type === 'poulet' ? '🐔' : '🐷';
  const sexIcon = animal.sex === 'Mâle' ? '♂️' : '♀️';
  const sexColor = animal.sex === 'Mâle' ? 'text-blue-600' : 'text-pink-600';
  const isActive = animal.status === 'actif';
  
  return (
    <div className={`rounded-xl p-4 shadow-md border mb-4 transform transition-transform active:scale-[0.98] ${
      isActive ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-200'
    }`}>
      {/* Header avec info animal */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isActive ? 'bg-gradient-to-br from-green-100 to-green-200' : 'bg-gray-200'
          }`}>
            <span className="text-xl">{animalIcon}</span>
          </div>
          <div>
            <h3 className={`font-bold text-lg ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
              {animal.name}
            </h3>
            <p className="text-sm text-gray-600">{animal.category}</p>
            {!isActive && (
              <span className="inline-block bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
                💰 Vendu
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xl ${sexColor}`}>{sexIcon}</span>
        </div>
      </div>
      
      {/* Grille des stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Âge</p>
          <p className={`font-bold text-lg ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
            {animal.age}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Poids</p>
          <p className={`font-bold text-lg ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
            {animal.weight} kg
          </p>
        </div>
      </div>
      
      {/* Boutons d'action */}
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(animal)}
          className="flex-1 py-3 px-4 bg-blue-50 text-blue-600 rounded-xl font-medium active:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
        >
          <span>✏️</span>
          <span>Modifier</span>
        </button>
        
        {isActive ? (
          <button
            onClick={() => onSell(animal.id)}
            className="flex-1 py-3 px-4 bg-orange-50 text-orange-600 rounded-xl font-medium active:bg-orange-100 transition-colors flex items-center justify-center space-x-2"
          >
            <span>💰</span>
            <span>Vendre</span>
          </button>
        ) : (
          <button
            onClick={() => onDelete(animal.id)}
            className="flex-1 py-3 px-4 bg-red-50 text-red-600 rounded-xl font-medium active:bg-red-100 transition-colors flex items-center justify-center space-x-2"
          >
            <span>🗑️</span>
            <span>Supprimer</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Section de filtres améliorée en français
const FilterSection = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white p-4 shadow-sm border-b border-gray-200">
      <h2 className="text-lg font-bold mb-4 text-gray-800">🔍 Filtres et tri</h2>
      
      <div className="space-y-4">
        {/* Filtre par statut */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Statut des animaux :</p>
          <div className="flex space-x-2">
            <button
              onClick={() => onFilterChange('status', 'actif')}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all transform active:scale-95 ${
                filters.status === 'actif' 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              ✅ Actifs ({filters.status === 'actif' ? 'sélectionné' : 'tout'})
            </button>
            <button
              onClick={() => onFilterChange('status', 'vendu')}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all transform active:scale-95 ${
                filters.status === 'vendu' 
                  ? 'bg-orange-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              💰 Vendus (0)
            </button>
          </div>
        </div>

        {/* Filtre par type d'animal */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Filtrer par type d'animal :</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onFilterChange('type', 'all')}
              className={`px-3 py-3 rounded-xl text-sm font-medium transition-all transform active:scale-95 ${
                filters.type === 'all' 
                  ? 'bg-gray-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              🏠 Tous
            </button>
            <button
              onClick={() => onFilterChange('type', 'poulet')}
              className={`px-3 py-3 rounded-xl text-sm font-medium transition-all transform active:scale-95 ${
                filters.type === 'poulet' 
                  ? 'bg-yellow-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              🐔 Poulets
            </button>
            <button
              onClick={() => onFilterChange('type', 'porc')}
              className={`px-3 py-3 rounded-xl text-sm font-medium transition-all transform active:scale-95 ${
                filters.type === 'porc' 
                  ? 'bg-pink-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              🐷 Porcs
            </button>
          </div>
        </div>

        {/* Tri par critères */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Trier par :</p>
          <select className="w-full p-3 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="age_asc">Âge (plus jeune d'abord)</option>
            <option value="age_desc">Âge (plus âgé d'abord)</option>
            <option value="weight_asc">Poids (plus léger d'abord)</option>
            <option value="weight_desc">Poids (plus lourd d'abord)</option>
            <option value="name_asc">Nom (A-Z)</option>
            <option value="name_desc">Nom (Z-A)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Main Home Component avec fonctionnalité d'ajout
const Home = () => {
  const [animals, setAnimals] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({ status: 'actif', type: 'all' });
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  const handleAddAnimal = (newAnimal) => {
    setAnimals(prev => [...prev, newAnimal]);
    fetchStats(); // Refresh statistics
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
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
        onAddAnimal={openAddModal} 
        onMenuToggle={() => setIsMenuOpen(true)}
      />
      
      <MobileMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />
      
      <AddAnimalModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onAdd={handleAddAnimal}
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
          <div className="text-center py-12 px-4">
            <div className="text-6xl mb-4">🐄</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun animal trouvé</h3>
            <p className="text-gray-500 text-lg mb-4">Aucun animal ne correspond à vos critères de recherche</p>
            <p className="text-gray-400 text-sm mb-6">Essayez de modifier vos filtres ou d'ajouter de nouveaux animaux</p>
            <button 
              onClick={openAddModal}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium active:bg-green-700 transform active:scale-95 transition-all shadow-lg"
            >
              ➕ Ajouter un animal
            </button>
          </div>
        )}
      </div>
      
      {/* Bouton d'action flottant pour mobile */}
      <button
        onClick={openAddModal}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full shadow-xl flex items-center justify-center text-2xl active:scale-95 transform transition-all lg:hidden hover:shadow-2xl"
        aria-label="Ajouter un animal"
      >
        <span className="text-3xl">+</span>
      </button>
      
      {/* Badge version mobile */}
      <div className="fixed bottom-20 right-6 bg-white px-3 py-2 rounded-full shadow-lg border lg:hidden">
        <span className="text-xs text-gray-600">📱 Version mobile optimisée</span>
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
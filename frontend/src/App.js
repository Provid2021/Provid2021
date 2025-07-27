import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Modal de Gestion Médicale
const MedicalModal = ({ isOpen, onClose, animals }) => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [newRecord, setNewRecord] = useState({
    type: 'vaccination',
    description: '',
    veterinarian: '',
    cost: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const medicalTypes = {
    'vaccination': { icon: '💉', label: 'Vaccination', color: 'bg-blue-500' },
    'traitement': { icon: '💊', label: 'Traitement', color: 'bg-green-500' },
    'visite': { icon: '🩺', label: 'Visite de contrôle', color: 'bg-yellow-500' },
    'chirurgie': { icon: '🏥', label: 'Chirurgie', color: 'bg-red-500' },
    'autre': { icon: '📋', label: 'Autre', color: 'bg-gray-500' }
  };

  const fetchMedicalRecords = async () => {
    try {
      const response = await axios.get(`${API}/medical`);
      setMedicalRecords(response.data);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    }
  };

  const submitMedicalRecord = async (e) => {
    e.preventDefault();
    if (!selectedAnimal) {
      alert('Veuillez sélectionner un animal');
      return;
    }

    setLoading(true);
    try {
      const recordData = {
        animal_id: selectedAnimal,
        type: newRecord.type,
        description: newRecord.description,
        veterinarian: newRecord.veterinarian || null,
        cost: newRecord.cost ? parseFloat(newRecord.cost) : null,
        notes: newRecord.notes || null
      };

      await axios.post(`${API}/medical`, recordData);
      
      setNewRecord({
        type: 'vaccination',
        description: '',
        veterinarian: '',
        cost: '',
        notes: ''
      });
      setSelectedAnimal('');
      
      fetchMedicalRecords();
      alert('📋 Dossier médical ajouté avec succès !');
    } catch (error) {
      console.error('Error creating medical record:', error);
      alert('❌ Erreur lors de l\'ajout du dossier médical');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedicalRecords();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 text-white p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">🏥 Gestion Médicale</h2>
            <button onClick={onClose} className="p-2 hover:bg-blue-700 rounded-lg">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Formulaire d'ajout */}
          <form onSubmit={submitMedicalRecord} className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">📝 Nouveau Dossier Médical</h3>
            
            {/* Sélection animal */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Animal *</label>
              <select
                value={selectedAnimal}
                onChange={(e) => setSelectedAnimal(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner un animal...</option>
                {animals.filter(a => a.status === 'actif').map(animal => (
                  <option key={animal.id} value={animal.id}>
                    {animal.type === 'poulet' ? '🐔' : '🐷'} {animal.name} ({animal.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Type de soin */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type de soin *</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(medicalTypes).map(([key, type]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setNewRecord(prev => ({ ...prev, type: key }))}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      newRecord.type === key
                        ? `${type.color} text-white`
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {type.icon} {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                value={newRecord.description}
                onChange={(e) => setNewRecord(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Détails du traitement ou de la visite..."
                className="w-full p-3 border border-gray-300 rounded-xl h-20 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Vétérinaire */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Vétérinaire</label>
              <input
                type="text"
                value={newRecord.veterinarian}
                onChange={(e) => setNewRecord(prev => ({ ...prev, veterinarian: e.target.value }))}
                placeholder="Nom du vétérinaire"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Coût */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Coût (FCFA)</label>
              <input
                type="number"
                value={newRecord.cost}
                onChange={(e) => setNewRecord(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="0"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
              <textarea
                value={newRecord.notes}
                onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes additionnelles..."
                className="w-full p-3 border border-gray-300 rounded-xl h-16 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Ajout...' : '📋 Ajouter au Dossier Médical'}
            </button>
          </form>

          {/* Historique médical récent */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Historique Médical Récent</h3>
            {medicalRecords.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {medicalRecords.slice(0, 10).map((record) => {
                  const animal = animals.find(a => a.id === record.animal_id);
                  const typeInfo = medicalTypes[record.type] || medicalTypes.autre;
                  
                  return (
                    <div key={record.id} className="bg-gray-50 p-3 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{typeInfo.icon}</span>
                          <div>
                            <p className="font-semibold text-sm text-gray-800">
                              {animal ? `${animal.name}` : 'Animal non trouvé'}
                            </p>
                            <p className="text-xs text-gray-600">{typeInfo.label}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(record.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{record.description}</p>
                      {record.cost && (
                        <p className="text-sm font-medium text-green-600 mt-1">
                          Coût: {record.cost.toLocaleString()} FCFA
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🏥</div>
                <p className="text-gray-600">Aucun dossier médical</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal de Gestion de la Reproduction
const ReproductionModal = ({ isOpen, onClose, animals }) => {
  const [reproductionRecords, setReproductionRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    female_id: '',
    male_id: '',
    breeding_date: '',
    expected_birth_date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const fetchReproductionRecords = async () => {
    try {
      const response = await axios.get(`${API}/reproduction`);
      setReproductionRecords(response.data);
    } catch (error) {
      console.error('Error fetching reproduction records:', error);
    }
  };

  const submitReproductionRecord = async (e) => {
    e.preventDefault();
    if (!newRecord.female_id || !newRecord.breeding_date) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const recordData = {
        female_id: newRecord.female_id,
        male_id: newRecord.male_id || null,
        breeding_date: new Date(newRecord.breeding_date).toISOString(),
        expected_birth_date: newRecord.expected_birth_date ? new Date(newRecord.expected_birth_date).toISOString() : null,
        notes: newRecord.notes || null
      };

      await axios.post(`${API}/reproduction`, recordData);
      
      setNewRecord({
        female_id: '',
        male_id: '',
        breeding_date: '',
        expected_birth_date: '',
        notes: ''
      });
      
      fetchReproductionRecords();
      alert('🐣 Dossier de reproduction créé avec succès !');
    } catch (error) {
      console.error('Error creating reproduction record:', error);
      alert('❌ Erreur lors de la création du dossier de reproduction');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReproductionRecords();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const femaleAnimals = animals.filter(a => a.sex === 'Femelle' && a.status === 'actif');
  const maleAnimals = animals.filter(a => a.sex === 'Mâle' && a.status === 'actif');

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-pink-600 text-white p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">🐣 Gestion Reproduction</h2>
            <button onClick={onClose} className="p-2 hover:bg-pink-700 rounded-lg">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Formulaire d'ajout */}
          <form onSubmit={submitReproductionRecord} className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">💕 Nouveau Cycle de Reproduction</h3>
            
            {/* Femelle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Femelle *</label>
              <select
                value={newRecord.female_id}
                onChange={(e) => setNewRecord(prev => ({ ...prev, female_id: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">Sélectionner une femelle...</option>
                {femaleAnimals.map(animal => (
                  <option key={animal.id} value={animal.id}>
                    ♀️ {animal.name} ({animal.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Mâle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mâle</label>
              <select
                value={newRecord.male_id}
                onChange={(e) => setNewRecord(prev => ({ ...prev, male_id: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Sélectionner un mâle...</option>
                {maleAnimals.map(animal => (
                  <option key={animal.id} value={animal.id}>
                    ♂️ {animal.name} ({animal.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Date d'accouplement */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date d'accouplement *</label>
              <input
                type="date"
                value={newRecord.breeding_date}
                onChange={(e) => setNewRecord(prev => ({ ...prev, breeding_date: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            {/* Date de naissance prévue */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date de naissance prévue</label>
              <input
                type="date"
                value={newRecord.expected_birth_date}
                onChange={(e) => setNewRecord(prev => ({ ...prev, expected_birth_date: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
              <textarea
                value={newRecord.notes}
                onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observations, conditions particulières..."
                className="w-full p-3 border border-gray-300 rounded-xl h-20 focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : '🐣 Enregistrer la Reproduction'}
            </button>
          </form>

          {/* Cycles de reproduction actifs */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">🤱 Cycles Actifs</h3>
            {reproductionRecords.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {reproductionRecords.slice(0, 8).map((record) => {
                  const female = animals.find(a => a.id === record.female_id);
                  const male = record.male_id ? animals.find(a => a.id === record.male_id) : null;
                  const isExpectingBirth = record.expected_birth_date && !record.actual_birth_date;
                  
                  return (
                    <div key={record.id} className={`p-3 rounded-lg border ${isExpectingBirth ? 'bg-pink-50 border-pink-200' : 'bg-gray-50'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm text-gray-800">
                            ♀️ {female ? female.name : 'Femelle non trouvée'}
                          </p>
                          {male && (
                            <p className="text-xs text-gray-600">♂️ {male.name}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(record.breeding_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      {isExpectingBirth && (
                        <div className="bg-pink-100 p-2 rounded text-center">
                          <p className="text-sm font-medium text-pink-700">
                            🤰 Naissance prévue le {new Date(record.expected_birth_date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}
                      {record.actual_birth_date && (
                        <div className="bg-green-100 p-2 rounded text-center">
                          <p className="text-sm font-medium text-green-700">
                            🐣 Naissance le {new Date(record.actual_birth_date).toLocaleDateString('fr-FR')}
                            {record.offspring_count && ` - ${record.offspring_count} petit(s)`}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🐣</div>
                <p className="text-gray-600">Aucun cycle de reproduction</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal d'Historique
const HistoryModal = ({ isOpen, onClose, animals }) => {
  const [historyEvents, setHistoryEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('');

  const eventTypes = {
    'naissance': { icon: '🐣', label: 'Naissance', color: 'text-green-600' },
    'vente': { icon: '💰', label: 'Vente', color: 'text-orange-600' },
    'medical': { icon: '🏥', label: 'Médical', color: 'text-blue-600' },
    'reproduction': { icon: '💕', label: 'Reproduction', color: 'text-pink-600' },
    'alimentation': { icon: '🌾', label: 'Alimentation', color: 'text-yellow-600' },
    'autre': { icon: '📋', label: 'Autre', color: 'text-gray-600' }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/history`);
      setHistoryEvents(response.data);
      setFilteredEvents(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const filterEvents = () => {
    let filtered = historyEvents;
    
    if (selectedAnimal) {
      filtered = filtered.filter(event => event.animal_id === selectedAnimal);
    }
    
    if (selectedEventType) {
      filtered = filtered.filter(event => event.event_type === selectedEventType);
    }
    
    setFilteredEvents(filtered);
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    filterEvents();
  }, [selectedAnimal, selectedEventType, historyEvents]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-700 text-white p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">📚 Historique Complet</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Filtres */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">🔍 Filtrer l'historique</h3>
            
            {/* Filtre par animal */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Animal</label>
              <select
                value={selectedAnimal}
                onChange={(e) => setSelectedAnimal(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500"
              >
                <option value="">Tous les animaux</option>
                {animals.map(animal => (
                  <option key={animal.id} value={animal.id}>
                    {animal.type === 'poulet' ? '🐔' : '🐷'} {animal.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre par type d'événement */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type d'événement</label>
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500"
              >
                <option value="">Tous les événements</option>
                {Object.entries(eventTypes).map(([key, type]) => (
                  <option key={key} value={key}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Historique des événements */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              📊 Événements ({filteredEvents.length})
            </h3>
            
            {filteredEvents.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredEvents.map((event) => {
                  const animal = event.animal_id ? animals.find(a => a.id === event.animal_id) : null;
                  const eventInfo = eventTypes[event.event_type] || eventTypes.autre;
                  
                  return (
                    <div key={event.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{eventInfo.icon}</span>
                          <div>
                            <p className="font-semibold text-sm text-gray-800">{event.title}</p>
                            {animal && (
                              <p className="text-xs text-gray-600">
                                {animal.type === 'poulet' ? '🐔' : '🐷'} {animal.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleDateString('fr-FR')}
                          </span>
                          <span className={`block text-xs font-medium ${eventInfo.color}`}>
                            {eventInfo.label}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                      {event.cost && (
                        <div className="bg-green-100 px-2 py-1 rounded text-center">
                          <p className="text-sm font-medium text-green-700">
                            💰 Coût: {event.cost.toLocaleString()} FCFA
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📚</div>
                <p className="text-gray-600">Aucun événement trouvé</p>
                <p className="text-sm text-gray-500">Modifiez vos filtres pour voir plus d'événements</p>
              </div>
            )}
          </div>

          {/* Statistiques rapides */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-bold text-gray-800 mb-2">📈 Résumé</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center">
                <p className="font-semibold text-blue-600">{historyEvents.filter(e => e.event_type === 'medical').length}</p>
                <p className="text-gray-600">Soins médicaux</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-pink-600">{historyEvents.filter(e => e.event_type === 'reproduction').length}</p>
                <p className="text-gray-600">Reproductions</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-green-600">{historyEvents.filter(e => e.event_type === 'naissance').length}</p>
                <p className="text-gray-600">Naissances</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-orange-600">{historyEvents.filter(e => e.event_type === 'vente').length}</p>
                <p className="text-gray-600">Ventes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Section Finances pour suivre les recettes
const FinancesModal = ({ isOpen, onClose, animals }) => {
  if (!isOpen) return null;

  // Calculer les statistiques financières
  const soldAnimals = animals.filter(animal => animal.status === 'vendu');
  const activeAnimals = animals.filter(animal => animal.status === 'actif');
  
  // Prix moyens par type d'animal (vous pouvez ajuster ces valeurs)
  const pricePerType = {
    poulet: 5000, // 5000 FCFA par poulet
    porc: 150000  // 150000 FCFA par porc
  };
  
  // Calcul des recettes
  const totalRevenue = soldAnimals.reduce((total, animal) => {
    const price = pricePerType[animal.type] || 0;
    return total + price;
  }, 0);
  
  // Calcul de la valeur du cheptel actif
  const activeValue = activeAnimals.reduce((total, animal) => {
    const price = pricePerType[animal.type] || 0;
    return total + price;
  }, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-orange-600 text-white p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">💰 Finances & Recettes</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-orange-700 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenu finances */}
        <div className="p-6 space-y-6">
          {/* Résumé financier */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">💰</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-green-700">RECETTES TOTALES</h3>
                  <p className="text-2xl font-bold text-green-800">{formatCurrency(totalRevenue)}</p>
                  <p className="text-xs text-green-600">{soldAnimals.length} animaux vendus</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🏦</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-700">VALEUR CHEPTEL ACTIF</h3>
                  <p className="text-2xl font-bold text-blue-800">{formatCurrency(activeValue)}</p>
                  <p className="text-xs text-blue-600">{activeAnimals.length} animaux actifs</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">📊</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-purple-700">VALEUR TOTALE</h3>
                  <p className="text-2xl font-bold text-purple-800">{formatCurrency(totalRevenue + activeValue)}</p>
                  <p className="text-xs text-purple-600">Recettes + Valeur actuelle</p>
                </div>
              </div>
            </div>
          </div>

          {/* Détail des ventes */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Historique des Ventes</h3>
            
            {soldAnimals.length > 0 ? (
              <div className="space-y-3">
                {soldAnimals.map((animal) => (
                  <div key={animal.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{animal.type === 'poulet' ? '🐔' : '🐷'}</span>
                        <div>
                          <p className="font-semibold text-gray-800">{animal.name}</p>
                          <p className="text-sm text-gray-600">{animal.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {formatCurrency(pricePerType[animal.type] || 0)}
                        </p>
                        <p className="text-xs text-gray-500">Vendu</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">📈</div>
                <p className="text-gray-600">Aucune vente enregistrée</p>
                <p className="text-sm text-gray-500">Les animaux vendus apparaîtront ici</p>
              </div>
            )}
          </div>

          {/* Statistiques par type */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Recettes par Type</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div className="text-center">
                  <span className="text-2xl">🐔</span>
                  <p className="text-sm font-semibold text-yellow-700">Poulets</p>
                  <p className="text-lg font-bold text-yellow-800">
                    {formatCurrency(soldAnimals.filter(a => a.type === 'poulet').length * pricePerType.poulet)}
                  </p>
                  <p className="text-xs text-yellow-600">
                    {soldAnimals.filter(a => a.type === 'poulet').length} vendus
                  </p>
                </div>
              </div>
              
              <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
                <div className="text-center">
                  <span className="text-2xl">🐷</span>
                  <p className="text-sm font-semibold text-pink-700">Porcs</p>
                  <p className="text-lg font-bold text-pink-800">
                    {formatCurrency(soldAnimals.filter(a => a.type === 'porc').length * pricePerType.porc)}
                  </p>
                  <p className="text-xs text-pink-600">
                    {soldAnimals.filter(a => a.type === 'porc').length} vendus
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
                <span className="text-xl mr-3">🏥</span>
                <span className="font-medium">Gestion médicale</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center py-3 px-4 text-gray-700 hover:bg-green-50 rounded-lg transition-colors">
                <span className="text-xl mr-3">🐣</span>
                <span className="font-medium">Reproduction</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center py-3 px-4 text-gray-700 hover:bg-green-50 rounded-lg transition-colors">
                <span className="text-xl mr-3">📚</span>
                <span className="font-medium">Historique</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center py-3 px-4 text-gray-700 hover:bg-green-50 rounded-lg transition-colors">
                <span className="text-xl mr-3">⚙️</span>
                <span className="font-medium">Paramètres</span>
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

// Mobile Header Component avec design professionnel sombre
const MobileHeader = ({ onAddAnimal, onMenuToggle, onFinancesClick, onMedicalClick, onReproductionClick, onHistoryClick }) => {
  return (
    <header className="professional-header text-white p-4 sticky top-0 z-40 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 gradient-professional-dark rounded-xl flex items-center justify-center shadow-lg border border-gray-600">
            <span className="text-xl">🐄</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">Élevage la Providence</h1>
            <p className="text-sm text-gray-300">Gestion Professionnelle Mobile</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {/* Boutons professionnels avec design sombre */}
          <button
            onClick={onMedicalClick}
            className="btn-primary px-2 py-2 rounded-lg text-xs font-medium mobile-button-professional"
          >
            🏥
          </button>
          <button
            onClick={onReproductionClick}
            className="gradient-professional-purple text-white px-2 py-2 rounded-lg text-xs font-medium mobile-button-professional shadow-lg"
          >
            🐣
          </button>
          <button
            onClick={onHistoryClick}
            className="btn-secondary px-2 py-2 rounded-lg text-xs font-medium mobile-button-professional"
          >
            📚
          </button>
          <button
            onClick={onFinancesClick}
            className="gradient-professional-orange text-white px-2 py-2 rounded-lg text-xs font-medium mobile-button-professional shadow-lg"
          >
            💰
          </button>
          <button
            onClick={onAddAnimal}
            className="btn-success px-2 py-2 rounded-lg text-xs font-medium mobile-button-professional"
          >
            + 🐄
          </button>
          <button
            onClick={onMenuToggle}
            className="p-2 text-white bg-gray-700 rounded-lg active:bg-gray-600 transition-colors mobile-button-professional border border-gray-600"
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
};

// Statistics Card Component compact
const StatCard = ({ icon, title, value, subtitle, color, className = "" }) => {
  return (
    <div className={`stat-card-professional rounded-lg p-2 text-white shadow-xl transform transition-all hover:scale-105 active:scale-95 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="text-lg opacity-90">{icon}</div>
        <div className="flex-1">
          <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wide">{title}</h3>
          <p className="text-lg font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

// Animal Card Component compact pour mobile
const AnimalCard = ({ animal, onEdit, onDelete, onSell, onMedical, onReproduction, onHistory }) => {
  const animalIcon = animal.type === 'poulet' ? '🐔' : '🐷';
  const sexIcon = animal.sex === 'Mâle' ? '♂️' : '♀️';
  const sexColor = animal.sex === 'Mâle' ? 'text-blue-400' : 'text-pink-400';
  const isActive = animal.status === 'actif';
  
  // Status de reproduction
  const reproductionStatus = {
    'disponible': { icon: '✅', label: 'Disponible', color: 'text-green-400' },
    'gestante': { icon: '🤰', label: 'Gestante', color: 'text-pink-400' },
    'allaitante': { icon: '🍼', label: 'Allaitante', color: 'text-blue-400' },
    'reproduction': { icon: '💕', label: 'En reproduction', color: 'text-purple-400' },
    'repos': { icon: '😴', label: 'Au repos', color: 'text-gray-400' }
  };
  
  const reproStatus = reproductionStatus[animal.reproduction_status] || reproductionStatus.disponible;
  
  return (
    <div className={`professional-card p-2 mb-2 transform transition-all hover:scale-[1.01] active:scale-[0.99] ${
      isActive ? 'border-gray-600' : 'border-gray-700 opacity-75'
    }`}>
      {/* Header compact avec info animal */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border ${
            isActive 
              ? 'gradient-professional-green border-green-500' 
              : 'bg-gray-700 border-gray-600'
          }`}>
            <span>{animalIcon}</span>
          </div>
          <div className="flex-1">
            <h3 className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}>
              {animal.name}
            </h3>
            <p className="text-xs text-gray-400">{animal.category}</p>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className={`text-sm ${sexColor}`}>{sexIcon}</span>
              {!isActive && (
                <span className="inline-block bg-orange-900 text-orange-300 text-xs px-1 py-0.5 rounded font-medium border border-orange-700">
                  💰
                </span>
              )}
              {animal.reproduction_status && animal.reproduction_status !== 'disponible' && (
                <span className={`text-xs ${reproStatus.color}`}>
                  {reproStatus.icon}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Stats compacts inline */}
        <div className="text-right">
          <div className="text-xs text-gray-400">
            <div className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}>
              {animal.age}
            </div>
            <div className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}>
              {animal.weight} kg
            </div>
          </div>
        </div>
      </div>
      
      {/* Boutons d'action compacts */}
      <div className="space-y-1">
        {/* Première ligne : Actions principales */}
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(animal)}
            className="flex-1 py-1.5 px-2 btn-primary rounded-lg text-xs font-medium mobile-button-professional flex items-center justify-center space-x-1"
          >
            <span className="text-xs">✏️</span>
            <span>Modifier</span>
          </button>
          
          {isActive ? (
            <button
              onClick={() => onSell(animal.id)}
              className="flex-1 py-1.5 px-2 btn-warning rounded-lg text-xs font-medium mobile-button-professional flex items-center justify-center space-x-1"
            >
              <span className="text-xs">💰</span>
              <span>Vendre</span>
            </button>
          ) : (
            <button
              onClick={() => onDelete(animal.id)}
              className="flex-1 py-1.5 px-2 btn-danger rounded-lg text-xs font-medium mobile-button-professional flex items-center justify-center space-x-1"
            >
              <span className="text-xs">🗑️</span>
              <span>Supprimer</span>
            </button>
          )}
        </div>
        
        {/* Deuxième ligne : Actions spécialisées */}
        <div className="flex space-x-1">
          <button
            onClick={() => onMedical(animal.id)}
            className="flex-1 py-1.5 px-2 btn-success rounded-lg text-xs font-medium mobile-button-professional flex items-center justify-center"
          >
            <span className="text-xs">🏥</span>
          </button>
          
          <button
            onClick={() => onReproduction(animal.id)}
            className="flex-1 py-1.5 px-2 gradient-professional-purple text-white rounded-lg text-xs font-medium mobile-button-professional flex items-center justify-center border border-purple-600"
          >
            <span className="text-xs">🐣</span>
          </button>
          
          <button
            onClick={() => onHistory(animal.id)}
            className="flex-1 py-1.5 px-2 btn-secondary rounded-lg text-xs font-medium mobile-button-professional flex items-center justify-center"
          >
            <span className="text-xs">📚</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Section de filtres améliorée avec compteurs dynamiques
const FilterSection = ({ filters, onFilterChange, animals }) => {
  // Calculer les compteurs en temps réel
  const activeCount = animals.filter(a => a.status === 'actif').length;
  const soldCount = animals.filter(a => a.status === 'vendu').length;
  const poultryCount = animals.filter(a => a.type === 'poulet').length;
  const pigCount = animals.filter(a => a.type === 'porc').length;
  
  return (
    <div className="bg-white p-4 shadow-sm border-b border-gray-200">
      <h2 className="text-lg font-bold mb-4 text-gray-800">🔍 Filtres et tri</h2>
      
      <div className="space-y-4">
        {/* Filtre par statut avec compteurs dynamiques */}
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
              ✅ Actifs ({activeCount})
            </button>
            <button
              onClick={() => onFilterChange('status', 'vendu')}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all transform active:scale-95 ${
                filters.status === 'vendu' 
                  ? 'bg-orange-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              💰 Vendus ({soldCount})
            </button>
          </div>
        </div>

        {/* Filtre par type d'animal avec compteurs */}
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
              🏠 Tous ({animals.length})
            </button>
            <button
              onClick={() => onFilterChange('type', 'poulet')}
              className={`px-3 py-3 rounded-xl text-sm font-medium transition-all transform active:scale-95 ${
                filters.type === 'poulet' 
                  ? 'bg-yellow-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              🐔 Poulets ({poultryCount})
            </button>
            <button
              onClick={() => onFilterChange('type', 'porc')}
              className={`px-3 py-3 rounded-xl text-sm font-medium transition-all transform active:scale-95 ${
                filters.type === 'porc' 
                  ? 'bg-pink-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              🐷 Porcs ({pigCount})
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

// Main Home Component avec toutes les nouvelles fonctionnalités
const Home = () => {
  const [animals, setAnimals] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({ status: 'actif', type: 'all' });
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFinancesModalOpen, setIsFinancesModalOpen] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [isReproductionModalOpen, setIsReproductionModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

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

  const sellAnimal = async (animalId) => {
    if (window.confirm('🐄 Êtes-vous sûr de vouloir vendre cet animal ?')) {
      try {
        const response = await axios.put(`${API}/animals/${animalId}`, {
          status: 'vendu'
        });
        
        if (response.status === 200) {
          fetchAnimals(); // Refresh animals list
          fetchStats(); // Refresh statistics
          alert('💰 Animal vendu avec succès !');
        }
      } catch (error) {
        console.error('Erreur lors de la vente:', error);
        alert('❌ Erreur lors de la vente de l\'animal');
      }
    }
  };

  const deleteAnimal = async (animalId) => {
    if (window.confirm('🗑️ Êtes-vous sûr de vouloir supprimer définitivement cet animal ?')) {
      try {
        await axios.delete(`${API}/animals/${animalId}`);
        fetchAnimals();
        fetchStats();
        alert('✅ Animal supprimé définitivement');
      } catch (error) {
        console.error('Error deleting animal:', error);
        alert('❌ Erreur lors de la suppression');
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

  // Modal control functions
  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);
  const openFinancesModal = () => setIsFinancesModalOpen(true);
  const closeFinancesModal = () => setIsFinancesModalOpen(false);
  const openMedicalModal = () => setIsMedicalModalOpen(true);
  const closeMedicalModal = () => setIsMedicalModalOpen(false);
  const openReproductionModal = () => setIsReproductionModalOpen(true);
  const closeReproductionModal = () => setIsReproductionModalOpen(false);
  const openHistoryModal = () => setIsHistoryModalOpen(true);
  const closeHistoryModal = () => setIsHistoryModalOpen(false);

  // Handlers for animal-specific actions
  const handleAnimalMedical = (animalId) => {
    openMedicalModal();
  };

  const handleAnimalReproduction = (animalId) => {
    openReproductionModal();
  };

  const handleAnimalHistory = (animalId) => {
    openHistoryModal();
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
      <div className="loading-screen-professional">
        <div className="text-center">
          <div className="loading-spinner-professional"></div>
          <p className="mt-4 text-gray-300 font-medium">Chargement de l'élevage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <MobileHeader 
        onAddAnimal={openAddModal} 
        onMenuToggle={() => setIsMenuOpen(true)}
        onFinancesClick={openFinancesModal}
        onMedicalClick={openMedicalModal}
        onReproductionClick={openReproductionModal}
        onHistoryClick={openHistoryModal}
      />
      
      <MobileMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />
      
      {/* Toutes les modales */}
      <AddAnimalModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onAdd={handleAddAnimal}
      />
      
      <FinancesModal
        isOpen={isFinancesModalOpen}
        onClose={closeFinancesModal}
        animals={animals}
      />

      <MedicalModal
        isOpen={isMedicalModalOpen}
        onClose={closeMedicalModal}
        animals={animals}
      />

      <ReproductionModal
        isOpen={isReproductionModalOpen}
        onClose={closeReproductionModal}
        animals={animals}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={closeHistoryModal}
        animals={animals}
      />
      
      {/* Statistics Section avec design professionnel */}
      <div className="p-4 space-y-4">
        {/* Top Row */}
        <div className="grid grid-cols-1 gap-4">
          <StatCard
            icon="🏠"
            title="Cheptel Total"
            value={stats.total_livestock || 0}
            subtitle="Animaux actifs dans l'élevage"
            className="gradient-professional-green"
          />
        </div>
        
        {/* Second Row */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon="🐔"
            title="Volailles"
            value={stats.poultry?.count || 0}
            subtitle="4 vague(s)"
            className="gradient-professional-orange"
          />
          <StatCard
            icon="🐷"
            title="Porcins"
            value={stats.pigs?.count || 0}
            subtitle="Élevage individuel"
            className="gradient-professional-red"
          />
        </div>
        
        {/* Third Row */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon="♂️"
            title="Mâles"
            value={stats.males || 0}
            subtitle="Reproducteurs"
            className="gradient-professional-blue"
          />
          <StatCard
            icon="♀️"
            title="Femelles"
            value={stats.females || 0}
            subtitle="Reproductrices"
            className="gradient-professional-purple"
          />
        </div>
        
        {/* New Statistics Row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon="🏥"
            title="Soins"
            value={stats.medical_records || 0}
            subtitle="Dossiers médicaux"
            className="gradient-professional-blue"
          />
          <StatCard
            icon="🐣"
            title="Reprod."
            value={stats.reproduction_records || 0}
            subtitle="Cycles actifs"
            className="gradient-professional-purple"
          />
          <StatCard
            icon="🤰"
            title="Gestantes"
            value={stats.pregnant_animals || 0}
            subtitle="En gestation"
            className="gradient-professional-red"
          />
        </div>
        
        {/* Bottom Row */}
        <div className="grid grid-cols-1 gap-4">
          <StatCard
            icon="💰"
            title="Rentabilité Mensuelle"
            value="3,504,444 FCFA"
            subtitle="Bénéfice net mensuel"
            className="gradient-professional-green"
          />
        </div>
      </div>

      {/* Filters avec design sombre */}
      <div className="professional-card mx-4 mb-4 p-4">
        <h2 className="text-lg font-bold mb-4 text-white">🔍 Filtres et tri</h2>
        
        <div className="space-y-4">
          {/* Filtre par statut avec design sombre */}
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3">Statut des animaux :</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('status', 'actif')}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all transform active:scale-95 mobile-button-professional ${
                  filters.status === 'actif' 
                    ? 'btn-success' 
                    : 'btn-secondary'
                }`}
              >
                ✅ Actifs ({animals.filter(a => a.status === 'actif').length})
              </button>
              <button
                onClick={() => handleFilterChange('status', 'vendu')}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all transform active:scale-95 mobile-button-professional ${
                  filters.status === 'vendu' 
                    ? 'btn-warning' 
                    : 'btn-secondary'
                }`}
              >
                💰 Vendus ({animals.filter(a => a.status === 'vendu').length})
              </button>
            </div>
          </div>

          {/* Filtre par type d'animal */}
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3">Filtrer par type d'animal :</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleFilterChange('type', 'all')}
                className={`px-3 py-3 rounded-xl text-sm font-medium transition-all transform active:scale-95 mobile-button-professional ${
                  filters.type === 'all' 
                    ? 'btn-secondary border-white' 
                    : 'btn-secondary'
                }`}
              >
                🏠 Tous ({animals.length})
              </button>
              <button
                onClick={() => handleFilterChange('type', 'poulet')}
                className={`px-3 py-3 rounded-xl text-sm font-medium transition-all transform active:scale-95 mobile-button-professional ${
                  filters.type === 'poulet' 
                    ? 'gradient-professional-orange text-white border-orange-400' 
                    : 'btn-secondary'
                }`}
              >
                🐔 Poulets ({animals.filter(a => a.type === 'poulet').length})
              </button>
              <button
                onClick={() => handleFilterChange('type', 'porc')}
                className={`px-3 py-3 rounded-xl text-sm font-medium transition-all transform active:scale-95 mobile-button-professional ${
                  filters.type === 'porc' 
                    ? 'gradient-professional-red text-white border-pink-400' 
                    : 'btn-secondary'
                }`}
              >
                🐷 Porcs ({animals.filter(a => a.type === 'porc').length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animals List */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
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
              onSell={sellAnimal}
              onMedical={handleAnimalMedical}
              onReproduction={handleAnimalReproduction}
              onHistory={handleAnimalHistory}
            />
          ))}
        </div>
        
        {filteredAnimals.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="text-6xl mb-4">🐄</div>
            <h3 className="text-xl font-bold text-white mb-2">Aucun animal trouvé</h3>
            <p className="text-gray-400 text-lg mb-4">Aucun animal ne correspond à vos critères de recherche</p>
            <p className="text-gray-500 text-sm mb-6">Essayez de modifier vos filtres ou d'ajouter de nouveaux animaux</p>
            <button 
              onClick={openAddModal}
              className="btn-success px-6 py-3 rounded-xl font-medium mobile-button-professional"
            >
              ➕ Ajouter un animal
            </button>
          </div>
        )}
      </div>
      
      {/* Bouton d'action flottant professionnel */}
      <button
        onClick={openAddModal}
        className="fixed bottom-6 right-6 w-16 h-16 gradient-professional-green text-white rounded-full shadow-2xl flex items-center justify-center text-2xl active:scale-95 transform transition-all lg:hidden hover:shadow-2xl border border-green-500"
        aria-label="Ajouter un animal"
      >
        <span className="text-3xl">+</span>
      </button>
      
      {/* Badge version professionnelle */}
      <div className="fixed bottom-20 right-6 professional-card px-3 py-2 rounded-full shadow-xl border border-gray-600 lg:hidden">
        <span className="text-xs text-gray-300">📱 Version Pro Mobile</span>
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
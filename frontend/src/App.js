import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Races prédéfinies par type d'animal
const RACES_POULET = [
  'Poule pondeuse',
  'Sussex',
  'Rhode Island Red',
  'Leghorn',
  'Marans',
  'Orpington',
  'Wyandotte',
  'Plymouth Rock',
  'Brahma',
  'Cochin',
  'Autre'
];

const RACES_PORC = [
  'Large White',
  'Landrace',
  'Duroc',
  'Piétrain',
  'Hampshire',
  'Yorkshire',
  'Mangalitsa',
  'Gloucester Old Spots',
  'Tamworth',
  'Berkshire',
  'Autre'
];

// Types d'interventions médicales
const TYPES_INTERVENTION = [
  'Vaccination',
  'Traitement antibiotique',
  'Vermifuge',
  'Visite vétérinaire',
  'Chirurgie',
  'Examen de routine',
  'Autre'
];

function App() {
  const [animals, setAnimals] = useState([]);
  const [stats, setStats] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Medical records states
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [selectedAnimalForMedical, setSelectedAnimalForMedical] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [showAddMedicalForm, setShowAddMedicalForm] = useState(false);
  const [upcomingReminders, setUpcomingReminders] = useState([]);

  const [formData, setFormData] = useState({
    type: 'poulet',
    race: '',
    raceAutre: '',
    sexe: 'M',
    date_naissance: '',
    poids: '',
    nom: '',
    notes: ''
  });

  const [medicalFormData, setMedicalFormData] = useState({
    date_intervention: '',
    type_intervention: '',
    medicament: '',
    veterinaire: '',
    cout: '',
    notes: '',
    date_rappel: ''
  });

  useEffect(() => {
    fetchAnimals();
    fetchStats();
    fetchUpcomingReminders();
  }, [filterType]);

  const fetchAnimals = async () => {
    setLoading(true);
    try {
      const url = filterType ? 
        `${API_BASE_URL}/api/animals?type=${filterType}` : 
        `${API_BASE_URL}/api/animals`;
      const response = await fetch(url);
      const data = await response.json();
      setAnimals(data.animals || []);
    } catch (error) {
      console.error('Erreur lors du chargement des animaux:', error);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const fetchUpcomingReminders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/medical-records/reminders/upcoming`);
      const data = await response.json();
      setUpcomingReminders(data.reminders || []);
    } catch (error) {
      console.error('Erreur lors du chargement des rappels:', error);
    }
  };

  const fetchMedicalRecords = async (animalId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/medical-records/${animalId}`);
      const data = await response.json();
      setMedicalRecords(data.medical_records || []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique médical:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const method = selectedAnimal ? 'PUT' : 'POST';
      const url = selectedAnimal ? 
        `${API_BASE_URL}/api/animals/${selectedAnimal.id}` : 
        `${API_BASE_URL}/api/animals`;
      
      // Ensure proper data types and clean data
      const submitData = {
        type: formData.type,
        race: formData.race === 'Autre' ? formData.raceAutre.trim() : formData.race,
        sexe: formData.sexe,
        date_naissance: formData.date_naissance,
        poids: parseFloat(formData.poids),
        nom: formData.nom.trim(),
        notes: formData.notes.trim()
      };
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setShowAddForm(false);
        setSelectedAnimal(null);
        setFormData({
          type: 'poulet',
          race: '',
          raceAutre: '',
          sexe: 'M',
          date_naissance: '',
          poids: '',
          nom: '',
          notes: ''
        });
        fetchAnimals();
        fetchStats();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
    setLoading(false);
  };

  const handleMedicalSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs requis
    if (!medicalFormData.date_intervention || !medicalFormData.type_intervention) {
      alert('Veuillez remplir les champs obligatoires (Date et Type d\'intervention)');
      return;
    }
    
    if (!selectedAnimalForMedical) {
      alert('Erreur: Aucun animal sélectionné');
      return;
    }
    
    setLoading(true);
    
    try {
      const submitData = {
        animal_id: selectedAnimalForMedical.id,
        date_intervention: medicalFormData.date_intervention,
        type_intervention: medicalFormData.type_intervention,
        medicament: medicalFormData.medicament ? medicalFormData.medicament.trim() : '',
        veterinaire: medicalFormData.veterinaire ? medicalFormData.veterinaire.trim() : '',
        cout: medicalFormData.cout ? parseFloat(medicalFormData.cout) : null,
        notes: medicalFormData.notes ? medicalFormData.notes.trim() : '',
        date_rappel: medicalFormData.date_rappel || null
      };
      
      const response = await fetch(`${API_BASE_URL}/api/medical-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        // Reset form and close modal
        setShowAddMedicalForm(false);
        setMedicalFormData({
          date_intervention: '',
          type_intervention: '',
          medicament: '',
          veterinaire: '',
          cout: '',
          notes: '',
          date_rappel: ''
        });
        
        // Refresh medical records and reminders
        await fetchMedicalRecords(selectedAnimalForMedical.id);
        await fetchUpcomingReminders();
        
        alert('Soin médical ajouté avec succès !');
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de l'ajout: ${errorData.detail || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du dossier médical:', error);
      alert('Erreur de connexion. Veuillez réessayer.');
    }
    setLoading(false);
  };

  const handleEdit = (animal) => {
    setSelectedAnimal(animal);
    setFormData({
      type: animal.type,
      race: RACES_POULET.includes(animal.race) || RACES_PORC.includes(animal.race) ? animal.race : 'Autre',
      raceAutre: RACES_POULET.includes(animal.race) || RACES_PORC.includes(animal.race) ? '' : animal.race,
      sexe: animal.sexe,
      date_naissance: animal.date_naissance,
      poids: animal.poids.toString(),
      nom: animal.nom || '',
      notes: animal.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (animalId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet animal et tout son historique médical ?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/animals/${animalId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchAnimals();
          fetchStats();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleShowMedicalHistory = (animal) => {
    setSelectedAnimalForMedical(animal);
    setShowMedicalHistory(true);
    fetchMedicalRecords(animal.id);
  };

  // Obtenir les races disponibles selon le type d'animal sélectionné
  const getAvailableRaces = (animalType) => {
    return animalType === 'poulet' ? RACES_POULET : RACES_PORC;
  };

  const calculateAge = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const diffTime = Math.abs(today - birth);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} jours`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} mois`;
    } else {
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      return `${years} an${years > 1 ? 's' : ''} ${months > 0 ? `${months} mois` : ''}`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🐷</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Gestion d'Élevage</h1>
                  <p className="text-sm text-gray-600">Suivi de vos poulets et porcs</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setShowAddForm(true);
                setSelectedAnimal(null);
                setFormData({
                  type: 'poulet',
                  race: '',
                  raceAutre: '',
                  sexe: 'M',
                  date_naissance: '',
                  poids: '',
                  nom: '',
                  notes: ''
                });
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              + Nouvel Animal
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_animals || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600">🐔</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Poulets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_poulets || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-pink-600">🐷</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Porcs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_porcs || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">♂</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mâles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.males || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600">♀</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Femelles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.females || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-amber-800">
                  Rappels médicaux à venir ({upcomingReminders.length})
                </h3>
                <div className="mt-2 text-sm text-amber-700 space-y-2">
                  {upcomingReminders.slice(0, 3).map((reminder, index) => (
                    <div key={index} className="flex justify-between items-center bg-white rounded p-2 border border-amber-200">
                      <div>
                        <strong>{reminder.animal_info?.nom || 'Animal inconnu'}</strong> - 
                        {reminder.type_intervention} le {formatDate(reminder.date_rappel)}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleMarkReminderDone(reminder.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                          title="Marquer comme effectué"
                        >
                          ✓ Fait
                        </button>
                        <button
                          onClick={() => handleDeleteMedicalRecord(reminder.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                          title="Supprimer le rappel"
                        >
                          ✗ Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                  {upcomingReminders.length > 3 && (
                    <div className="text-xs mt-2">Et {upcomingReminders.length - 3} autre(s) rappel(s)...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="bg-white rounded-xl shadow-lg mb-8 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Filtrer par type:</label>
            <div className="flex gap-3">
              <button
                onClick={() => setFilterType('')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filterType === '' 
                    ? 'bg-gray-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Tous ({stats.total_animals || 0})
              </button>
              <button
                onClick={() => setFilterType('poulet')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filterType === 'poulet' 
                    ? 'bg-yellow-500 text-white shadow-lg' 
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                🐔 Poulets ({stats.total_poulets || 0})
              </button>
              <button
                onClick={() => setFilterType('porc')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filterType === 'porc' 
                    ? 'bg-pink-500 text-white shadow-lg' 
                    : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                }`}
              >
                🐷 Porcs ({stats.total_porcs || 0})
              </button>
            </div>
          </div>
        </div>

        {/* Animals List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Liste des Animaux ({animals.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          ) : animals.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-6xl mb-4">🐾</div>
              <p className="text-lg">Aucun animal enregistré</p>
              <p className="text-sm">Commencez par ajouter votre premier animal!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Animal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Race
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sexe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Âge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Poids
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {animals.map((animal) => (
                    <tr key={animal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                              <span className="text-white text-lg">
                                {animal.type === 'poulet' ? '🐔' : '🐷'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {animal.nom || `${animal.type} #${animal.id.slice(-4)}`}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                              {animal.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {animal.race}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          animal.sexe === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {animal.sexe === 'M' ? '♂ Mâle' : '♀ Femelle'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateAge(animal.date_naissance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {animal.poids} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleShowMedicalHistory(animal)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          🏥 Médical
                        </button>
                        <button
                          onClick={() => handleEdit(animal)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(animal.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Animal Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedAnimal ? 'Modifier l\'animal' : 'Ajouter un nouvel animal'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({
                        ...formData, 
                        type: e.target.value,
                        race: '', // Reset race when type changes
                        raceAutre: '' // Reset custom race when type changes
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="poulet">Poulet</option>
                      <option value="porc">Porc</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Race *</label>
                    <select
                      value={formData.race}
                      onChange={(e) => setFormData({...formData, race: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">Sélectionnez une race</option>
                      {getAvailableRaces(formData.type).map((race) => (
                        <option key={race} value={race}>
                          {race}
                        </option>
                      ))}
                    </select>
                    {formData.race === 'Autre' && (
                      <input
                        type="text"
                        placeholder="Précisez la race"
                        value={formData.raceAutre || ''}
                        onChange={(e) => setFormData({...formData, raceAutre: e.target.value})}
                        className="mt-2 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sexe *</label>
                    <select
                      value={formData.sexe}
                      onChange={(e) => setFormData({...formData, sexe: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="M">Mâle</option>
                      <option value="F">Femelle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de naissance *</label>
                    <input
                      type="date"
                      value={formData.date_naissance}
                      onChange={(e) => setFormData({...formData, date_naissance: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Poids (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.poids}
                      onChange={(e) => setFormData({...formData, poids: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom (optionnel)</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes (optionnel)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedAnimal(null);
                      setFormData({
                        type: 'poulet',
                        race: '',
                        raceAutre: '',
                        sexe: 'M',
                        date_naissance: '',
                        poids: '',
                        nom: '',
                        notes: ''
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sauvegarde...' : (selectedAnimal ? 'Modifier' : 'Ajouter')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Medical History Modal */}
      {showMedicalHistory && selectedAnimalForMedical && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[90]">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Historique médical - {selectedAnimalForMedical.nom || `${selectedAnimalForMedical.type} #${selectedAnimalForMedical.id.slice(-4)}`}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAddMedicalForm(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                  >
                    + Ajouter un soin
                  </button>
                  <button
                    onClick={() => {
                      setShowMedicalHistory(false);
                      setSelectedAnimalForMedical(null);
                      setMedicalRecords([]);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Medical Records List */}
              <div className="space-y-4">
                {medicalRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🏥</div>
                    <p>Aucun historique médical enregistré</p>
                    <p className="text-sm">Commencez par ajouter un premier soin</p>
                  </div>
                ) : (
                  medicalRecords.map((record) => (
                    <div key={record.id} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              {record.type_intervention}
                            </span>
                            <span className="text-sm text-gray-600">
                              {formatDate(record.date_intervention)}
                            </span>
                            {record.date_rappel && (
                              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
                                Rappel: {formatDate(record.date_rappel)}
                              </span>
                            )}
                          </div>
                          
                          {record.medicament && (
                            <p className="text-sm mb-1"><strong>Médicament:</strong> {record.medicament}</p>
                          )}
                          
                          {record.veterinaire && (
                            <p className="text-sm mb-1"><strong>Vétérinaire:</strong> {record.veterinaire}</p>
                          )}
                          
                          {record.cout && (
                            <p className="text-sm mb-1"><strong>Coût:</strong> {record.cout}€</p>
                          )}
                          
                          {record.notes && (
                            <p className="text-sm text-gray-600 mt-2">{record.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Medical Record Modal */}
      {showAddMedicalForm && selectedAnimalForMedical && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-[100]">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Ajouter un soin médical
                </h3>
                <button
                  onClick={() => {
                    setShowAddMedicalForm(false);
                    setMedicalFormData({
                      date_intervention: '',
                      type_intervention: '',
                      medicament: '',
                      veterinaire: '',
                      cout: '',
                      notes: '',
                      date_rappel: ''
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleMedicalSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date d'intervention *</label>
                    <input
                      type="date"
                      value={medicalFormData.date_intervention}
                      onChange={(e) => setMedicalFormData({...medicalFormData, date_intervention: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type d'intervention *</label>
                    <select
                      value={medicalFormData.type_intervention}
                      onChange={(e) => setMedicalFormData({...medicalFormData, type_intervention: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Sélectionnez un type</option>
                      {TYPES_INTERVENTION.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Médicament</label>
                    <input
                      type="text"
                      value={medicalFormData.medicament}
                      onChange={(e) => setMedicalFormData({...medicalFormData, medicament: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nom du médicament"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vétérinaire</label>
                    <input
                      type="text"
                      value={medicalFormData.veterinaire}
                      onChange={(e) => setMedicalFormData({...medicalFormData, veterinaire: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nom du vétérinaire"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Coût (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={medicalFormData.cout}
                      onChange={(e) => setMedicalFormData({...medicalFormData, cout: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de rappel</label>
                    <input
                      type="date"
                      value={medicalFormData.date_rappel}
                      onChange={(e) => setMedicalFormData({...medicalFormData, date_rappel: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={medicalFormData.notes}
                    onChange={(e) => setMedicalFormData({...medicalFormData, notes: e.target.value})}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Observations, dosage, réactions..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMedicalForm(false);
                      setMedicalFormData({
                        date_intervention: '',
                        type_intervention: '',
                        medicament: '',
                        veterinaire: '',
                        cout: '',
                        notes: '',
                        date_rappel: ''
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !medicalFormData.date_intervention || !medicalFormData.type_intervention}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Enregistrement...' : '💾 Enregistrer le soin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
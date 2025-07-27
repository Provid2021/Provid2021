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

// Types d'événements reproductifs
const TYPES_REPRODUCTION = [
  'saillie',
  'insemination',
  'mise_bas',
  'sevrage'
];

function App() {
  const [animals, setAnimals] = useState([]);
  const [stats, setStats] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState(''); // New filter for categories
  const [sortBy, setSortBy] = useState('age'); // New sort option
  const [loading, setLoading] = useState(false);
  
  // Medical records states
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [selectedAnimalForMedical, setSelectedAnimalForMedical] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [showAddMedicalForm, setShowAddMedicalForm] = useState(false);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  // Reproduction states
  const [showReproductionHistory, setShowReproductionHistory] = useState(false);
  const [selectedAnimalForReproduction, setSelectedAnimalForReproduction] = useState(null);
  const [reproductionEvents, setReproductionEvents] = useState([]);
  const [showAddReproductionForm, setShowAddReproductionForm] = useState(false);
  const [upcomingBirths, setUpcomingBirths] = useState([]);
  const [breedingMales, setBreedingMales] = useState([]);
  
  // Animal profile states
  const [showAnimalProfile, setShowAnimalProfile] = useState(false);
  const [selectedAnimalForProfile, setSelectedAnimalForProfile] = useState(null);
  const [profileMedicalRecords, setProfileMedicalRecords] = useState([]);
  const [profileReproductionEvents, setProfileReproductionEvents] = useState([]);

  // Financial states
  const [showFinancialDashboard, setShowFinancialDashboard] = useState(false);
  const [showAddFinancialForm, setShowAddFinancialForm] = useState(false);
  const [financialRecords, setFinancialRecords] = useState([]);
  const [financialStats, setFinancialStats] = useState({});

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

  const [reproductionFormData, setReproductionFormData] = useState({
    type_event: '',
    date_event: '',
    male_id: '',
    male_info: '',
    nombre_petits_nes: '',
    nombre_petits_vivants: '',
    nombre_petits_morts: '',
    poids_moyen_petits: '',
    notes: ''
  });

  const [financialFormData, setFinancialFormData] = useState({
    type_transaction: 'depense',
    categorie: '',
    date_transaction: '',
    montant: '',
    animal_id: '',
    description: '',
    fournisseur_acheteur: '',
    notes: ''
  });

  useEffect(() => {
    fetchAnimals();
    fetchStats();
    fetchUpcomingReminders();
    fetchUpcomingBirths();
    fetchFinancialStats();
  }, [filterType, filterCategory, sortBy]);

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

  const fetchUpcomingBirths = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reproduction-events/upcoming-births`);
      const data = await response.json();
      setUpcomingBirths(data.upcoming_births || []);
    } catch (error) {
      console.error('Erreur lors du chargement des naissances prévues:', error);
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

  const fetchReproductionEvents = async (animalId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reproduction-events/${animalId}`);
      const data = await response.json();
      setReproductionEvents(data.reproduction_events || []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique reproductif:', error);
    }
  };

  const fetchBreedingMales = async (animalType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/animals/breeding-males/${animalType}`);
      const data = await response.json();
      setBreedingMales(data.breeding_males || []);
    } catch (error) {
      console.error('Erreur lors du chargement des mâles reproducteurs:', error);
    }
  };

  const fetchFinancialStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/financial-stats`);
      const data = await response.json();
      setFinancialStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques financières:', error);
    }
  };

  const fetchFinancialRecords = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/financial-records`);
      const data = await response.json();
      setFinancialRecords(data.financial_records || []);
    } catch (error) {
      console.error('Erreur lors du chargement des transactions financières:', error);
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

  const handleReproductionSubmit = async (e) => {
    e.preventDefault();
    
    if (!reproductionFormData.type_event || !reproductionFormData.date_event) {
      alert('Veuillez remplir les champs obligatoires (Type d\'événement et Date)');
      return;
    }
    
    // Validation pour saillie/insémination - un mâle doit être sélectionné
    if ((reproductionFormData.type_event === 'saillie' || reproductionFormData.type_event === 'insemination') &&
        !reproductionFormData.male_id && !reproductionFormData.male_info) {
      alert('Veuillez sélectionner un mâle reproducteur ou saisir les informations d\'un mâle externe');
      return;
    }
    
    if (!selectedAnimalForReproduction) {
      alert('Erreur: Aucun animal sélectionné');
      return;
    }
    
    setLoading(true);
    
    try {
      const submitData = {
        animal_id: selectedAnimalForReproduction.id,
        type_event: reproductionFormData.type_event,
        date_event: reproductionFormData.date_event,
        male_id: reproductionFormData.male_id || null,
        male_info: reproductionFormData.male_info ? reproductionFormData.male_info.trim() : null,
        nombre_petits_nes: reproductionFormData.nombre_petits_nes ? parseInt(reproductionFormData.nombre_petits_nes) : null,
        nombre_petits_vivants: reproductionFormData.nombre_petits_vivants ? parseInt(reproductionFormData.nombre_petits_vivants) : null,
        nombre_petits_morts: reproductionFormData.nombre_petits_morts ? parseInt(reproductionFormData.nombre_petits_morts) : null,
        poids_moyen_petits: reproductionFormData.poids_moyen_petits ? parseFloat(reproductionFormData.poids_moyen_petits) : null,
        notes: reproductionFormData.notes ? reproductionFormData.notes.trim() : ''
      };
      
      const response = await fetch(`${API_BASE_URL}/api/reproduction-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const responseData = await response.json();
        
        // Si c'est une mise bas avec des petits vivants, proposer de les ajouter au cheptel
        if (reproductionFormData.type_event === 'mise_bas' && 
            reproductionFormData.nombre_petits_vivants && 
            parseInt(reproductionFormData.nombre_petits_vivants) > 0) {
          
          const shouldAddBabies = window.confirm(
            `Voulez-vous ajouter les ${reproductionFormData.nombre_petits_vivants} petit(s) vivant(s) au cheptel automatiquement ?`
          );
          
          if (shouldAddBabies) {
            await addBabiesToHerd();
          }
        }
        
        setShowAddReproductionForm(false);
        setReproductionFormData({
          type_event: '',
          date_event: '',
          male_id: '',
          male_info: '',
          nombre_petits_nes: '',
          nombre_petits_vivants: '',
          nombre_petits_morts: '',
          poids_moyen_petits: '',
          notes: ''
        });
        
        await fetchReproductionEvents(selectedAnimalForReproduction.id);
        await fetchUpcomingBirths();
        await fetchAnimals(); // Refresh main list
        await fetchStats(); // Refresh stats
        
        alert('Événement reproductif ajouté avec succès !');
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de l'ajout: ${errorData.detail || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur de connexion. Veuillez réessayer.');
    }
    setLoading(false);
  };

  const addBabiesToHerd = async () => {
    try {
      const nombrePetits = parseInt(reproductionFormData.nombre_petits_vivants);
      const poidsMoyen = reproductionFormData.poids_moyen_petits ? 
        parseFloat(reproductionFormData.poids_moyen_petits) : 
        (selectedAnimalForReproduction.type === 'poulet' ? 0.05 : 1.5); // Poids par défaut
        
      for (let i = 1; i <= nombrePetits; i++) {
        const babyData = {
          type: selectedAnimalForReproduction.type,
          race: selectedAnimalForReproduction.race,
          sexe: i % 2 === 0 ? 'M' : 'F', // Alternance mâle/femelle
          date_naissance: reproductionFormData.date_event,
          poids: poidsMoyen,
          nom: `Petit ${i} de ${selectedAnimalForReproduction.nom || selectedAnimalForReproduction.id.slice(-4)}`,
          notes: `Né de ${selectedAnimalForReproduction.nom || 'mère ' + selectedAnimalForReproduction.id.slice(-4)}`
        };
        
        await fetch(`${API_BASE_URL}/api/animals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(babyData),
        });
      }
      
      alert(`${nombrePetits} petit(s) ajouté(s) au cheptel avec succès !`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout des petits:', error);
      alert('Erreur lors de l\'ajout des petits au cheptel');
    }
  };

  const handleClickReminder = async (reminder) => {
    // Find the animal for this reminder
    const animal = animals.find(a => a.id === reminder.animal_id);
    if (!animal) {
      alert('Animal non trouvé');
      return;
    }
    
    setSelectedReminder(reminder);
    setSelectedAnimalForMedical(animal);
    
    // Pre-fill the form with reminder data and today's date
    const today = new Date().toISOString().split('T')[0];
    setMedicalFormData({
      date_intervention: today,
      type_intervention: reminder.type_intervention,
      medicament: reminder.medicament || '',
      veterinaire: reminder.veterinaire || '',
      cout: reminder.cout ? reminder.cout.toString() : '',
      notes: `Suivi du rappel du ${formatDate(reminder.date_rappel)}. ${reminder.notes || ''}`.trim(),
      date_rappel: '' // New reminder date if needed
    });
    
    setShowReminderModal(true);
  };

  const handleCompleteReminder = async (e) => {
    e.preventDefault();
    
    if (!medicalFormData.date_intervention || !medicalFormData.type_intervention) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Create new medical record
      const newRecordData = {
        animal_id: selectedAnimalForMedical.id,
        date_intervention: medicalFormData.date_intervention,
        type_intervention: medicalFormData.type_intervention,
        medicament: medicalFormData.medicament ? medicalFormData.medicament.trim() : '',
        veterinaire: medicalFormData.veterinaire ? medicalFormData.veterinaire.trim() : '',
        cout: medicalFormData.cout ? parseFloat(medicalFormData.cout) : null,
        notes: medicalFormData.notes ? medicalFormData.notes.trim() : '',
        date_rappel: medicalFormData.date_rappel || null
      };
      
      const createResponse = await fetch(`${API_BASE_URL}/api/medical-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecordData),
      });

      if (!createResponse.ok) {
        throw new Error('Erreur lors de la création du nouveau dossier');
      }

      // 2. Delete the old reminder record
      const deleteResponse = await fetch(`${API_BASE_URL}/api/medical-records/${selectedReminder.id}`, {
        method: 'DELETE',
      });

      if (!deleteResponse.ok) {
        throw new Error('Erreur lors de la suppression de l\'ancien rappel');
      }

      // 3. Reset and refresh
      setShowReminderModal(false);
      setSelectedReminder(null);
      setSelectedAnimalForMedical(null);
      setMedicalFormData({
        date_intervention: '',
        type_intervention: '',
        medicament: '',
        veterinaire: '',
        cout: '',
        notes: '',
        date_rappel: ''
      });
      
      await fetchUpcomingReminders();
      alert('Rappel complété avec succès !');
      
    } catch (error) {
      console.error('Erreur:', error);
      alert(`Erreur: ${error.message}`);
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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet animal et tout son historique médical et reproductif ?')) {
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

  const handleShowReproductionHistory = (animal) => {
    setSelectedAnimalForReproduction(animal);
    setShowReproductionHistory(true);
    fetchReproductionEvents(animal.id);
    fetchBreedingMales(animal.type);
  };

  const handleShowAnimalProfile = async (animal) => {
    setSelectedAnimalForProfile(animal);
    setShowAnimalProfile(true);
    
    // Fetch all data for this animal
    try {
      // Fetch medical records
      const medicalResponse = await fetch(`${API_BASE_URL}/api/medical-records/${animal.id}`);
      const medicalData = await medicalResponse.json();
      setProfileMedicalRecords(medicalData.medical_records || []);
      
      // Fetch reproduction events
      const reproductionResponse = await fetch(`${API_BASE_URL}/api/reproduction-events/${animal.id}`);
      const reproductionData = await reproductionResponse.json();
      setProfileReproductionEvents(reproductionData.reproduction_events || []);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const handleDeleteMedicalRecord = async (recordId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cet enregistrement médical ?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/medical-records/${recordId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchUpcomingReminders(); // Refresh reminders
          // Also refresh medical records if modal is open
          if (selectedAnimalForMedical) {
            fetchMedicalRecords(selectedAnimalForMedical.id);
          }
          alert('Enregistrement supprimé avec succès !');
        } else {
          alert('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion');
      }
    }
  };

  const handleDeleteReproductionEvent = async (eventId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement reproductif ?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/reproduction-events/${eventId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchUpcomingBirths();
          if (selectedAnimalForReproduction) {
            fetchReproductionEvents(selectedAnimalForReproduction.id);
          }
          alert('Événement supprimé avec succès !');
        } else {
          alert('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion');
      }
    }
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

  const getAgeInDays = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const diffTime = Math.abs(today - birth);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getAnimalCategory = (animal) => {
    const ageInDays = getAgeInDays(animal.date_naissance);
    
    if (animal.type === 'porc') {
      if (ageInDays <= 60) { // 0-2 mois
        return 'porcelet';
      } else if (ageInDays <= 180) { // 2-6 mois
        return 'en_croissance';
      } else { // 6+ mois
        return animal.sexe === 'M' ? 'male_reproducteur' : 'femelle_reproductrice';
      }
    } else if (animal.type === 'poulet') {
      if (ageInDays <= 90) { // 0-3 mois
        return 'poussin';
      } else { // 3+ mois
        return animal.sexe === 'M' ? 'coq_reproducteur' : 'poule_pondeuse';
      }
    }
    
    return 'autre';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'porcelet': 'Porcelets (0-2 mois)',
      'en_croissance': 'En croissance (2-6 mois)',
      'male_reproducteur': 'Mâles reproducteurs (6+ mois)',
      'femelle_reproductrice': 'Femelles reproductrices (6+ mois)',
      'poussin': 'Poussins (0-3 mois)',
      'coq_reproducteur': 'Coqs reproducteurs (3+ mois)',
      'poule_pondeuse': 'Poules pondeuses (3+ mois)',
      'autre': 'Autre'
    };
    return labels[category] || category;
  };

  const getFilteredAndSortedAnimals = () => {
    let filtered = animals;
    
    // Filter by type (poulet/porc)
    if (filterType) {
      filtered = filtered.filter(animal => animal.type === filterType);
    }
    
    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter(animal => getAnimalCategory(animal) === filterCategory);
    }
    
    // Sort animals
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'age':
          return getAgeInDays(a.date_naissance) - getAgeInDays(b.date_naissance);
        case 'age_desc':
          return getAgeInDays(b.date_naissance) - getAgeInDays(a.date_naissance);
        case 'weight':
          return a.poids - b.poids;
        case 'weight_desc':
          return b.poids - a.poids;
        case 'name':
          const nameA = a.nom || `${a.type} #${a.id.slice(-4)}`;
          const nameB = b.nom || `${b.type} #${b.id.slice(-4)}`;
          return nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const getAvailableCategories = () => {
    if (!filterType) return [];
    
    const categoriesForType = animals
      .filter(animal => animal.type === filterType)
      .map(animal => getAnimalCategory(animal))
      .filter((category, index, self) => self.indexOf(category) === index)
      .sort();
      
    return categoriesForType;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const getEventTypeLabel = (type) => {
    const labels = {
      'saillie': 'Saillie',
      'insemination': 'Insémination',
      'mise_bas': 'Mise bas',
      'sevrage': 'Sevrage'
    };
    return labels[type] || type;
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
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFinancialDashboard(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                💰 Finances
              </button>
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
                    <div 
                      key={index} 
                      className="flex justify-between items-center bg-white rounded p-3 border border-amber-200 hover:bg-amber-50 cursor-pointer transition-colors"
                      onClick={() => handleClickReminder(reminder)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          <strong>{reminder.animal_info?.nom || 'Animal inconnu'}</strong> - {reminder.type_intervention}
                        </div>
                        <div className="text-sm text-gray-600">
                          Programmé pour le {formatDate(reminder.date_rappel)}
                        </div>
                        {reminder.notes && (
                          <div className="text-xs text-gray-500 mt-1">
                            Note: {reminder.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-amber-600">
                        👆 Cliquer pour effectuer
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

        {/* Upcoming Births */}
        {upcomingBirths.length > 0 && (
          <div className="bg-pink-50 border-l-4 border-pink-400 p-4 mb-8 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">🍼</span>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-pink-800">
                  Naissances prévues ({upcomingBirths.length})
                </h3>
                <div className="mt-2 text-sm text-pink-700 space-y-2">
                  {upcomingBirths.slice(0, 3).map((birth, index) => (
                    <div key={index} className="bg-white rounded p-3 border border-pink-200">
                      <div className="font-medium text-gray-900">
                        <strong>{birth.animal_info?.nom || 'Animal inconnu'}</strong>
                      </div>
                      <div className="text-sm text-gray-600">
                        Mise bas prévue le {formatDate(birth.date_prevue_mise_bas)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getEventTypeLabel(birth.type_event)} effectuée le {formatDate(birth.date_event)}
                      </div>
                    </div>
                  ))}
                  {upcomingBirths.length > 3 && (
                    <div className="text-xs mt-2">Et {upcomingBirths.length - 3} autre(s) naissance(s) prévue(s)...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Filter System */}
        <div className="bg-white rounded-xl shadow-lg mb-8 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres et tri</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Type Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">Filtrer par type:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFilterType('');
                    setFilterCategory('');
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    filterType === '' 
                      ? 'bg-gray-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📊 Tous ({stats.total_animals || 0})
                </button>
                <button
                  onClick={() => {
                    setFilterType('poulet');
                    setFilterCategory('');
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    filterType === 'poulet' 
                      ? 'bg-yellow-500 text-white shadow-lg' 
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                >
                  🐔 Poulets ({stats.total_poulets || 0})
                </button>
                <button
                  onClick={() => {
                    setFilterType('porc');
                    setFilterCategory('');
                  }}
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

            {/* Category Filter */}
            {filterType && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Filtrer par catégorie:</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Toutes les catégories</option>
                  {getAvailableCategories().map((category) => (
                    <option key={category} value={category}>
                      {getCategoryLabel(category)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Options */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">Trier par:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="age">Âge (plus jeune d'abord)</option>
                <option value="age_desc">Âge (plus âgé d'abord)</option>
                <option value="weight">Poids (plus léger d'abord)</option>
                <option value="weight_desc">Poids (plus lourd d'abord)</option>
                <option value="name">Nom (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Animals List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {filterCategory ? 
                  `${getCategoryLabel(filterCategory)} (${getFilteredAndSortedAnimals().length})` :
                  `Liste des Animaux (${getFilteredAndSortedAnimals().length})`
                }
              </h2>
              {filterType && (
                <div className="text-sm text-gray-500">
                  Type: {filterType === 'poulet' ? '🐔 Poulets' : '🐷 Porcs'} 
                  {filterCategory && ` • ${getCategoryLabel(filterCategory)}`}
                </div>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          ) : getFilteredAndSortedAnimals().length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-6xl mb-4">🐾</div>
              <p className="text-lg">
                {filterCategory ? 
                  `Aucun animal dans la catégorie "${getCategoryLabel(filterCategory)}"` :
                  'Aucun animal enregistré'
                }
              </p>
              <p className="text-sm">
                {filterCategory ? 
                  'Essayez une autre catégorie ou ajoutez de nouveaux animaux' :
                  'Commencez par ajouter votre premier animal!'
                }
              </p>
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
                      Race / Catégorie
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
                  {getFilteredAndSortedAnimals().map((animal) => {
                    const category = getAnimalCategory(animal);
                    return (
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{animal.race}</div>
                            <div className="text-xs text-gray-500">
                              {getCategoryLabel(category)}
                            </div>
                          </div>
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
                            onClick={() => handleShowAnimalProfile(animal)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            👁️ Profil
                          </button>
                          <button
                            onClick={() => handleShowMedicalHistory(animal)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            🏥 Médical
                          </button>
                          <button
                            onClick={() => handleShowReproductionHistory(animal)}
                            className="text-pink-600 hover:text-pink-900 mr-3"
                          >
                            🍼 Reproduction
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
                    );
                  })}
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
                        
                        <div className="flex flex-col space-y-1 ml-4">
                          <button
                            onClick={() => handleDeleteMedicalRecord(record.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded text-xs"
                            title="Supprimer cet enregistrement"
                          >
                            🗑️ Supprimer
                          </button>
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

      {/* Reproduction History Modal */}
      {showReproductionHistory && selectedAnimalForReproduction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[90]">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Historique reproductif - {selectedAnimalForReproduction.nom || `${selectedAnimalForReproduction.type} #${selectedAnimalForReproduction.id.slice(-4)}`}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAddReproductionForm(true)}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md text-sm"
                  >
                    + Ajouter un événement
                  </button>
                  <button
                    onClick={() => {
                      setShowReproductionHistory(false);
                      setSelectedAnimalForReproduction(null);
                      setReproductionEvents([]);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Reproduction Events List */}
              <div className="space-y-4">
                {reproductionEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🍼</div>
                    <p>Aucun historique reproductif enregistré</p>
                    <p className="text-sm">Commencez par ajouter un premier événement</p>
                  </div>
                ) : (
                  reproductionEvents.map((event) => (
                    <div key={event.id} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs font-medium">
                              {getEventTypeLabel(event.type_event)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {formatDate(event.date_event)}
                            </span>
                            {event.date_prevue_mise_bas && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                Mise bas: {formatDate(event.date_prevue_mise_bas)}
                              </span>
                            )}
                          </div>
                          
                          {event.male_animal_info && (
                            <p className="text-sm mb-1"><strong>Mâle:</strong> {event.male_animal_info.nom} ({event.male_animal_info.race})</p>
                          )}
                          
                          {event.male_info && (
                            <p className="text-sm mb-1"><strong>Mâle externe:</strong> {event.male_info}</p>
                          )}
                          
                          {event.nombre_petits_nes && (
                            <div className="text-sm mb-1">
                              <strong>Portée:</strong> {event.nombre_petits_nes} petit(s) né(s)
                              {event.nombre_petits_vivants && ` - ${event.nombre_petits_vivants} vivant(s)`}
                              {event.nombre_petits_morts && ` - ${event.nombre_petits_morts} mort(s)`}
                            </div>
                          )}
                          
                          {event.poids_moyen_petits && (
                            <p className="text-sm mb-1"><strong>Poids moyen:</strong> {event.poids_moyen_petits} kg</p>
                          )}
                          
                          {event.notes && (
                            <p className="text-sm text-gray-600 mt-2">{event.notes}</p>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-1 ml-4">
                          <button
                            onClick={() => handleDeleteReproductionEvent(event.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded text-xs"
                            title="Supprimer cet événement"
                          >
                            🗑️ Supprimer
                          </button>
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

      {/* Add Reproduction Event Modal */}
      {showAddReproductionForm && selectedAnimalForReproduction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-[100]">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Ajouter un événement reproductif
                </h3>
                <button
                  onClick={() => {
                    setShowAddReproductionForm(false);
                    setReproductionFormData({
                      type_event: '',
                      date_event: '',
                      male_id: '',
                      male_info: '',
                      nombre_petits_nes: '',
                      nombre_petits_vivants: '',
                      nombre_petits_morts: '',
                      poids_moyen_petits: '',
                      notes: ''
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleReproductionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type d'événement *</label>
                    <select
                      value={reproductionFormData.type_event}
                      onChange={(e) => setReproductionFormData({...reproductionFormData, type_event: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                      required
                    >
                      <option value="">Sélectionnez un type</option>
                      <option value="saillie">Saillie</option>
                      <option value="insemination">Insémination</option>
                      <option value="mise_bas">Mise bas</option>
                      <option value="sevrage">Sevrage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de l'événement *</label>
                    <input
                      type="date"
                      value={reproductionFormData.date_event}
                      onChange={(e) => setReproductionFormData({...reproductionFormData, date_event: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                  </div>

                  {(reproductionFormData.type_event === 'saillie' || reproductionFormData.type_event === 'insemination') && (
                    <>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mâle reproducteur *</label>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Choisir un mâle de votre élevage:</label>
                              <select
                                value={reproductionFormData.male_id}
                                onChange={(e) => setReproductionFormData({...reproductionFormData, male_id: e.target.value, male_info: ''})}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                              >
                                <option value="">-- Sélectionnez un mâle de votre élevage --</option>
                                {breedingMales.map((male) => (
                                  <option key={male.id} value={male.id}>
                                    {male.nom || `${male.type} #${male.id.slice(-4)}`} - {male.race} - {calculateAge(male.date_naissance)}
                                  </option>
                                ))}
                              </select>
                              {breedingMales.length === 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Aucun mâle {selectedAnimalForReproduction?.type} trouvé dans votre élevage
                                </p>
                              )}
                            </div>
                            
                            <div className="text-center text-gray-500 text-sm">--- OU ---</div>
                            
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Mâle externe (hors élevage):</label>
                              <input
                                type="text"
                                value={reproductionFormData.male_info}
                                onChange={(e) => setReproductionFormData({...reproductionFormData, male_info: e.target.value, male_id: ''})}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                placeholder="Ex: Verrat Yorkshire de l'élevage Martin, 3 ans"
                              />
                            </div>
                          </div>
                          
                          {!reproductionFormData.male_id && !reproductionFormData.male_info && (
                            <p className="text-xs text-red-500 mt-2">
                              ⚠️ Veuillez sélectionner un mâle de votre élevage OU saisir les informations d'un mâle externe
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {reproductionFormData.type_event === 'mise_bas' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre de petits nés</label>
                        <input
                          type="number"
                          value={reproductionFormData.nombre_petits_nes}
                          onChange={(e) => setReproductionFormData({...reproductionFormData, nombre_petits_nes: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre de petits vivants</label>
                        <input
                          type="number"
                          value={reproductionFormData.nombre_petits_vivants}
                          onChange={(e) => setReproductionFormData({...reproductionFormData, nombre_petits_vivants: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre de petits morts</label>
                        <input
                          type="number"
                          value={reproductionFormData.nombre_petits_morts}
                          onChange={(e) => setReproductionFormData({...reproductionFormData, nombre_petits_morts: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Poids moyen des petits (kg)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={reproductionFormData.poids_moyen_petits}
                          onChange={(e) => setReproductionFormData({...reproductionFormData, poids_moyen_petits: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                          min="0"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={reproductionFormData.notes}
                    onChange={(e) => setReproductionFormData({...reproductionFormData, notes: e.target.value})}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Observations, conditions, remarques..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddReproductionForm(false);
                      setReproductionFormData({
                        type_event: '',
                        date_event: '',
                        male_id: '',
                        male_info: '',
                        nombre_petits_nes: '',
                        nombre_petits_vivants: '',
                        nombre_petits_morts: '',
                        poids_moyen_petits: '',
                        notes: ''
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !reproductionFormData.type_event || !reproductionFormData.date_event}
                    className="px-6 py-2 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Enregistrement...' : '🍼 Enregistrer l\'événement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Animal Profile Modal */}
      {showAnimalProfile && selectedAnimalForProfile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[90]">
          <div className="relative top-5 mx-auto p-5 border w-11/12 md:w-5/6 lg:w-4/5 shadow-lg rounded-md bg-white max-h-[95vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center mr-4">
                    <span className="text-white text-3xl">
                      {selectedAnimalForProfile.type === 'poulet' ? '🐔' : '🐷'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedAnimalForProfile.nom || `${selectedAnimalForProfile.type} #${selectedAnimalForProfile.id.slice(-4)}`}
                    </h3>
                    <p className="text-lg text-gray-600 capitalize">{selectedAnimalForProfile.type} - {selectedAnimalForProfile.race}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAnimalProfile(false);
                    setSelectedAnimalForProfile(null);
                    setProfileMedicalRecords([]);
                    setProfileReproductionEvents([]);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informations générales */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    📋 Informations générales
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sexe:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedAnimalForProfile.sexe === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {selectedAnimalForProfile.sexe === 'M' ? '♂ Mâle' : '♀ Femelle'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Âge:</span>
                      <span className="font-medium">{calculateAge(selectedAnimalForProfile.date_naissance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Poids:</span>
                      <span className="font-medium">{selectedAnimalForProfile.poids} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Né le:</span>
                      <span className="font-medium">{formatDate(selectedAnimalForProfile.date_naissance)}</span>
                    </div>
                    {selectedAnimalForProfile.notes && (
                      <div className="mt-4 p-3 bg-white rounded-lg">
                        <span className="text-gray-600 text-sm">Notes:</span>
                        <p className="text-gray-800 mt-1">{selectedAnimalForProfile.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Historique médical */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    🏥 Historique médical ({profileMedicalRecords.length})
                  </h4>
                  <div className="max-h-64 overflow-y-auto space-y-3">
                    {profileMedicalRecords.length === 0 ? (
                      <p className="text-gray-500 text-sm">Aucun soin enregistré</p>
                    ) : (
                      profileMedicalRecords.slice(0, 5).map((record) => (
                        <div key={record.id} className="bg-white p-3 rounded-lg border border-green-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {record.type_intervention}
                            </span>
                            <span className="text-xs text-gray-500">{formatDate(record.date_intervention)}</span>
                          </div>
                          {record.medicament && (
                            <p className="text-sm text-gray-700">{record.medicament}</p>
                          )}
                          {record.date_rappel && (
                            <p className="text-xs text-amber-600 mt-1">
                              Rappel: {formatDate(record.date_rappel)}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                    {profileMedicalRecords.length > 5 && (
                      <p className="text-xs text-gray-500 text-center">
                        Et {profileMedicalRecords.length - 5} autre(s) soin(s)...
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowAnimalProfile(false);
                      handleShowMedicalHistory(selectedAnimalForProfile);
                    }}
                    className="mt-4 text-sm text-green-600 hover:text-green-800 underline"
                  >
                    Voir l'historique complet →
                  </button>
                </div>

                {/* Historique reproductif */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
                  <h4 className="text-lg font-semibold text-pink-800 mb-4 flex items-center">
                    🍼 Historique reproductif ({profileReproductionEvents.length})
                  </h4>
                  <div className="max-h-64 overflow-y-auto space-y-3">
                    {profileReproductionEvents.length === 0 ? (
                      <p className="text-gray-500 text-sm">Aucun événement enregistré</p>
                    ) : (
                      profileReproductionEvents.slice(0, 5).map((event) => (
                        <div key={event.id} className="bg-white p-3 rounded-lg border border-pink-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                              {getEventTypeLabel(event.type_event)}
                            </span>
                            <span className="text-xs text-gray-500">{formatDate(event.date_event)}</span>
                          </div>
                          {event.date_prevue_mise_bas && (
                            <p className="text-xs text-green-600">
                              Mise bas prévue: {formatDate(event.date_prevue_mise_bas)}
                            </p>
                          )}
                          {event.nombre_petits_vivants && (
                            <p className="text-sm text-gray-700">
                              {event.nombre_petits_vivants} petit(s) vivant(s)
                            </p>
                          )}
                        </div>
                      ))
                    )}
                    {profileReproductionEvents.length > 5 && (
                      <p className="text-xs text-gray-500 text-center">
                        Et {profileReproductionEvents.length - 5} autre(s) événement(s)...
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowAnimalProfile(false);
                      handleShowReproductionHistory(selectedAnimalForProfile);
                    }}
                    className="mt-4 text-sm text-pink-600 hover:text-pink-800 underline"
                  >
                    Voir l'historique complet →
                  </button>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setShowAnimalProfile(false);
                    handleShowMedicalHistory(selectedAnimalForProfile);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  🏥 Ajouter un soin
                </button>
                <button
                  onClick={() => {
                    setShowAnimalProfile(false);
                    handleShowReproductionHistory(selectedAnimalForProfile);
                  }}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
                >
                  🍼 Ajouter un événement reproductif
                </button>
                <button
                  onClick={() => {
                    setShowAnimalProfile(false);
                    handleEdit(selectedAnimalForProfile);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  ✏️ Modifier les infos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Completion Modal */}
      {showReminderModal && selectedReminder && selectedAnimalForMedical && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-[110]">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  ⚠️ Effectuer le rappel médical
                </h3>
                <button
                  onClick={() => {
                    setShowReminderModal(false);
                    setSelectedReminder(null);
                    setSelectedAnimalForMedical(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Original reminder info */}
              <div className="bg-amber-50 p-4 rounded-lg mb-4 border border-amber-200">
                <h4 className="font-medium text-amber-800 mb-2">Rappel programmé :</h4>
                <div className="text-sm text-amber-700">
                  <p><strong>Animal:</strong> {selectedAnimalForMedical.nom || `${selectedAnimalForMedical.type} #${selectedAnimalForMedical.id.slice(-4)}`}</p>
                  <p><strong>Type:</strong> {selectedReminder.type_intervention}</p>
                  <p><strong>Date prévue:</strong> {formatDate(selectedReminder.date_rappel)}</p>
                  {selectedReminder.medicament && <p><strong>Médicament prévu:</strong> {selectedReminder.medicament}</p>}
                  {selectedReminder.notes && <p><strong>Notes originales:</strong> {selectedReminder.notes}</p>}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg mb-4 border-l-4 border-green-400">
                <h4 className="font-medium text-green-800 mb-2">📝 Enregistrer le soin effectué :</h4>
                <p className="text-sm text-green-700">Remplissez les informations du traitement que vous venez d'effectuer</p>
              </div>
              
              <form onSubmit={handleCompleteReminder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date d'intervention *</label>
                    <input
                      type="date"
                      value={medicalFormData.date_intervention}
                      onChange={(e) => setMedicalFormData({...medicalFormData, date_intervention: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type d'intervention *</label>
                    <select
                      value={medicalFormData.type_intervention}
                      onChange={(e) => setMedicalFormData({...medicalFormData, type_intervention: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
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
                    <label className="block text-sm font-medium text-gray-700">Médicament utilisé</label>
                    <input
                      type="text"
                      value={medicalFormData.medicament}
                      onChange={(e) => setMedicalFormData({...medicalFormData, medicament: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Nom du médicament utilisé"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vétérinaire</label>
                    <input
                      type="text"
                      value={medicalFormData.veterinaire}
                      onChange={(e) => setMedicalFormData({...medicalFormData, veterinaire: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
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
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prochain rappel (optionnel)</label>
                    <input
                      type="date"
                      value={medicalFormData.date_rappel}
                      onChange={(e) => setMedicalFormData({...medicalFormData, date_rappel: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes du traitement</label>
                  <textarea
                    value={medicalFormData.notes}
                    onChange={(e) => setMedicalFormData({...medicalFormData, notes: e.target.value})}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Observations, réactions, dosage effectué..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReminderModal(false);
                      setSelectedReminder(null);
                      setSelectedAnimalForMedical(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !medicalFormData.date_intervention || !medicalFormData.type_intervention}
                    className="px-6 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Validation...' : '✅ Valider le rappel effectué'}
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
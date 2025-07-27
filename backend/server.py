from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import os
import uuid

# Environment variables
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')

# MongoDB setup
client = MongoClient(MONGO_URL)
db = client.livestock_management
animals_collection = db.animals
medical_records_collection = db.medical_records
reproduction_events_collection = db.reproduction_events
financial_records_collection = db.financial_records

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Animal(BaseModel):
    id: Optional[str] = None
    type: str  # "poulet" or "porc"
    race: str
    sexe: str  # "M" or "F"
    date_naissance: str
    poids: float
    nom: Optional[str] = None
    notes: Optional[str] = None
    statut: Optional[str] = "actif"  # "actif", "vendu", "mort", "abattu"
    date_vente: Optional[str] = None
    prix_vente: Optional[float] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class AnimalUpdate(BaseModel):
    race: Optional[str] = None
    sexe: Optional[str] = None
    date_naissance: Optional[str] = None
    poids: Optional[float] = None
    nom: Optional[str] = None
    notes: Optional[str] = None
    statut: Optional[str] = None
    date_vente: Optional[str] = None
    prix_vente: Optional[float] = None

class MedicalRecord(BaseModel):
    id: Optional[str] = None
    animal_id: str
    date_intervention: str
    type_intervention: str  # vaccination, traitement, visite_veterinaire, autre
    medicament: Optional[str] = None
    veterinaire: Optional[str] = None
    cout: Optional[float] = None
    notes: Optional[str] = None
    date_rappel: Optional[str] = None  # For vaccination reminders
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class MedicalRecordUpdate(BaseModel):
    date_intervention: Optional[str] = None
    type_intervention: Optional[str] = None
    medicament: Optional[str] = None
    veterinaire: Optional[str] = None
    cout: Optional[float] = None
    notes: Optional[str] = None
    date_rappel: Optional[str] = None

class ReproductionEvent(BaseModel):
    id: Optional[str] = None
    animal_id: str  # Female animal
    type_event: str  # "saillie", "insemination", "mise_bas", "sevrage"
    date_event: str
    male_id: Optional[str] = None  # Male animal ID for breeding
    male_info: Optional[str] = None  # External male info if not in system
    date_prevue_mise_bas: Optional[str] = None
    nombre_petits_nes: Optional[int] = None
    nombre_petits_vivants: Optional[int] = None
    nombre_petits_morts: Optional[int] = None
    poids_moyen_petits: Optional[float] = None
    notes: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class ReproductionEventUpdate(BaseModel):
    type_event: Optional[str] = None
    date_event: Optional[str] = None
    male_id: Optional[str] = None
    male_info: Optional[str] = None
    date_prevue_mise_bas: Optional[str] = None
    nombre_petits_nes: Optional[int] = None
    nombre_petits_vivants: Optional[int] = None
    nombre_petits_morts: Optional[int] = None
    poids_moyen_petits: Optional[float] = None
    notes: Optional[str] = None

class FinancialRecord(BaseModel):
    id: Optional[str] = None
    type_transaction: str  # "depense" or "recette"
    categorie: str  # "alimentation", "soins", "equipement", "vente", "autre"
    date_transaction: str
    montant: float
    animal_id: Optional[str] = None  # If transaction is linked to specific animal
    description: str
    fournisseur_acheteur: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class FinancialRecordUpdate(BaseModel):
    type_transaction: Optional[str] = None
    categorie: Optional[str] = None
    date_transaction: Optional[str] = None
    montant: Optional[float] = None
    animal_id: Optional[str] = None
    description: Optional[str] = None
    fournisseur_acheteur: Optional[str] = None
    notes: Optional[str] = None

def calculate_birth_date(mating_date: str, animal_type: str) -> str:
    """Calculate expected birth date based on gestation period"""
    mating = datetime.strptime(mating_date, "%Y-%m-%d")
    
    # Gestation periods in days
    gestation_periods = {
        "porc": 114,  # ~3 months, 3 weeks, 3 days
        "poulet": 21   # 21 days incubation
    }
    
    gestation_days = gestation_periods.get(animal_type, 114)
    birth_date = mating + timedelta(days=gestation_days)
    
    return birth_date.strftime("%Y-%m-%d")

@app.get("/")
async def root():
    return {"message": "API de gestion d'élevage"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# CRUD endpoints for animals
@app.post("/api/animals")
async def create_animal(animal: Animal):
    try:
        animal_dict = animal.dict()
        animal_dict["id"] = str(uuid.uuid4())
        animal_dict["statut"] = "actif"  # Set default status
        animal_dict["created_at"] = datetime.now().isoformat()
        animal_dict["updated_at"] = datetime.now().isoformat()
        
        result = animals_collection.insert_one(animal_dict)
        
        if result.inserted_id:
            return {"message": "Animal créé avec succès", "id": animal_dict["id"]}
        else:
            raise HTTPException(status_code=500, detail="Erreur lors de la création")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/api/animals")
async def get_animals(type: Optional[str] = None, statut: Optional[str] = "actif"):
    try:
        query = {}
        if type:
            query["type"] = type
        if statut:
            query["statut"] = statut
        
        animals = list(animals_collection.find(query, {"_id": 0}))
        return {"animals": animals, "total": len(animals)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/api/animals/{animal_id}")
async def get_animal(animal_id: str):
    try:
        animal = animals_collection.find_one({"id": animal_id}, {"_id": 0})
        if not animal:
            raise HTTPException(status_code=404, detail="Animal non trouvé")
        return animal
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.put("/api/animals/{animal_id}")
async def update_animal(animal_id: str, update_data: AnimalUpdate):
    try:
        animal = animals_collection.find_one({"id": animal_id})
        if not animal:
            raise HTTPException(status_code=404, detail="Animal non trouvé")
        
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.now().isoformat()
        
        result = animals_collection.update_one(
            {"id": animal_id},
            {"$set": update_dict}
        )
        
        if result.modified_count > 0:
            return {"message": "Animal mis à jour avec succès"}
        else:
            return {"message": "Aucune modification effectuée"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.delete("/api/animals/{animal_id}")
async def delete_animal(animal_id: str):
    try:
        result = animals_collection.delete_one({"id": animal_id})
        if result.deleted_count > 0:
            # Also delete associated records
            medical_records_collection.delete_many({"animal_id": animal_id})
            reproduction_events_collection.delete_many({"animal_id": animal_id})
            financial_records_collection.delete_many({"animal_id": animal_id})
            return {"message": "Animal supprimé avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Animal non trouvé")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/api/stats")
async def get_stats():
    try:
        # Only count active animals
        total_animals = animals_collection.count_documents({"statut": "actif"})
        total_poulets = animals_collection.count_documents({"type": "poulet", "statut": "actif"})
        total_porcs = animals_collection.count_documents({"type": "porc", "statut": "actif"})
        
        # Stats par sexe (only active)
        males = animals_collection.count_documents({"sexe": "M", "statut": "actif"})
        females = animals_collection.count_documents({"sexe": "F", "statut": "actif"})
        
        # Additional stats for sold animals
        total_vendus = animals_collection.count_documents({"statut": "vendu"})
        
        return {
            "total_animals": total_animals,
            "total_poulets": total_poulets,
            "total_porcs": total_porcs,
            "males": males,
            "females": females,
            "total_vendus": total_vendus
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

# CRUD endpoints for medical records
@app.post("/api/medical-records")
async def create_medical_record(record: MedicalRecord):
    try:
        # Verify animal exists
        animal = animals_collection.find_one({"id": record.animal_id})
        if not animal:
            raise HTTPException(status_code=404, detail="Animal non trouvé")
        
        record_dict = record.dict()
        record_dict["id"] = str(uuid.uuid4())
        record_dict["created_at"] = datetime.now().isoformat()
        record_dict["updated_at"] = datetime.now().isoformat()
        
        result = medical_records_collection.insert_one(record_dict)
        
        if result.inserted_id:
            return {"message": "Dossier médical créé avec succès", "id": record_dict["id"]}
        else:
            raise HTTPException(status_code=500, detail="Erreur lors de la création")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/api/medical-records/{animal_id}")
async def get_medical_records(animal_id: str):
    try:
        # Verify animal exists
        animal = animals_collection.find_one({"id": animal_id})
        if not animal:
            raise HTTPException(status_code=404, detail="Animal non trouvé")
        
        records = list(medical_records_collection.find(
            {"animal_id": animal_id}, 
            {"_id": 0}
        ).sort("date_intervention", -1))  # Sort by date, newest first
        
        return {"medical_records": records, "total": len(records)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/api/medical-records/record/{record_id}")
async def get_medical_record(record_id: str):
    try:
        record = medical_records_collection.find_one({"id": record_id}, {"_id": 0})
        if not record:
            raise HTTPException(status_code=404, detail="Dossier médical non trouvé")
        return record
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.put("/api/medical-records/{record_id}")
async def update_medical_record(record_id: str, update_data: MedicalRecordUpdate):
    try:
        record = medical_records_collection.find_one({"id": record_id})
        if not record:
            raise HTTPException(status_code=404, detail="Dossier médical non trouvé")
        
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.now().isoformat()
        
        result = medical_records_collection.update_one(
            {"id": record_id},
            {"$set": update_dict}
        )
        
        if result.modified_count > 0:
            return {"message": "Dossier médical mis à jour avec succès"}
        else:
            return {"message": "Aucune modification effectuée"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.delete("/api/medical-records/{record_id}")
async def delete_medical_record(record_id: str):
    try:
        result = medical_records_collection.delete_one({"id": record_id})
        if result.deleted_count > 0:
            return {"message": "Dossier médical supprimé avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Dossier médical non trouvé")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/api/medical-records/reminders/upcoming")
async def get_upcoming_reminders():
    try:
        from datetime import datetime, timedelta
        
        # Get reminders for the next 30 days
        today = datetime.now()
        thirty_days_later = today + timedelta(days=30)
        
        records = list(medical_records_collection.find({
            "date_rappel": {
                "$gte": today.strftime("%Y-%m-%d"),
                "$lte": thirty_days_later.strftime("%Y-%m-%d")
            }
        }, {"_id": 0}).sort("date_rappel", 1))
        
        # Enrich with animal information
        for record in records:
            animal = animals_collection.find_one({"id": record["animal_id"]}, {"_id": 0})
            if animal:
                record["animal_info"] = {
                    "nom": animal.get("nom", f"{animal['type']} #{animal['id'][-4:]}"),
                    "type": animal["type"],
                    "race": animal["race"]
                }
        
        return {"reminders": records, "total": len(records)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

# CRUD endpoints for reproduction events
@app.post("/api/reproduction-events")
async def create_reproduction_event(event: ReproductionEvent):
    try:
        # Verify animal exists
        animal = animals_collection.find_one({"id": event.animal_id})
        if not animal:
            raise HTTPException(status_code=404, detail="Animal non trouvé")
        
        # Verify animal is female for breeding events
        if event.type_event in ["saillie", "insemination"] and animal["sexe"] != "F":
            raise HTTPException(status_code=400, detail="Seules les femelles peuvent être saillies/inséminées")
        
        event_dict = event.dict()
        event_dict["id"] = str(uuid.uuid4())
        event_dict["created_at"] = datetime.now().isoformat()
        event_dict["updated_at"] = datetime.now().isoformat()
        
        # Auto-calculate birth date for breeding events
        if event.type_event in ["saillie", "insemination"] and not event.date_prevue_mise_bas:
            event_dict["date_prevue_mise_bas"] = calculate_birth_date(event.date_event, animal["type"])
        
        result = reproduction_events_collection.insert_one(event_dict)
        
        if result.inserted_id:
            return {"message": "Événement reproductif créé avec succès", "id": event_dict["id"]}
        else:
            raise HTTPException(status_code=500, detail="Erreur lors de la création")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/api/reproduction-events/{animal_id}")
async def get_reproduction_events(animal_id: str):
    try:
        # Verify animal exists
        animal = animals_collection.find_one({"id": animal_id})
        if not animal:
            raise HTTPException(status_code=404, detail="Animal non trouvé")
        
        events = list(reproduction_events_collection.find(
            {"animal_id": animal_id}, 
            {"_id": 0}
        ).sort("date_event", -1))  # Sort by date, newest first
        
        # Enrich with male animal information if available
        for event in events:
            if event.get("male_id"):
                male_animal = animals_collection.find_one({"id": event["male_id"]}, {"_id": 0})
                if male_animal:
                    event["male_animal_info"] = {
                        "nom": male_animal.get("nom", f"{male_animal['type']} #{male_animal['id'][-4:]}"),
                        "race": male_animal["race"]
                    }
        
        return {"reproduction_events": events, "total": len(events)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.put("/api/reproduction-events/{event_id}")
async def update_reproduction_event(event_id: str, update_data: ReproductionEventUpdate):
    try:
        event = reproduction_events_collection.find_one({"id": event_id})
        if not event:
            raise HTTPException(status_code=404, detail="Événement reproductif non trouvé")
        
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.now().isoformat()
        
        result = reproduction_events_collection.update_one(
            {"id": event_id},
            {"$set": update_dict}
        )
        
        if result.modified_count > 0:
            return {"message": "Événement reproductif mis à jour avec succès"}
        else:
            return {"message": "Aucune modification effectuée"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.delete("/api/reproduction-events/{event_id}")
async def delete_reproduction_event(event_id: str):
    try:
        result = reproduction_events_collection.delete_one({"id": event_id})
        if result.deleted_count > 0:
            return {"message": "Événement reproductif supprimé avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Événement reproductif non trouvé")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/api/reproduction-events/upcoming-births")
async def get_upcoming_births():
    try:
        from datetime import datetime, timedelta
        
        # Get births expected in the next 30 days
        today = datetime.now()
        thirty_days_later = today + timedelta(days=30)
        
        events = list(reproduction_events_collection.find({
            "type_event": {"$in": ["saillie", "insemination"]},
            "date_prevue_mise_bas": {
                "$gte": today.strftime("%Y-%m-%d"),
                "$lte": thirty_days_later.strftime("%Y-%m-%d")
            }
        }, {"_id": 0}).sort("date_prevue_mise_bas", 1))
        
        # Enrich with animal information
        for event in events:
            animal = animals_collection.find_one({"id": event["animal_id"]}, {"_id": 0})
            if animal:
                event["animal_info"] = {
                    "nom": animal.get("nom", f"{animal['type']} #{animal['id'][-4:]}"),
                    "type": animal["type"],
                    "race": animal["race"]
                }
        
        return {"upcoming_births": events, "total": len(events)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/api/animals/breeding-males/{animal_type}")
async def get_breeding_males(animal_type: str):
    try:
        # Get all male animals of the specified type for breeding selection (only active)
        males = list(animals_collection.find({
            "type": animal_type,
            "sexe": "M",
            "statut": "actif"
        }, {"_id": 0}).sort("nom", 1))
        
        return {"breeding_males": males, "total": len(males)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.put("/api/animals/{animal_id}/sell")
async def sell_animal(animal_id: str, prix_vente: float, date_vente: str):
    try:
        animal = animals_collection.find_one({"id": animal_id})
        if not animal:
            raise HTTPException(status_code=404, detail="Animal non trouvé")
        
        # Update animal status to sold
        result = animals_collection.update_one(
            {"id": animal_id},
            {"$set": {
                "statut": "vendu",
                "date_vente": date_vente,
                "prix_vente": prix_vente,
                "updated_at": datetime.now().isoformat()
            }}
        )
        
        if result.modified_count > 0:
            return {"message": "Animal marqué comme vendu avec succès"}
        else:
            raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

# CRUD endpoints for financial records
@app.post("/api/financial-records")
async def create_financial_record(record: FinancialRecord):
    try:
        # Verify animal exists if animal_id is provided
        if record.animal_id:
            animal = animals_collection.find_one({"id": record.animal_id})
            if not animal:
                raise HTTPException(status_code=404, detail="Animal non trouvé")
        
        record_dict = record.dict()
        record_dict["id"] = str(uuid.uuid4())
        record_dict["created_at"] = datetime.now().isoformat()
        record_dict["updated_at"] = datetime.now().isoformat()
        
        result = financial_records_collection.insert_one(record_dict)
        
        if result.inserted_id:
            return {"message": "Transaction financière créée avec succès", "id": record_dict["id"]}
        else:
            raise HTTPException(status_code=500, detail="Erreur lors de la création")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/api/financial-records")
async def get_financial_records(
    start_date: Optional[str] = None, 
    end_date: Optional[str] = None,
    type_transaction: Optional[str] = None,
    categorie: Optional[str] = None
):
    try:
        query = {}
        
        # Filter by date range
        if start_date and end_date:
            query["date_transaction"] = {
                "$gte": start_date,
                "$lte": end_date
            }
        elif start_date:
            query["date_transaction"] = {"$gte": start_date}
        elif end_date:
            query["date_transaction"] = {"$lte": end_date}
            
        # Filter by transaction type
        if type_transaction:
            query["type_transaction"] = type_transaction
            
        # Filter by category
        if categorie:
            query["categorie"] = categorie
        
        records = list(financial_records_collection.find(query, {"_id": 0}).sort("date_transaction", -1))
        
        # Enrich with animal information if linked
        for record in records:
            if record.get("animal_id"):
                animal = animals_collection.find_one({"id": record["animal_id"]}, {"_id": 0})
                if animal:
                    record["animal_info"] = {
                        "nom": animal.get("nom", f"{animal['type']} #{animal['id'][-4:]}"),
                        "type": animal["type"],
                        "race": animal["race"]
                    }
        
        return {"financial_records": records, "total": len(records)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/api/financial-records/{record_id}")
async def get_financial_record(record_id: str):
    try:
        record = financial_records_collection.find_one({"id": record_id}, {"_id": 0})
        if not record:
            raise HTTPException(status_code=404, detail="Transaction financière non trouvée")
        return record
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.put("/api/financial-records/{record_id}")
async def update_financial_record(record_id: str, update_data: FinancialRecordUpdate):
    try:
        record = financial_records_collection.find_one({"id": record_id})
        if not record:
            raise HTTPException(status_code=404, detail="Transaction financière non trouvée")
        
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.now().isoformat()
        
        result = financial_records_collection.update_one(
            {"id": record_id},
            {"$set": update_dict}
        )
        
        if result.modified_count > 0:
            return {"message": "Transaction financière mise à jour avec succès"}
        else:
            return {"message": "Aucune modification effectuée"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.delete("/api/financial-records/{record_id}")
async def delete_financial_record(record_id: str):
    try:
        result = financial_records_collection.delete_one({"id": record_id})
        if result.deleted_count > 0:
            return {"message": "Transaction financière supprimée avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Transaction financière non trouvée")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/api/financial-stats")
async def get_financial_stats(
    start_date: Optional[str] = None, 
    end_date: Optional[str] = None
):
    try:
        from datetime import datetime, timedelta
        
        # Default to current month if no dates provided
        if not start_date and not end_date:
            today = datetime.now()
            start_of_month = today.replace(day=1)
            start_date = start_of_month.strftime("%Y-%m-%d")
            end_date = today.strftime("%Y-%m-%d")
        
        query = {}
        if start_date and end_date:
            query["date_transaction"] = {
                "$gte": start_date,
                "$lte": end_date
            }
        
        # Calculate totals
        depenses = list(financial_records_collection.find({
            **query,
            "type_transaction": "depense"
        }, {"_id": 0}))
        
        recettes = list(financial_records_collection.find({
            **query,
            "type_transaction": "recette"
        }, {"_id": 0}))
        
        total_depenses = sum(record["montant"] for record in depenses)
        total_recettes = sum(record["montant"] for record in recettes)
        benefice = total_recettes - total_depenses
        
        # Group by category
        depenses_par_categorie = {}
        for record in depenses:
            cat = record["categorie"]
            depenses_par_categorie[cat] = depenses_par_categorie.get(cat, 0) + record["montant"]
        
        recettes_par_categorie = {}
        for record in recettes:
            cat = record["categorie"]
            recettes_par_categorie[cat] = recettes_par_categorie.get(cat, 0) + record["montant"]
        
        return {
            "periode": {
                "debut": start_date,
                "fin": end_date
            },
            "resume": {
                "total_depenses": total_depenses,
                "total_recettes": total_recettes,
                "benefice": benefice,
                "nombre_transactions": len(depenses) + len(recettes)
            },
            "depenses_par_categorie": depenses_par_categorie,
            "recettes_par_categorie": recettes_par_categorie
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
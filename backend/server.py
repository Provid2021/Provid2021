from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import os
import uuid

# Environment variables
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')

# MongoDB setup
client = MongoClient(MONGO_URL)
db = client.livestock_management
animals_collection = db.animals
medical_records_collection = db.medical_records

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
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class AnimalUpdate(BaseModel):
    race: Optional[str] = None
    sexe: Optional[str] = None
    date_naissance: Optional[str] = None
    poids: Optional[float] = None
    nom: Optional[str] = None
    notes: Optional[str] = None

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
async def get_animals(type: Optional[str] = None):
    try:
        query = {}
        if type:
            query["type"] = type
        
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
            # Also delete associated medical records
            medical_records_collection.delete_many({"animal_id": animal_id})
            return {"message": "Animal supprimé avec succès"}
        else:
            raise HTTPException(status_code=404, detail="Animal non trouvé")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/api/stats")
async def get_stats():
    try:
        total_animals = animals_collection.count_documents({})
        total_poulets = animals_collection.count_documents({"type": "poulet"})
        total_porcs = animals_collection.count_documents({"type": "porc"})
        
        # Stats par sexe
        males = animals_collection.count_documents({"sexe": "M"})
        females = animals_collection.count_documents({"sexe": "F"})
        
        return {
            "total_animals": total_animals,
            "total_poulets": total_poulets,
            "total_porcs": total_porcs,
            "males": males,
            "females": females
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
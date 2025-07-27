from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Enums pour les nouveaux systèmes
class MedicalType(str, Enum):
    VACCINATION = "vaccination"
    TREATMENT = "traitement"
    CHECKUP = "visite"
    SURGERY = "chirurgie"
    OTHER = "autre"

class ReproductionStatus(str, Enum):
    AVAILABLE = "disponible"
    PREGNANT = "gestante"
    LACTATING = "allaitante"
    BREEDING = "reproduction"
    RESTING = "repos"

class EventType(str, Enum):
    BIRTH = "naissance"
    SALE = "vente"
    MEDICAL = "medical"
    REPRODUCTION = "reproduction"
    FEEDING = "alimentation"
    OTHER = "autre"


# Modèles existants
class Animal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    sex: str
    age: str
    weight: float
    type: str  # "poulet" or "porc"
    status: str = "actif"  # "actif" or "vendu"
    reproduction_status: Optional[ReproductionStatus] = ReproductionStatus.AVAILABLE
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AnimalCreate(BaseModel):
    name: str
    category: str
    sex: str
    age: str
    weight: float
    type: str

class AnimalUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    sex: Optional[str] = None
    age: Optional[str] = None
    weight: Optional[float] = None
    status: Optional[str] = None
    reproduction_status: Optional[ReproductionStatus] = None


# Nouveaux modèles pour la gestion médicale
class MedicalRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    animal_id: str
    type: MedicalType
    description: str
    veterinarian: Optional[str] = None
    cost: Optional[float] = None
    date: datetime = Field(default_factory=datetime.utcnow)
    next_visit_date: Optional[datetime] = None
    notes: Optional[str] = None

class MedicalRecordCreate(BaseModel):
    animal_id: str
    type: MedicalType
    description: str
    veterinarian: Optional[str] = None
    cost: Optional[float] = None
    next_visit_date: Optional[datetime] = None
    notes: Optional[str] = None


# Nouveaux modèles pour la reproduction
class ReproductionRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    female_id: str
    male_id: Optional[str] = None
    breeding_date: datetime
    expected_birth_date: Optional[datetime] = None
    actual_birth_date: Optional[datetime] = None
    offspring_count: Optional[int] = None
    offspring_ids: List[str] = []
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReproductionRecordCreate(BaseModel):
    female_id: str
    male_id: Optional[str] = None
    breeding_date: datetime
    expected_birth_date: Optional[datetime] = None
    notes: Optional[str] = None


# Modèle pour l'historique
class HistoryEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    animal_id: Optional[str] = None
    event_type: EventType
    title: str
    description: str
    date: datetime = Field(default_factory=datetime.utcnow)
    cost: Optional[float] = None
    metadata: Optional[dict] = {}

class HistoryEventCreate(BaseModel):
    animal_id: Optional[str] = None
    event_type: EventType
    title: str
    description: str
    cost: Optional[float] = None
    metadata: Optional[dict] = {}


class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Élevage la Providence API"}

# Animal routes
@api_router.get("/animals", response_model=List[Animal])
async def get_animals():
    animals = await db.animals.find().to_list(1000)
    return [Animal(**animal) for animal in animals]

@api_router.post("/animals", response_model=Animal)
async def create_animal(animal: AnimalCreate):
    animal_dict = animal.dict()
    animal_obj = Animal(**animal_dict)
    await db.animals.insert_one(animal_obj.dict())
    return animal_obj

@api_router.get("/animals/{animal_id}", response_model=Animal)
async def get_animal(animal_id: str):
    animal = await db.animals.find_one({"id": animal_id})
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    return Animal(**animal)

@api_router.put("/animals/{animal_id}", response_model=Animal)
async def update_animal(animal_id: str, animal_update: AnimalUpdate):
    animal = await db.animals.find_one({"id": animal_id})
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    
    update_data = {k: v for k, v in animal_update.dict().items() if v is not None}
    await db.animals.update_one({"id": animal_id}, {"$set": update_data})
    
    updated_animal = await db.animals.find_one({"id": animal_id})
    return Animal(**updated_animal)

@api_router.delete("/animals/{animal_id}")
async def delete_animal(animal_id: str):
    result = await db.animals.delete_one({"id": animal_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Animal not found")
    return {"message": "Animal deleted successfully"}

# Statistics routes
@api_router.get("/stats")
async def get_statistics():
    animals = await db.animals.find().to_list(1000)
    
    total_animals = len([a for a in animals if a.get("status", "actif") == "actif"])
    poultry = len([a for a in animals if a.get("type") == "poulet" and a.get("status", "actif") == "actif"])
    pigs = len([a for a in animals if a.get("type") == "porc" and a.get("status", "actif") == "actif"])
    
    # Count by sex
    males = len([a for a in animals if a.get("sex") == "Mâle" and a.get("status", "actif") == "actif"])
    females = len([a for a in animals if a.get("sex") == "Femelle" and a.get("status", "actif") == "actif"])
    
    return {
        "total_livestock": total_animals,
        "active_animals": total_animals,
        "poultry": {"count": poultry, "males": len([a for a in animals if a.get("type") == "poulet" and a.get("sex") == "Mâle" and a.get("status", "actif") == "actif"]), "females": len([a for a in animals if a.get("type") == "poulet" and a.get("sex") == "Femelle" and a.get("status", "actif") == "actif"])},
        "pigs": {"count": pigs, "males": len([a for a in animals if a.get("type") == "porc" and a.get("sex") == "Mâle" and a.get("status", "actif") == "actif"]), "females": len([a for a in animals if a.get("type") == "porc" and a.get("sex") == "Femelle" and a.get("status", "actif") == "actif"])},
        "profitability": "3504444 FCFA",
        "males": males,
        "females": females
    }

# Status check routes (keep existing functionality)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Initialize with sample data on startup
@app.on_event("startup")
async def initialize_data():
    # Check if we already have data
    existing_animals = await db.animals.count_documents({})
    if existing_animals == 0:
        # Add sample data
        sample_animals = [
            {"id": str(uuid.uuid4()), "name": "poulet #3128", "category": "Plymouth Rock", "sex": "Mâle", "age": "27 jours", "weight": 1.0, "type": "poulet", "status": "actif", "created_at": datetime.utcnow()},
            {"id": str(uuid.uuid4()), "name": "poulet #f321", "category": "Sussex", "sex": "Femelle", "age": "27 jours", "weight": 1.5, "type": "poulet", "status": "actif", "created_at": datetime.utcnow()},
            {"id": str(uuid.uuid4()), "name": "Ok", "category": "Sussex", "sex": "Femelle", "age": "28 jours", "weight": 3.0, "type": "poulet", "status": "actif", "created_at": datetime.utcnow()},
            {"id": str(uuid.uuid4()), "name": "Petit 1 de 2", "category": "Large White", "sex": "Femelle", "age": "1 mois", "weight": 0.2, "type": "porc", "status": "actif", "created_at": datetime.utcnow()},
            {"id": str(uuid.uuid4()), "name": "Petit 2 de 2", "category": "Large White", "sex": "Mâle", "age": "1 mois", "weight": 0.2, "type": "porc", "status": "actif", "created_at": datetime.utcnow()},
        ]
        await db.animals.insert_many(sample_animals)
        logger.info("Sample data initialized")
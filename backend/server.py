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


# Modèles mis à jour pour la gestion par vagues
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
    # Nouveaux champs pour la gestion par lots
    batch_number: Optional[str] = None
    initial_quantity: int = 1  # Quantité initiale du lot
    current_quantity: int = 1  # Quantité actuelle disponible
    unit_price: Optional[float] = None  # Prix unitaire d'achat
    batch_date: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AnimalCreate(BaseModel):
    name: str
    category: str
    sex: str
    age: str
    weight: float
    type: str
    # Nouveaux champs pour les lots
    initial_quantity: int = 1
    unit_price: Optional[float] = None
    batch_number: Optional[str] = None

class AnimalUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    sex: Optional[str] = None
    age: Optional[str] = None
    weight: Optional[float] = None
    status: Optional[str] = None
    reproduction_status: Optional[ReproductionStatus] = None
    current_quantity: Optional[int] = None

# Modèle de vente mis à jour
class SaleRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    batch_id: str  # ID du lot d'animaux
    animal_type: str  # poulet ou porc
    quantity_sold: int
    unit_price: float
    total_amount: float
    buyer_name: Optional[str] = None
    buyer_contact: Optional[str] = None
    sale_date: datetime = Field(default_factory=datetime.utcnow)
    payment_method: Optional[str] = "cash"
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SaleRecordCreate(BaseModel):
    batch_id: str
    quantity_sold: int
    unit_price: float
    buyer_name: Optional[str] = None
    buyer_contact: Optional[str] = None
    sale_date: Optional[datetime] = None
    payment_method: Optional[str] = "cash"
    notes: Optional[str] = None


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


# Nouveaux modèles pour les ventes détaillées
class SaleRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    animal_id: str
    sale_price: float
    quantity: int = 1
    buyer_name: Optional[str] = None
    buyer_contact: Optional[str] = None
    sale_date: datetime = Field(default_factory=datetime.utcnow)
    payment_method: Optional[str] = "cash"  # cash, bank_transfer, check
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SaleRecordCreate(BaseModel):
    animal_id: str
    sale_price: float
    quantity: int = 1
    buyer_name: Optional[str] = None
    buyer_contact: Optional[str] = None
    sale_date: Optional[datetime] = None
    payment_method: Optional[str] = "cash"
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

# Routes pour les animaux (existantes)
@api_router.get("/")
async def root():
    return {"message": "Élevage la Providence API"}

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


# NOUVELLES ROUTES POUR LES VENTES
@api_router.get("/sales", response_model=List[SaleRecord])
async def get_all_sales():
    sales = await db.sales.find().sort("sale_date", -1).to_list(100)
    return [SaleRecord(**sale) for sale in sales]

@api_router.get("/sales/{animal_id}", response_model=List[SaleRecord])
async def get_animal_sales(animal_id: str):
    sales = await db.sales.find({"animal_id": animal_id}).sort("sale_date", -1).to_list(100)
    return [SaleRecord(**sale) for sale in sales]

@api_router.post("/sales", response_model=SaleRecord)
async def create_sale_record(sale: SaleRecordCreate):
    # Vérifier que l'animal existe
    animal = await db.animals.find_one({"id": sale.animal_id})
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    
    # Créer l'enregistrement de vente
    sale_dict = sale.dict()
    if not sale_dict.get('sale_date'):
        sale_dict['sale_date'] = datetime.utcnow()
    
    sale_record = SaleRecord(**sale_dict)
    await db.sales.insert_one(sale_record.dict())
    
    # Mettre à jour le statut de l'animal
    await db.animals.update_one(
        {"id": sale.animal_id}, 
        {"$set": {"status": "vendu"}}
    )
    
    # Ajouter à l'historique
    history_event = HistoryEvent(
        animal_id=sale.animal_id,
        event_type=EventType.SALE,
        title=f"Vente - {sale.sale_price} FCFA",
        description=f"Vendu à {sale.buyer_name or 'Acheteur non spécifié'} pour {sale.sale_price} FCFA",
        cost=sale.sale_price,
        metadata={
            "buyer_name": sale.buyer_name,
            "buyer_contact": sale.buyer_contact,
            "payment_method": sale.payment_method,
            "quantity": sale.quantity
        }
    )
    await db.history.insert_one(history_event.dict())
    
    return sale_record

@api_router.get("/sales/stats/summary")
async def get_sales_summary():
    sales = await db.sales.find().to_list(1000)
    
    total_revenue = sum(sale.get('sale_price', 0) for sale in sales)
    total_animals_sold = len(sales)
    average_price = total_revenue / total_animals_sold if total_animals_sold > 0 else 0
    
    # Ventes par mois
    monthly_sales = {}
    for sale in sales:
        sale_date = sale.get('sale_date')
        if sale_date:
            if isinstance(sale_date, str):
                sale_date = datetime.fromisoformat(sale_date.replace('Z', '+00:00'))
            month_key = sale_date.strftime('%Y-%m')
            if month_key not in monthly_sales:
                monthly_sales[month_key] = {"count": 0, "revenue": 0}
            monthly_sales[month_key]["count"] += 1
            monthly_sales[month_key]["revenue"] += sale.get('sale_price', 0)
    
    return {
        "total_revenue": total_revenue,
        "total_animals_sold": total_animals_sold,
        "average_price": average_price,
        "monthly_sales": monthly_sales
    }


# NOUVELLES ROUTES MÉDICALES
@api_router.get("/medical/{animal_id}", response_model=List[MedicalRecord])
async def get_animal_medical_records(animal_id: str):
    records = await db.medical_records.find({"animal_id": animal_id}).sort("date", -1).to_list(100)
    return [MedicalRecord(**record) for record in records]

@api_router.post("/medical", response_model=MedicalRecord)
async def create_medical_record(record: MedicalRecordCreate):
    # Vérifier que l'animal existe
    animal = await db.animals.find_one({"id": record.animal_id})
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    
    record_dict = record.dict()
    medical_record = MedicalRecord(**record_dict)
    await db.medical_records.insert_one(medical_record.dict())
    
    # Ajouter à l'historique
    history_event = HistoryEvent(
        animal_id=record.animal_id,
        event_type=EventType.MEDICAL,
        title=f"Soins médicaux: {record.type.value}",
        description=record.description,
        cost=record.cost,
        metadata={"medical_type": record.type.value, "veterinarian": record.veterinarian}
    )
    await db.history.insert_one(history_event.dict())
    
    return medical_record

@api_router.get("/medical", response_model=List[MedicalRecord])
async def get_all_medical_records():
    records = await db.medical_records.find().sort("date", -1).to_list(100)
    return [MedicalRecord(**record) for record in records]


# NOUVELLES ROUTES REPRODUCTION
@api_router.get("/reproduction/{animal_id}", response_model=List[ReproductionRecord])
async def get_animal_reproduction_records(animal_id: str):
    records = await db.reproduction_records.find({
        "$or": [{"female_id": animal_id}, {"male_id": animal_id}]
    }).sort("breeding_date", -1).to_list(100)
    return [ReproductionRecord(**record) for record in records]

@api_router.post("/reproduction", response_model=ReproductionRecord)
async def create_reproduction_record(record: ReproductionRecordCreate):
    # Vérifier que les animaux existent
    female = await db.animals.find_one({"id": record.female_id})
    if not female:
        raise HTTPException(status_code=404, detail="Female animal not found")
    
    if record.male_id:
        male = await db.animals.find_one({"id": record.male_id})
        if not male:
            raise HTTPException(status_code=404, detail="Male animal not found")
    
    record_dict = record.dict()
    reproduction_record = ReproductionRecord(**record_dict)
    await db.reproduction_records.insert_one(reproduction_record.dict())
    
    # Mettre à jour le statut de reproduction de la femelle
    await db.animals.update_one(
        {"id": record.female_id}, 
        {"$set": {"reproduction_status": ReproductionStatus.BREEDING.value}}
    )
    
    # Ajouter à l'historique
    male_name = male["name"] if record.male_id and male else "Non spécifié"
    history_event = HistoryEvent(
        animal_id=record.female_id,
        event_type=EventType.REPRODUCTION,
        title="Reproduction planifiée",
        description=f"Accouplement avec {male_name}",
        metadata={"male_id": record.male_id, "expected_birth": record.expected_birth_date}
    )
    await db.history.insert_one(history_event.dict())
    
    return reproduction_record

@api_router.get("/reproduction", response_model=List[ReproductionRecord])
async def get_all_reproduction_records():
    records = await db.reproduction_records.find().sort("breeding_date", -1).to_list(100)
    return [ReproductionRecord(**record) for record in records]

@api_router.put("/reproduction/{record_id}")
async def update_reproduction_record(record_id: str, offspring_count: int, offspring_ids: List[str]):
    result = await db.reproduction_records.update_one(
        {"id": record_id},
        {
            "$set": {
                "actual_birth_date": datetime.utcnow(),
                "offspring_count": offspring_count,
                "offspring_ids": offspring_ids
            }
        }
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reproduction record not found")
    
    # Mettre à jour le statut de la femelle
    record = await db.reproduction_records.find_one({"id": record_id})
    if record:
        await db.animals.update_one(
            {"id": record["female_id"]}, 
            {"$set": {"reproduction_status": ReproductionStatus.LACTATING.value}}
        )
        
        # Ajouter à l'historique
        history_event = HistoryEvent(
            animal_id=record["female_id"],
            event_type=EventType.BIRTH,
            title="Naissance réussie",
            description=f"{offspring_count} petit(s) né(s)",
            metadata={"offspring_count": offspring_count, "offspring_ids": offspring_ids}
        )
        await db.history.insert_one(history_event.dict())
    
    return {"message": "Birth recorded successfully"}


# NOUVELLES ROUTES HISTORIQUE
@api_router.get("/history/{animal_id}", response_model=List[HistoryEvent])
async def get_animal_history(animal_id: str):
    events = await db.history.find({"animal_id": animal_id}).sort("date", -1).to_list(100)
    return [HistoryEvent(**event) for event in events]

@api_router.get("/history", response_model=List[HistoryEvent])
async def get_all_history():
    events = await db.history.find().sort("date", -1).to_list(200)
    return [HistoryEvent(**event) for event in events]

@api_router.post("/history", response_model=HistoryEvent)
async def create_history_event(event: HistoryEventCreate):
    history_event = HistoryEvent(**event.dict())
    await db.history.insert_one(history_event.dict())
    return history_event


# Routes statistiques (existantes)
@api_router.get("/stats")
async def get_statistics():
    animals = await db.animals.find().to_list(1000)
    
    total_animals = len([a for a in animals if a.get("status", "actif") == "actif"])
    poultry = len([a for a in animals if a.get("type") == "poulet" and a.get("status", "actif") == "actif"])
    pigs = len([a for a in animals if a.get("type") == "porc" and a.get("status", "actif") == "actif"])
    
    # Count by sex
    males = len([a for a in animals if a.get("sex") == "Mâle" and a.get("status", "actif") == "actif"])
    females = len([a for a in animals if a.get("sex") == "Femelle" and a.get("status", "actif") == "actif"])
    
    # Nouvelles statistiques
    pregnant_count = len([a for a in animals if a.get("reproduction_status") == "gestante"])
    medical_records_count = await db.medical_records.count_documents({})
    reproduction_records_count = await db.reproduction_records.count_documents({})
    
    return {
        "total_livestock": total_animals,
        "active_animals": total_animals,
        "poultry": {"count": poultry, "males": len([a for a in animals if a.get("type") == "poulet" and a.get("sex") == "Mâle" and a.get("status", "actif") == "actif"]), "females": len([a for a in animals if a.get("type") == "poulet" and a.get("sex") == "Femelle" and a.get("status", "actif") == "actif"])},
        "pigs": {"count": pigs, "males": len([a for a in animals if a.get("type") == "porc" and a.get("sex") == "Mâle" and a.get("status", "actif") == "actif"]), "females": len([a for a in animals if a.get("type") == "porc" and a.get("sex") == "Femelle" and a.get("status", "actif") == "actif"])},
        "profitability": "3504444 FCFA",
        "males": males,
        "females": females,
        "pregnant_animals": pregnant_count,
        "medical_records": medical_records_count,
        "reproduction_records": reproduction_records_count
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
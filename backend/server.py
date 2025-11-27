"""
FastAPI Backend for CPU Scheduling Simulator
Provides REST API endpoints for scheduling algorithms and energy calculations
Merged from Flask app.py to work with FastAPI and supervisor configuration
"""

from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime, timezone

# Import CPU scheduling algorithms
from algorithms import fcfs, sjf_non_preemptive, sjf_preemptive, round_robin, priority_scheduling
from energy_aware_scheduler import energy_aware_hybrid, calculate_dvfs_energy


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="CPU Scheduling Simulator API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ============================================================================
# Pydantic Models for CPU Scheduling
# ============================================================================

class ProcessInput(BaseModel):
    pid: int
    arrival: int
    burst: int
    priority: Optional[int] = 0

class SchedulerRequest(BaseModel):
    algorithm: str
    processes: List[ProcessInput]
    quantum: Optional[int] = 2
    threshold: Optional[float] = None
    preemptive: Optional[bool] = False

class EnergyRequest(BaseModel):
    gantt: List[Dict[str, Any]]
    context_switches: int

class CompareRequest(BaseModel):
    processes: List[ProcessInput]
    quantum: Optional[int] = 2


# ============================================================================
# Original MongoDB Routes (kept for compatibility)
# ============================================================================

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

@api_router.get("/")
async def root():
    return {"message": "CPU Scheduler API - Ready"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# ============================================================================
# CPU Scheduling API Endpoints (Merged from Flask app.py)
# ============================================================================

@api_router.get('/health')
async def health():
    """Health check endpoint"""
    return {'status': 'healthy', 'service': 'CPU Scheduler API'}


@api_router.post('/run')
async def run_scheduler(request: SchedulerRequest):
    """
    Run selected scheduling algorithm
    
    Request Body:
    {
        "algorithm": "fcfs" | "sjf" | "sjf_preemptive" | "round_robin" | "priority" | "eah",
        "processes": [{"pid": 1, "arrival": 0, "burst": 5, "priority": 1}],
        "quantum": 2 (for Round Robin),
        "threshold": 5 (for EAH)
    }
    """
    try:
        algorithm = request.algorithm.lower()
        processes = [p.dict() for p in request.processes]
        
        if not processes:
            raise HTTPException(status_code=400, detail='No processes provided')
        
        # Validate process data
        for p in processes:
            if 'pid' not in p or 'arrival' not in p or 'burst' not in p:
                raise HTTPException(status_code=400, detail='Invalid process data. Required: pid, arrival, burst')
        
        result = None
        
        if algorithm == 'fcfs':
            result = fcfs(processes)
        elif algorithm == 'sjf' or algorithm == 'sjf_non_preemptive':
            result = sjf_non_preemptive(processes)
        elif algorithm == 'sjf_preemptive' or algorithm == 'srtf':
            result = sjf_preemptive(processes)
        elif algorithm == 'round_robin' or algorithm == 'rr':
            quantum = request.quantum or 2
            result = round_robin(processes, quantum)
        elif algorithm == 'priority':
            preemptive = request.preemptive or False
            result = priority_scheduling(processes, preemptive)
        elif algorithm == 'eah' or algorithm == 'energy_aware_hybrid':
            threshold = request.threshold
            result = energy_aware_hybrid(processes, threshold)
        else:
            raise HTTPException(status_code=400, detail=f'Unknown algorithm: {algorithm}')
        
        return JSONResponse(content=result)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in run_scheduler: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post('/energy')
async def calculate_energy(request: EnergyRequest):
    """
    Calculate DVFS energy consumption for a given gantt chart
    
    Request Body:
    {
        "gantt": [{"process": "P1", "start": 0, "end": 5}],
        "context_switches": 3
    }
    """
    try:
        gantt = request.gantt
        context_switches = request.context_switches
        
        energy_result = calculate_dvfs_energy(gantt, context_switches)
        
        return JSONResponse(content=energy_result)
    
    except Exception as e:
        logger.error(f"Error in calculate_energy: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post('/all')
async def run_all(request: SchedulerRequest):
    """
    Run scheduling algorithm and calculate energy in one call
    
    Request Body: Same as /run endpoint
    """
    try:
        algorithm = request.algorithm.lower()
        processes = [p.dict() for p in request.processes]
        
        if not processes:
            raise HTTPException(status_code=400, detail='No processes provided')
        
        # Run scheduling algorithm
        result = None
        
        if algorithm == 'fcfs':
            result = fcfs(processes)
        elif algorithm == 'sjf' or algorithm == 'sjf_non_preemptive':
            result = sjf_non_preemptive(processes)
        elif algorithm == 'sjf_preemptive' or algorithm == 'srtf':
            result = sjf_preemptive(processes)
        elif algorithm == 'round_robin' or algorithm == 'rr':
            quantum = request.quantum or 2
            result = round_robin(processes, quantum)
        elif algorithm == 'priority':
            preemptive = request.preemptive or False
            result = priority_scheduling(processes, preemptive)
        elif algorithm == 'eah' or algorithm == 'energy_aware_hybrid':
            threshold = request.threshold
            result = energy_aware_hybrid(processes, threshold)
        else:
            raise HTTPException(status_code=400, detail=f'Unknown algorithm: {algorithm}')
        
        # Calculate energy
        energy_result = calculate_dvfs_energy(result['gantt'], result['context_switches'])
        
        # Combine results
        result['energy'] = energy_result
        
        return JSONResponse(content=result)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in run_all: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post('/compare')
async def compare_algorithms(request: CompareRequest):
    """
    Compare all algorithms with the same process set
    
    Request Body:
    {
        "processes": [{"pid": 1, "arrival": 0, "burst": 5, "priority": 1}],
        "quantum": 2
    }
    """
    try:
        processes = [p.dict() for p in request.processes]
        quantum = request.quantum or 2
        
        if not processes:
            raise HTTPException(status_code=400, detail='No processes provided')
        
        results = {}
        
        # Run all algorithms
        algorithms = [
            ('fcfs', lambda: fcfs(processes)),
            ('sjf_non_preemptive', lambda: sjf_non_preemptive(processes)),
            ('sjf_preemptive', lambda: sjf_preemptive(processes)),
            ('round_robin', lambda: round_robin(processes, quantum)),
            ('priority', lambda: priority_scheduling(processes, False)),
            ('eah', lambda: energy_aware_hybrid(processes, None))
        ]
        
        for algo_name, algo_func in algorithms:
            try:
                result = algo_func()
                energy = calculate_dvfs_energy(result['gantt'], result['context_switches'])
                
                results[algo_name] = {
                    'algorithm': result['algorithm'],
                    'avg_turnaround': result['metrics']['avg_turnaround'],
                    'avg_waiting': result['metrics']['avg_waiting'],
                    'context_switches': result['context_switches'],
                    'total_energy': energy['total_energy'],
                    'completion_time': result['metrics']['total_completion']
                }
            except Exception as e:
                results[algo_name] = {'error': str(e)}
        
        return JSONResponse(content=results)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in compare_algorithms: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# Include the router in the main app
app.include_router(api_router)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # Allow all origins for academic project
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

# Log startup
@app.on_event("startup")
async def startup_event():
    logger.info("CPU Scheduling Simulator API started successfully")
    logger.info("Available endpoints: /api/health, /api/run, /api/energy, /api/all, /api/compare")
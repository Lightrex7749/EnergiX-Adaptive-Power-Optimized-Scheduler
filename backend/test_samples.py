"""
Test all sample workloads to see which algorithms win
"""
import requests
import json

API_URL = "http://localhost:8000/api/compare"

samples = {
    "fcfs1": {
        "name": "Sequential Optimal - FCFS Wins",
        "processes": [
            {"pid": 1, "arrival": 0, "burst": 3, "priority": 3},
            {"pid": 2, "arrival": 4, "burst": 5, "priority": 3},
            {"pid": 3, "arrival": 10, "burst": 4, "priority": 3}
        ]
    },
    "sjf1": {
        "name": "Burst Disparity - SJF Wins",
        "processes": [
            {"pid": 1, "arrival": 0, "burst": 25, "priority": 3},
            {"pid": 2, "arrival": 0, "burst": 1, "priority": 3},
            {"pid": 3, "arrival": 0, "burst": 2, "priority": 3},
            {"pid": 4, "arrival": 0, "burst": 18, "priority": 3},
            {"pid": 5, "arrival": 0, "burst": 3, "priority": 3}
        ]
    },
    "srtf1": {
        "name": "Late Short Jobs - SRTF Wins",
        "processes": [
            {"pid": 1, "arrival": 0, "burst": 18, "priority": 3},
            {"pid": 2, "arrival": 2, "burst": 1, "priority": 3},
            {"pid": 3, "arrival": 5, "burst": 1, "priority": 3},
            {"pid": 4, "arrival": 8, "burst": 2, "priority": 3}
        ]
    },
    "rr1": {
        "name": "Interactive Fairness Test",
        "processes": [
            {"pid": 1, "arrival": 0, "burst": 30, "priority": 3},
            {"pid": 2, "arrival": 2, "burst": 4, "priority": 3},
            {"pid": 3, "arrival": 4, "burst": 4, "priority": 3},
            {"pid": 4, "arrival": 6, "burst": 4, "priority": 3},
            {"pid": 5, "arrival": 8, "burst": 4, "priority": 3}
        ]
    },
    "priority1": {
        "name": "Urgent Task Test",
        "processes": [
            {"pid": 1, "arrival": 0, "burst": 15, "priority": 5},
            {"pid": 2, "arrival": 2, "burst": 2, "priority": 1},
            {"pid": 3, "arrival": 0, "burst": 15, "priority": 5},
            {"pid": 4, "arrival": 5, "burst": 2, "priority": 1},
            {"pid": 5, "arrival": 3, "burst": 3, "priority": 2}
        ]
    },
    "eah1": {
        "name": "Energy Optimization Test",
        "processes": [
            {"pid": 1, "arrival": 0, "burst": 1, "priority": 3},
            {"pid": 2, "arrival": 0, "burst": 1, "priority": 3},
            {"pid": 3, "arrival": 0, "burst": 1, "priority": 3},
            {"pid": 4, "arrival": 0, "burst": 25, "priority": 3},
            {"pid": 5, "arrival": 0, "burst": 25, "priority": 3},
            {"pid": 6, "arrival": 0, "burst": 2, "priority": 3}
        ]
    },
    "rr2": {
        "name": "Convoy Effect Test",
        "processes": [
            {"pid": 1, "arrival": 0, "burst": 15, "priority": 3},
            {"pid": 2, "arrival": 0, "burst": 8, "priority": 3},
            {"pid": 3, "arrival": 0, "burst": 6, "priority": 3},
            {"pid": 4, "arrival": 0, "burst": 4, "priority": 3},
            {"pid": 5, "arrival": 0, "burst": 3, "priority": 3}
        ]
    },
    "priority2": {
        "name": "Emergency Response Test",
        "processes": [
            {"pid": 1, "arrival": 0, "burst": 20, "priority": 5},
            {"pid": 2, "arrival": 3, "burst": 1, "priority": 1},
            {"pid": 3, "arrival": 0, "burst": 20, "priority": 5},
            {"pid": 4, "arrival": 7, "burst": 1, "priority": 1},
            {"pid": 5, "arrival": 10, "burst": 2, "priority": 2}
        ]
    },
    "eah2": {
        "name": "Mobile Device Test",
        "processes": [
            {"pid": 1, "arrival": 0, "burst": 1, "priority": 3},
            {"pid": 2, "arrival": 0, "burst": 1, "priority": 3},
            {"pid": 3, "arrival": 0, "burst": 1, "priority": 3},
            {"pid": 4, "arrival": 0, "burst": 1, "priority": 3},
            {"pid": 5, "arrival": 0, "burst": 30, "priority": 3},
            {"pid": 6, "arrival": 0, "burst": 30, "priority": 3},
            {"pid": 7, "arrival": 0, "burst": 2, "priority": 3}
        ]
    }
}

def analyze_results(results):
    """Find which algorithm has best overall score"""
    algos = {}
    
    for algo_key, data in results.items():
        if "error" in data:
            continue
        
        algo_name = data.get("algorithm", algo_key)
        algos[algo_name] = {
            "completion": float(data["completion_time"]),
            "turnaround": float(data["avg_turnaround"]),
            "waiting": float(data["avg_waiting"]),
            "energy": float(data["total_energy"]),
            "switches": int(data["context_switches"])
        }
    
    # Find best for each metric
    best_metrics = {
        "completion": min(algos.items(), key=lambda x: x[1]["completion"]),
        "turnaround": min(algos.items(), key=lambda x: x[1]["turnaround"]),
        "waiting": min(algos.items(), key=lambda x: x[1]["waiting"]),
        "energy": min(algos.items(), key=lambda x: x[1]["energy"]),
        "switches": min(algos.items(), key=lambda x: x[1]["switches"])
    }
    
    # Calculate scores with balanced weights
    weights = {"completion": 0.20, "turnaround": 0.25, "waiting": 0.25, "energy": 0.20, "switches": 0.10}
    
    scores = {}
    for algo_name, metrics in algos.items():
        normalized = {
            "completion": metrics["completion"] / (best_metrics["completion"][1]["completion"] or 1),
            "turnaround": metrics["turnaround"] / (best_metrics["turnaround"][1]["turnaround"] or 1),
            "waiting": metrics["waiting"] / (best_metrics["waiting"][1]["waiting"] or 1),
            "energy": metrics["energy"] / (best_metrics["energy"][1]["energy"] or 1),
            "switches": metrics["switches"] / (best_metrics["switches"][1]["switches"] or 1) if best_metrics["switches"][1]["switches"] > 0 else 1
        }
        
        score = sum(normalized[k] * weights[k] for k in weights.keys())
        scores[algo_name] = score
    
    best_algo = min(scores.items(), key=lambda x: x[1])
    return best_algo[0], scores

print("=" * 80)
print("TESTING ALL SAMPLE WORKLOADS")
print("=" * 80)

for sample_id, sample_data in samples.items():
    print(f"\n📋 Sample: {sample_id} - {sample_data['name']}")
    print(f"   Processes: {len(sample_data['processes'])}")
    
    try:
        response = requests.post(API_URL, json={"processes": sample_data["processes"]})
        
        if response.status_code == 200:
            results = response.json()
            winner, scores = analyze_results(results)
            
            print(f"   🏆 WINNER: {winner}")
            print(f"   📊 Scores:")
            for algo, score in sorted(scores.items(), key=lambda x: x[1]):
                print(f"      {algo:40s}: {score:.3f}")
        else:
            print(f"   ❌ Error: {response.status_code}")
    
    except Exception as e:
        print(f"   ❌ Exception: {e}")

print("\n" + "=" * 80)

"""
Flask Backend for CPU Scheduling Simulator
Provides REST API endpoints for scheduling algorithms and energy calculations
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from algorithms import fcfs, sjf_non_preemptive, sjf_preemptive, round_robin, priority_scheduling
from energy_aware_scheduler import energy_aware_hybrid, calculate_dvfs_energy

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'CPU Scheduler API'})


@app.route('/api/run', methods=['POST'])
def run_scheduler():
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
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        algorithm = data.get('algorithm', '').lower()
        processes = data.get('processes', [])
        
        if not processes:
            return jsonify({'error': 'No processes provided'}), 400
        
        # Validate process data
        for p in processes:
            if 'pid' not in p or 'arrival' not in p or 'burst' not in p:
                return jsonify({'error': 'Invalid process data. Required: pid, arrival, burst'}), 400
        
        result = None
        
        if algorithm == 'fcfs':
            result = fcfs(processes)
        elif algorithm == 'sjf' or algorithm == 'sjf_non_preemptive':
            result = sjf_non_preemptive(processes)
        elif algorithm == 'sjf_preemptive' or algorithm == 'srtf':
            result = sjf_preemptive(processes)
        elif algorithm == 'round_robin' or algorithm == 'rr':
            quantum = data.get('quantum', 2)
            result = round_robin(processes, quantum)
        elif algorithm == 'priority':
            preemptive = data.get('preemptive', False)
            result = priority_scheduling(processes, preemptive)
        elif algorithm == 'eah' or algorithm == 'energy_aware_hybrid':
            threshold = data.get('threshold', None)
            result = energy_aware_hybrid(processes, threshold)
        else:
            return jsonify({'error': f'Unknown algorithm: {algorithm}'}), 400
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/energy', methods=['POST'])
def calculate_energy():
    """
    Calculate DVFS energy consumption for a given gantt chart
    
    Request Body:
    {
        "gantt": [{"process": "P1", "start": 0, "end": 5}],
        "context_switches": 3
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        gantt = data.get('gantt', [])
        context_switches = data.get('context_switches', 0)
        
        energy_result = calculate_dvfs_energy(gantt, context_switches)
        
        return jsonify(energy_result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/all', methods=['POST'])
def run_all():
    """
    Run scheduling algorithm and calculate energy in one call
    
    Request Body: Same as /run endpoint
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        algorithm = data.get('algorithm', '').lower()
        processes = data.get('processes', [])
        
        if not processes:
            return jsonify({'error': 'No processes provided'}), 400
        
        # Run scheduling algorithm
        result = None
        
        if algorithm == 'fcfs':
            result = fcfs(processes)
        elif algorithm == 'sjf' or algorithm == 'sjf_non_preemptive':
            result = sjf_non_preemptive(processes)
        elif algorithm == 'sjf_preemptive' or algorithm == 'srtf':
            result = sjf_preemptive(processes)
        elif algorithm == 'round_robin' or algorithm == 'rr':
            quantum = data.get('quantum', 2)
            result = round_robin(processes, quantum)
        elif algorithm == 'priority':
            preemptive = data.get('preemptive', False)
            result = priority_scheduling(processes, preemptive)
        elif algorithm == 'eah' or algorithm == 'energy_aware_hybrid':
            threshold = data.get('threshold', None)
            result = energy_aware_hybrid(processes, threshold)
        else:
            return jsonify({'error': f'Unknown algorithm: {algorithm}'}), 400
        
        # Calculate energy
        energy_result = calculate_dvfs_energy(result['gantt'], result['context_switches'])
        
        # Combine results
        result['energy'] = energy_result
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/compare', methods=['POST'])
def compare_algorithms():
    """
    Compare all algorithms with the same process set
    
    Request Body:
    {
        "processes": [{"pid": 1, "arrival": 0, "burst": 5, "priority": 1}],
        "quantum": 2
    }
    """
    try:
        data = request.get_json()
        processes = data.get('processes', [])
        quantum = data.get('quantum', 2)
        
        if not processes:
            return jsonify({'error': 'No processes provided'}), 400
        
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
        
        return jsonify(results)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)

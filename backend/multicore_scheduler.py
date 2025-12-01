"""
Multi-Core CPU Scheduling Simulation
Implements parallel execution of processes across multiple CPU cores
"""

import copy
from typing import List, Dict, Any, Tuple
from algorithms import Process


def multicore_schedule(processes_input: List[Dict], num_cores: int, algorithm: str, quantum: int = 2, threshold: float = None) -> Dict[str, Any]:
    """
    Simulate multi-core CPU scheduling
    
    Args:
        processes_input: List of process dictionaries
        num_cores: Number of CPU cores (2, 4, or 8)
        algorithm: Base scheduling algorithm to use per core
        quantum: Time quantum for Round Robin
        threshold: Task threshold for EAH
    
    Returns:
        Dictionary with multi-core scheduling results
    """
    processes = [Process(p['pid'], p['arrival'], p['burst'], p.get('priority', 0)) 
                 for p in processes_input]
    
    # Initialize cores
    cores = []
    for i in range(num_cores):
        cores.append({
            'id': i,
            'current_process': None,
            'timeline': [],
            'gantt': [],
            'busy_until': 0,
            'total_busy_time': 0,
            'processes_completed': 0
        })
    
    # Global ready queue
    ready_queue = []
    completed = []
    current_time = 0
    context_switches = 0
    
    # Sort processes by arrival time
    processes.sort(key=lambda x: (x.arrival, x.pid))
    process_index = 0
    
    # Simulation loop
    max_time = sum(p.burst for p in processes) + max(p.arrival for p in processes) + 100
    
    while len(completed) < len(processes) and current_time < max_time:
        # Add arriving processes to ready queue
        while process_index < len(processes) and processes[process_index].arrival <= current_time:
            ready_queue.append(processes[process_index])
            process_index += 1
        
        # Assign processes to available cores
        for core in cores:
            if core['current_process'] is None and ready_queue:
                # Find next process based on algorithm
                next_process = select_next_process(ready_queue, algorithm, current_time)
                
                if next_process:
                    ready_queue.remove(next_process)
                    core['current_process'] = next_process
                    
                    if next_process.start_time == -1:
                        next_process.start_time = current_time
                    
                    # Determine execution time
                    if algorithm == 'round_robin':
                        exec_time = min(quantum, next_process.remaining)
                    else:
                        exec_time = next_process.remaining
                    
                    core['busy_until'] = current_time + exec_time
                    context_switches += 1
        
        # Find next event time (when a core finishes)
        next_event_time = float('inf')
        for core in cores:
            if core['current_process'] is not None:
                next_event_time = min(next_event_time, core['busy_until'])
        
        # If no cores are busy, advance to next arrival
        if next_event_time == float('inf'):
            if process_index < len(processes):
                current_time = processes[process_index].arrival
                continue
            else:
                break
        
        # Advance time to next event
        time_advance = next_event_time - current_time
        current_time = next_event_time
        
        # Process completed cores
        for core in cores:
            if core['current_process'] is not None and core['busy_until'] <= current_time:
                proc = core['current_process']
                
                # Determine how much was executed
                if algorithm == 'round_robin':
                    exec_time = min(quantum, proc.remaining)
                else:
                    exec_time = proc.remaining
                
                # Update process
                proc.remaining -= exec_time
                core['total_busy_time'] += exec_time
                
                # Add to core's gantt chart
                core['gantt'].append({
                    'process': f'P{proc.pid}',
                    'start': core['busy_until'] - exec_time,
                    'end': core['busy_until'],
                    'core': core['id']
                })
                
                # Check if process completed
                if proc.remaining <= 0:
                    proc.completion = current_time
                    proc.turnaround = proc.completion - proc.arrival
                    proc.waiting = proc.turnaround - proc.burst
                    completed.append(proc)
                    core['processes_completed'] += 1
                    core['current_process'] = None
                else:
                    # Process not finished, return to queue (Round Robin)
                    if algorithm == 'round_robin':
                        ready_queue.append(proc)
                    core['current_process'] = None
    
    # Calculate metrics
    total_tat = sum(p.turnaround for p in completed)
    total_wt = sum(p.waiting for p in completed)
    n = len(completed)
    
    # Combine all gantt charts
    combined_gantt = []
    for core in cores:
        combined_gantt.extend(core['gantt'])
    
    # Sort by start time for display
    combined_gantt.sort(key=lambda x: x['start'])
    
    # Calculate core utilization
    total_time = current_time
    core_utilizations = []
    for core in cores:
        utilization = (core['total_busy_time'] / total_time * 100) if total_time > 0 else 0
        core_utilizations.append({
            'core_id': core['id'],
            'utilization': round(utilization, 2),
            'busy_time': core['total_busy_time'],
            'processes_completed': core['processes_completed']
        })
    
    # Calculate load balance (standard deviation of core utilizations)
    avg_util = sum(c['utilization'] for c in core_utilizations) / len(core_utilizations)
    variance = sum((c['utilization'] - avg_util) ** 2 for c in core_utilizations) / len(core_utilizations)
    load_balance_score = round(100 - (variance ** 0.5), 2)  # Higher is better
    
    return {
        'algorithm': f'{algorithm.upper()} (Multi-Core)',
        'num_cores': num_cores,
        'processes': [
            {
                'pid': p.pid,
                'arrival': p.arrival,
                'burst': p.burst,
                'completion': p.completion,
                'turnaround': p.turnaround,
                'waiting': p.waiting,
                'start_time': p.start_time
            }
            for p in completed
        ],
        'metrics': {
            'avg_turnaround': round(total_tat / n, 2) if n > 0 else 0,
            'avg_waiting': round(total_wt / n, 2) if n > 0 else 0,
            'total_completion': current_time
        },
        'gantt': combined_gantt,
        'per_core_gantt': [core['gantt'] for core in cores],
        'context_switches': context_switches,
        'core_utilizations': core_utilizations,
        'load_balance_score': load_balance_score,
        'avg_core_utilization': round(avg_util, 2),
        'speedup': calculate_speedup(processes_input, current_time, algorithm, quantum, threshold)
    }


def select_next_process(ready_queue: List[Process], algorithm: str, current_time: int) -> Process:
    """
    Select next process from ready queue based on algorithm
    """
    if not ready_queue:
        return None
    
    if algorithm == 'fcfs':
        # First in queue
        return ready_queue[0]
    
    elif algorithm == 'sjf' or algorithm == 'sjf_non_preemptive':
        # Shortest remaining time
        return min(ready_queue, key=lambda p: (p.remaining, p.pid))
    
    elif algorithm == 'sjf_preemptive' or algorithm == 'srtf':
        # Shortest remaining time (preemptive)
        return min(ready_queue, key=lambda p: (p.remaining, p.pid))
    
    elif algorithm == 'round_robin':
        # FIFO for round robin
        return ready_queue[0]
    
    elif algorithm == 'priority':
        # Highest priority (lower number = higher priority)
        return min(ready_queue, key=lambda p: (p.priority, p.arrival, p.pid))
    
    elif algorithm == 'eah':
        # Shortest job first for EAH in multi-core
        return min(ready_queue, key=lambda p: (p.remaining, p.pid))
    
    else:
        return ready_queue[0]


def calculate_speedup(processes_input: List[Dict], multicore_time: int, algorithm: str, quantum: int, threshold: float) -> float:
    """
    Calculate speedup compared to single-core execution
    Speedup = Single-Core Time / Multi-Core Time
    """
    # Import single-core algorithms
    from algorithms import fcfs, sjf_non_preemptive, sjf_preemptive, round_robin, priority_scheduling
    from energy_aware_scheduler import energy_aware_hybrid
    
    try:
        # Run single-core version
        if algorithm == 'fcfs':
            result = fcfs(processes_input)
        elif algorithm == 'sjf' or algorithm == 'sjf_non_preemptive':
            result = sjf_non_preemptive(processes_input)
        elif algorithm == 'sjf_preemptive' or algorithm == 'srtf':
            result = sjf_preemptive(processes_input)
        elif algorithm == 'round_robin':
            result = round_robin(processes_input, quantum)
        elif algorithm == 'priority':
            result = priority_scheduling(processes_input, False)
        elif algorithm == 'eah':
            result = energy_aware_hybrid(processes_input, threshold)
        else:
            return 1.0
        
        single_core_time = result['metrics']['total_completion']
        speedup = single_core_time / multicore_time if multicore_time > 0 else 1.0
        return round(speedup, 2)
    
    except:
        return 1.0

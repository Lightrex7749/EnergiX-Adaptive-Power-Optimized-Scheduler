"""
Energy-Aware Hybrid (EAH) Scheduling Algorithm
Classifies tasks into short/long and applies optimal scheduling
Integrated with Adaptive DVFS for energy efficiency
"""

import copy
from typing import List, Dict, Any
import math

class Process:
    def __init__(self, pid: int, arrival: int, burst: int, priority: int = 0):
        self.pid = pid
        self.arrival = arrival
        self.burst = burst
        self.remaining = burst
        self.priority = priority
        self.completion = 0
        self.turnaround = 0
        self.waiting = 0
        self.start_time = -1
        self.classification = "short"  # short or long


def classify_tasks(processes: List[Process], threshold: float = None) -> None:
    """Classify tasks into short and long based on burst time"""
    if threshold is None:
        bursts = [p.burst for p in processes]
        avg_burst = sum(bursts) / len(bursts)
        threshold = avg_burst
    
    for p in processes:
        if p.burst <= threshold:
            p.classification = "short"
        else:
            p.classification = "long"


def energy_aware_hybrid(processes_input: List[Dict], threshold: float = None) -> Dict[str, Any]:
    """
    Energy-Aware Hybrid (EAH) Algorithm
    
    Classification:
    - Short tasks: burst <= threshold → SJF (non-preemptive)
    - Long tasks: burst > threshold → FCFS
    
    Benefits:
    - Minimizes context switches (energy efficient)
    - Short tasks complete quickly (good response time)
    - Long tasks avoid starvation (fairness)
    - Compatible with DVFS for dynamic frequency scaling
    """
    processes = [Process(p['pid'], p['arrival'], p['burst'], p.get('priority', 0)) 
                 for p in processes_input]
    
    # Auto-calculate threshold if not provided
    if threshold is None:
        bursts = [p.burst for p in processes]
        threshold = sum(bursts) / len(bursts)
    
    # Classify tasks
    classify_tasks(processes, threshold)
    
    timeline = []
    gantt = []
    current_time = 0
    completed = []
    short_queue = []
    long_queue = []
    context_switches = 0
    last_process = None
    remaining_processes = sorted(processes, key=lambda x: x.arrival)
    
    max_time = max(p.arrival + p.burst for p in processes) + 100
    
    while len(completed) < len(processes) and current_time < max_time:
        # Add arrived processes to appropriate queues
        while remaining_processes and remaining_processes[0].arrival <= current_time:
            p = remaining_processes.pop(0)
            if p.classification == "short":
                short_queue.append(p)
            else:
                long_queue.append(p)
        
        # Priority: Short tasks first (SJF), then long tasks (FCFS)
        process = None
        
        if short_queue:
            # SJF for short tasks
            short_queue.sort(key=lambda x: (x.burst, x.arrival, x.pid))
            process = short_queue.pop(0)
        elif long_queue:
            # FCFS for long tasks
            long_queue.sort(key=lambda x: (x.arrival, x.pid))
            process = long_queue.pop(0)
        else:
            # Idle time
            if remaining_processes:
                next_arrival = remaining_processes[0].arrival
                if gantt and gantt[-1]['process'] == 'IDLE':
                    gantt[-1]['end'] = next_arrival
                else:
                    gantt.append({'process': 'IDLE', 'start': current_time, 'end': next_arrival})
                current_time = next_arrival
            continue
        
        # Context switch detection
        if last_process and last_process != process.pid:
            context_switches += 1
        
        # Execute process (non-preemptive)
        process.start_time = current_time
        start = current_time
        current_time += process.burst
        process.completion = current_time
        process.turnaround = process.completion - process.arrival
        process.waiting = process.turnaround - process.burst
        
        gantt.append({
            'process': f'P{process.pid}',
            'start': start,
            'end': current_time,
            'classification': process.classification
        })
        
        timeline.append({
            'time': current_time,
            'process': process.pid,
            'event': 'completion',
            'classification': process.classification
        })
        
        completed.append(process)
        last_process = process.pid
    
    # Calculate metrics
    total_tat = sum(p.turnaround for p in completed)
    total_wt = sum(p.waiting for p in completed)
    n = len(completed)
    
    short_tasks = [p for p in completed if p.classification == "short"]
    long_tasks = [p for p in completed if p.classification == "long"]
    
    metrics = {
        'avg_turnaround': round(total_tat / n, 2) if n > 0 else 0,
        'avg_waiting': round(total_wt / n, 2) if n > 0 else 0,
        'total_completion': max(p.completion for p in completed) if completed else 0,
        'threshold': round(threshold, 2),
        'short_tasks_count': len(short_tasks),
        'long_tasks_count': len(long_tasks)
    }
    
    return {
        'algorithm': 'Energy-Aware Hybrid (EAH)',
        'timeline': timeline,
        'gantt': gantt,
        'context_switches': context_switches,
        'classification_threshold': round(threshold, 2),
        'processes': [{
            'pid': p.pid,
            'arrival': p.arrival,
            'burst': p.burst,
            'classification': p.classification,
            'completion': p.completion,
            'turnaround': p.turnaround,
            'waiting': p.waiting
        } for p in completed],
        'metrics': metrics
    }


def calculate_dvfs_energy(gantt: List[Dict], context_switches: int) -> Dict[str, Any]:
    """
    Calculate energy consumption using Adaptive DVFS
    
    CPU States:
    - HIGH: freq=1.0, power=5.0 * freq (high utilization > 0.6)
    - MED: freq=0.7, power=3.0 * freq (medium utilization 0.2-0.6)
    - LOW: freq=0.4, power=1.5 * freq (low utilization < 0.2)
    - IDLE: power=0.2 (no process running)
    
    Features:
    - Sliding window utilization (window size=3)
    - Hysteresis=1 to prevent rapid switching
    - Context switch penalty=0.5 energy units
    """
    
    # Energy parameters
    FREQ_HIGH = 1.0
    FREQ_MED = 0.7
    FREQ_LOW = 0.4
    
    POWER_HIGH = 5.0 * FREQ_HIGH  # 5.0
    POWER_MED = 3.0 * FREQ_MED    # 2.1
    POWER_LOW = 1.5 * FREQ_LOW    # 0.6
    POWER_IDLE = 0.2
    
    CONTEXT_SWITCH_PENALTY = 0.5
    
    UTIL_THRESHOLD_HIGH = 0.6
    UTIL_THRESHOLD_LOW = 0.2
    WINDOW_SIZE = 3
    HYSTERESIS = 1
    
    if not gantt:
        return {
            'total_energy': 0,
            'busy_energy': 0,
            'idle_energy': 0,
            'context_switch_energy': 0,
            'power_timeline': [],
            'frequency_timeline': []
        }
    
    # Calculate utilization per time unit
    max_time = max(segment['end'] for segment in gantt)
    utilization_history = []
    
    for t in range(max_time):
        is_busy = any(seg['start'] <= t < seg['end'] and seg['process'] != 'IDLE' 
                     for seg in gantt)
        utilization_history.append(1.0 if is_busy else 0.0)
    
    # Adaptive DVFS with sliding window
    power_timeline = []
    frequency_timeline = []
    total_energy = 0
    busy_energy = 0
    idle_energy = 0
    current_state = 'MED'
    state_duration = 0
    
    for t in range(max_time):
        # Calculate sliding window utilization
        window_start = max(0, t - WINDOW_SIZE + 1)
        window_util = sum(utilization_history[window_start:t+1]) / min(WINDOW_SIZE, t+1)
        
        # Determine target state with hysteresis
        if window_util > UTIL_THRESHOLD_HIGH:
            target_state = 'HIGH'
        elif window_util < UTIL_THRESHOLD_LOW:
            target_state = 'LOW'
        else:
            target_state = 'MED'
        
        # Apply hysteresis
        if state_duration >= HYSTERESIS or current_state == target_state:
            current_state = target_state
            state_duration = 0
        else:
            state_duration += 1
        
        # Get current segment
        current_segment = None
        for seg in gantt:
            if seg['start'] <= t < seg['end']:
                current_segment = seg
                break
        
        # Calculate power and energy
        if current_segment and current_segment['process'] != 'IDLE':
            if current_state == 'HIGH':
                power = POWER_HIGH
                freq = FREQ_HIGH
            elif current_state == 'MED':
                power = POWER_MED
                freq = FREQ_MED
            else:
                power = POWER_LOW
                freq = FREQ_LOW
            
            busy_energy += power
        else:
            power = POWER_IDLE
            freq = 0.0
            idle_energy += power
        
        total_energy += power
        
        power_timeline.append({
            'time': t,
            'power': round(power, 2),
            'state': current_state if current_segment and current_segment['process'] != 'IDLE' else 'IDLE',
            'utilization': round(window_util, 2)
        })
        
        frequency_timeline.append({
            'time': t,
            'frequency': round(freq, 2),
            'state': current_state if current_segment and current_segment['process'] != 'IDLE' else 'IDLE'
        })
    
    # Add context switch penalty
    context_switch_energy = context_switches * CONTEXT_SWITCH_PENALTY
    total_energy += context_switch_energy
    
    return {
        'total_energy': round(total_energy, 2),
        'busy_energy': round(busy_energy, 2),
        'idle_energy': round(idle_energy, 2),
        'context_switch_energy': round(context_switch_energy, 2),
        'power_timeline': power_timeline,
        'frequency_timeline': frequency_timeline,
        'avg_power': round(total_energy / max_time, 2) if max_time > 0 else 0,
        'parameters': {
            'freq_high': FREQ_HIGH,
            'freq_med': FREQ_MED,
            'freq_low': FREQ_LOW,
            'power_high': POWER_HIGH,
            'power_med': POWER_MED,
            'power_low': POWER_LOW,
            'power_idle': POWER_IDLE,
            'context_switch_penalty': CONTEXT_SWITCH_PENALTY,
            'util_threshold_high': UTIL_THRESHOLD_HIGH,
            'util_threshold_low': UTIL_THRESHOLD_LOW,
            'window_size': WINDOW_SIZE,
            'hysteresis': HYSTERESIS
        }
    }

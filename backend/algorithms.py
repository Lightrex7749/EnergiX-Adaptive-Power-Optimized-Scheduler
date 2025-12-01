"""
CPU Scheduling Algorithms Implementation
Supports: FCFS, SJF (Non-Preemptive & Preemptive), Round Robin, Priority Scheduling
"""

import copy
from typing import List, Dict, Any

class Process:
    """Process class to represent a CPU process"""
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

    def __repr__(self):
        return f"P{self.pid}(A:{self.arrival}, B:{self.burst}, P:{self.priority})"


def calculate_metrics(processes: List[Process]) -> Dict[str, Any]:
    """Calculate scheduling metrics"""
    total_tat = sum(p.turnaround for p in processes)
    total_wt = sum(p.waiting for p in processes)
    n = len(processes)
    
    return {
        'avg_turnaround': round(total_tat / n, 2) if n > 0 else 0,
        'avg_waiting': round(total_wt / n, 2) if n > 0 else 0,
        'total_completion': max(p.completion for p in processes) if processes else 0
    }


def fcfs(processes_input: List[Dict]) -> Dict[str, Any]:
    """First Come First Serve Scheduling"""
    processes = [Process(p['pid'], p['arrival'], p['burst'], p.get('priority', 0)) 
                 for p in processes_input]
    processes.sort(key=lambda x: (x.arrival, x.pid))
    
    timeline = []
    gantt = []
    current_time = 0
    context_switches = 0
    
    for i, process in enumerate(processes):
        # Handle idle time
        if current_time < process.arrival:
            if gantt and gantt[-1]['process'] == 'IDLE':
                gantt[-1]['end'] = process.arrival
            else:
                gantt.append({'process': 'IDLE', 'start': current_time, 'end': process.arrival})
            current_time = process.arrival
        
        # Process execution
        process.start_time = current_time
        start = current_time
        current_time += process.burst
        process.completion = current_time
        process.turnaround = process.completion - process.arrival
        process.waiting = process.turnaround - process.burst
        
        gantt.append({
            'process': f'P{process.pid}',
            'start': start,
            'end': current_time
        })
        
        timeline.append({
            'time': current_time,
            'process': process.pid,
            'event': 'completion'
        })
        
        if i > 0:
            context_switches += 1
    
    metrics = calculate_metrics(processes)
    
    return {
        'algorithm': 'FCFS',
        'timeline': timeline,
        'gantt': gantt,
        'context_switches': context_switches,
        'processes': [{
            'pid': p.pid,
            'arrival': p.arrival,
            'burst': p.burst,
            'completion': p.completion,
            'turnaround': p.turnaround,
            'waiting': p.waiting
        } for p in processes],
        'metrics': metrics
    }


def sjf_non_preemptive(processes_input: List[Dict]) -> Dict[str, Any]:
    """Shortest Job First (Non-Preemptive) Scheduling"""
    processes = [Process(p['pid'], p['arrival'], p['burst'], p.get('priority', 0)) 
                 for p in processes_input]
    
    timeline = []
    gantt = []
    current_time = 0
    completed = []
    ready_queue = []
    context_switches = 0
    remaining_processes = sorted(processes, key=lambda x: x.arrival)
    
    while len(completed) < len(processes):
        # Add arrived processes to ready queue
        while remaining_processes and remaining_processes[0].arrival <= current_time:
            ready_queue.append(remaining_processes.pop(0))
        
        if not ready_queue:
            # Idle time - jump to next arrival
            if remaining_processes:
                next_arrival = remaining_processes[0].arrival
                if gantt and gantt[-1]['process'] == 'IDLE':
                    gantt[-1]['end'] = next_arrival
                else:
                    gantt.append({'process': 'IDLE', 'start': current_time, 'end': next_arrival})
                current_time = next_arrival
            continue
        
        # Select process with shortest burst
        ready_queue.sort(key=lambda x: (x.burst, x.arrival, x.pid))
        process = ready_queue.pop(0)
        
        # Execute process
        process.start_time = current_time
        start = current_time
        current_time += process.burst
        process.completion = current_time
        process.turnaround = process.completion - process.arrival
        process.waiting = process.turnaround - process.burst
        
        gantt.append({
            'process': f'P{process.pid}',
            'start': start,
            'end': current_time
        })
        
        timeline.append({
            'time': current_time,
            'process': process.pid,
            'event': 'completion'
        })
        
        completed.append(process)
        if len(completed) > 1:
            context_switches += 1
    
    metrics = calculate_metrics(completed)
    
    return {
        'algorithm': 'SJF Non-Preemptive',
        'timeline': timeline,
        'gantt': gantt,
        'context_switches': context_switches,
        'processes': [{
            'pid': p.pid,
            'arrival': p.arrival,
            'burst': p.burst,
            'completion': p.completion,
            'turnaround': p.turnaround,
            'waiting': p.waiting
        } for p in completed],
        'metrics': metrics
    }


def sjf_preemptive(processes_input: List[Dict]) -> Dict[str, Any]:
    """Shortest Job First (Preemptive/SRTF) Scheduling"""
    processes = [Process(p['pid'], p['arrival'], p['burst'], p.get('priority', 0)) 
                 for p in processes_input]
    
    timeline = []
    gantt = []
    current_time = 0
    completed = []
    ready_queue = []
    context_switches = 0
    last_process = None
    remaining_processes = sorted(processes, key=lambda x: x.arrival)
    
    max_time = max(p.arrival + p.burst for p in processes) + 100
    
    while len(completed) < len(processes) and current_time < max_time:
        # Add arrived processes to ready queue
        while remaining_processes and remaining_processes[0].arrival <= current_time:
            ready_queue.append(remaining_processes.pop(0))
        
        if not ready_queue:
            # Idle time
            if remaining_processes:
                next_arrival = remaining_processes[0].arrival
                if gantt and gantt[-1]['process'] == 'IDLE':
                    gantt[-1]['end'] = next_arrival
                else:
                    gantt.append({'process': 'IDLE', 'start': current_time, 'end': next_arrival})
                current_time = next_arrival
            continue
        
        # Select process with shortest remaining time
        ready_queue.sort(key=lambda x: (x.remaining, x.arrival, x.pid))
        process = ready_queue[0]
        
        if process.start_time == -1:
            process.start_time = current_time
        
        # Context switch detection
        if last_process and last_process != process.pid:
            context_switches += 1
        
        # Execute for 1 time unit
        start = current_time
        process.remaining -= 1
        current_time += 1
        
        # Add to gantt chart
        if gantt and gantt[-1]['process'] == f'P{process.pid}':
            gantt[-1]['end'] = current_time
        else:
            gantt.append({
                'process': f'P{process.pid}',
                'start': start,
                'end': current_time
            })
        
        last_process = process.pid
        
        # Check if process completed
        if process.remaining == 0:
            process.completion = current_time
            process.turnaround = process.completion - process.arrival
            process.waiting = process.turnaround - process.burst
            completed.append(process)
            ready_queue.remove(process)
            
            timeline.append({
                'time': current_time,
                'process': process.pid,
                'event': 'completion'
            })
    
    metrics = calculate_metrics(completed)
    
    return {
        'algorithm': 'SJF Preemptive (SRTF)',
        'timeline': timeline,
        'gantt': gantt,
        'context_switches': context_switches,
        'processes': [{
            'pid': p.pid,
            'arrival': p.arrival,
            'burst': p.burst,
            'completion': p.completion,
            'turnaround': p.turnaround,
            'waiting': p.waiting
        } for p in completed],
        'metrics': metrics
    }


def round_robin(processes_input: List[Dict], quantum: int = 2) -> Dict[str, Any]:
    """Round Robin Scheduling"""
    processes = [Process(p['pid'], p['arrival'], p['burst'], p.get('priority', 0)) 
                 for p in processes_input]
    
    timeline = []
    gantt = []
    current_time = 0
    completed = []
    ready_queue = []
    context_switches = 0
    last_process = None
    remaining_processes = sorted(processes, key=lambda x: x.arrival)
    
    max_time = max(p.arrival + p.burst for p in processes) * 10
    
    while len(completed) < len(processes) and current_time < max_time:
        # Add arrived processes to ready queue
        arrived = []
        while remaining_processes and remaining_processes[0].arrival <= current_time:
            arrived.append(remaining_processes.pop(0))
        ready_queue.extend(arrived)
        
        if not ready_queue:
            # Idle time
            if remaining_processes:
                next_arrival = remaining_processes[0].arrival
                if gantt and gantt[-1]['process'] == 'IDLE':
                    gantt[-1]['end'] = next_arrival
                else:
                    gantt.append({'process': 'IDLE', 'start': current_time, 'end': next_arrival})
                current_time = next_arrival
            continue
        
        process = ready_queue.pop(0)
        
        if process.start_time == -1:
            process.start_time = current_time
        
        # Context switch detection
        if last_process and last_process != process.pid:
            context_switches += 1
        
        # Execute for quantum or remaining time
        execution_time = min(quantum, process.remaining)
        start = current_time
        process.remaining -= execution_time
        current_time += execution_time
        
        gantt.append({
            'process': f'P{process.pid}',
            'start': start,
            'end': current_time
        })
        
        last_process = process.pid
        
        # Add newly arrived processes before re-queuing
        while remaining_processes and remaining_processes[0].arrival <= current_time:
            ready_queue.append(remaining_processes.pop(0))
        
        # Check if process completed
        if process.remaining == 0:
            process.completion = current_time
            process.turnaround = process.completion - process.arrival
            process.waiting = process.turnaround - process.burst
            completed.append(process)
            
            timeline.append({
                'time': current_time,
                'process': process.pid,
                'event': 'completion'
            })
        else:
            # Re-add to queue
            ready_queue.append(process)
    
    metrics = calculate_metrics(completed)
    
    return {
        'algorithm': f'Round Robin (Quantum={quantum})',
        'timeline': timeline,
        'gantt': gantt,
        'context_switches': context_switches,
        'quantum': quantum,
        'processes': [{
            'pid': p.pid,
            'arrival': p.arrival,
            'burst': p.burst,
            'completion': p.completion,
            'turnaround': p.turnaround,
            'waiting': p.waiting
        } for p in completed],
        'metrics': metrics
    }


def priority_scheduling(processes_input: List[Dict], preemptive: bool = False) -> Dict[str, Any]:
    """Priority Scheduling (Lower number = Higher priority)"""
    processes = [Process(p['pid'], p['arrival'], p['burst'], p.get('priority', 0)) 
                 for p in processes_input]
    
    timeline = []
    gantt = []
    current_time = 0
    completed = []
    ready_queue = []
    context_switches = 0
    last_process = None
    remaining_processes = sorted(processes, key=lambda x: x.arrival)
    
    max_time = max(p.arrival + p.burst for p in processes) + 100
    
    if not preemptive:
        # Non-preemptive priority scheduling
        while len(completed) < len(processes) and current_time < max_time:
            # Add arrived processes
            while remaining_processes and remaining_processes[0].arrival <= current_time:
                ready_queue.append(remaining_processes.pop(0))
            
            if not ready_queue:
                if remaining_processes:
                    next_arrival = remaining_processes[0].arrival
                    if gantt and gantt[-1]['process'] == 'IDLE':
                        gantt[-1]['end'] = next_arrival
                    else:
                        gantt.append({'process': 'IDLE', 'start': current_time, 'end': next_arrival})
                    current_time = next_arrival
                continue
            
            # Select highest priority (lowest number)
            ready_queue.sort(key=lambda x: (x.priority, x.arrival, x.pid))
            process = ready_queue.pop(0)
            
            if last_process and last_process != process.pid:
                context_switches += 1
            
            process.start_time = current_time
            start = current_time
            current_time += process.burst
            process.completion = current_time
            process.turnaround = process.completion - process.arrival
            process.waiting = process.turnaround - process.burst
            
            gantt.append({
                'process': f'P{process.pid}',
                'start': start,
                'end': current_time
            })
            
            timeline.append({
                'time': current_time,
                'process': process.pid,
                'event': 'completion'
            })
            
            completed.append(process)
            last_process = process.pid
    else:
        # Preemptive priority scheduling
        while len(completed) < len(processes) and current_time < max_time:
            while remaining_processes and remaining_processes[0].arrival <= current_time:
                ready_queue.append(remaining_processes.pop(0))
            
            if not ready_queue:
                if remaining_processes:
                    next_arrival = remaining_processes[0].arrival
                    if gantt and gantt[-1]['process'] == 'IDLE':
                        gantt[-1]['end'] = next_arrival
                    else:
                        gantt.append({'process': 'IDLE', 'start': current_time, 'end': next_arrival})
                    current_time = next_arrival
                continue
            
            ready_queue.sort(key=lambda x: (x.priority, x.arrival, x.pid))
            process = ready_queue[0]
            
            if process.start_time == -1:
                process.start_time = current_time
            
            if last_process and last_process != process.pid:
                context_switches += 1
            
            start = current_time
            process.remaining -= 1
            current_time += 1
            
            if gantt and gantt[-1]['process'] == f'P{process.pid}':
                gantt[-1]['end'] = current_time
            else:
                gantt.append({
                    'process': f'P{process.pid}',
                    'start': start,
                    'end': current_time
                })
            
            last_process = process.pid
            
            if process.remaining == 0:
                process.completion = current_time
                process.turnaround = process.completion - process.arrival
                process.waiting = process.turnaround - process.burst
                completed.append(process)
                ready_queue.remove(process)
                
                timeline.append({
                    'time': current_time,
                    'process': process.pid,
                    'event': 'completion'
                })
    
    metrics = calculate_metrics(completed)
    
    return {
        'algorithm': f'Priority Scheduling ({"Preemptive" if preemptive else "Non-Preemptive"})',
        'timeline': timeline,
        'gantt': gantt,
        'context_switches': context_switches,
        'processes': [{
            'pid': p.pid,
            'arrival': p.arrival,
            'burst': p.burst,
            'priority': p.priority,
            'completion': p.completion,
            'turnaround': p.turnaround,
            'waiting': p.waiting
        } for p in completed],
        'metrics': metrics
    }


def calculate_advanced_metrics(result: Dict[str, Any], processes_input: List[Dict]) -> Dict[str, Any]:
    """
    Calculate advanced performance metrics:
    - CPU Utilization: (Total burst time / Total completion time) * 100
    - Throughput: Number of processes / Total completion time
    - Response Time: Time from arrival to first execution
    - Fairness Index (Jain's Fairness Index): For turnaround times
    """
    gantt = result.get('gantt', [])
    processes = result.get('processes', [])
    completion_time = result.get('metrics', {}).get('total_completion', 0)
    
    if not processes or completion_time == 0:
        return {
            'cpu_utilization': 0,
            'throughput': 0,
            'avg_response_time': 0,
            'fairness_index': 0
        }
    
    # CPU Utilization - use original input for burst times
    total_burst = sum(p.get('burst', 0) for p in processes_input)
    cpu_utilization = round((total_burst / completion_time) * 100, 2) if completion_time > 0 else 0
    
    # Throughput (processes per time unit)
    throughput = round(len(processes) / completion_time, 4) if completion_time > 0 else 0
    
    # Response Time (time from arrival to first execution)
    response_times = []
    for p in processes:
        pid = p.get('pid')
        arrival = p.get('arrival', 0)
        # Find first execution time from gantt
        first_exec = next((g['start'] for g in gantt if g.get('pid') == pid), arrival)
        response_time = first_exec - arrival
        response_times.append(response_time)
    
    avg_response_time = round(sum(response_times) / len(response_times), 2) if response_times else 0
    
    # Fairness Index (Jain's Fairness Index for turnaround times)
    # Formula: (sum of x_i)^2 / (n * sum of x_i^2)
    # Where x_i is the turnaround time of process i
    turnaround_times = [p.get('turnaround', 0) for p in processes]
    sum_tat = sum(turnaround_times)
    sum_tat_sq = sum(t * t for t in turnaround_times)
    n = len(turnaround_times)
    
    fairness_index = round((sum_tat ** 2) / (n * sum_tat_sq), 4) if sum_tat_sq > 0 else 1.0
    
    return {
        'cpu_utilization': cpu_utilization,
        'throughput': throughput,
        'avg_response_time': avg_response_time,
        'fairness_index': fairness_index
    }

#!/usr/bin/env python3
"""
System Process Importer
Captures running system processes and exports them in a format compatible with the scheduler simulator.

Usage:
    python process_importer.py [--output FILE] [--limit N] [--filter KEYWORD]
    
Examples:
    python process_importer.py                          # Print to console
    python process_importer.py --output processes.json  # Save to JSON file
    python process_importer.py --limit 10               # Limit to 10 processes
    python process_importer.py --filter chrome          # Filter processes by name
"""

import psutil
import json
import argparse
import sys
from datetime import datetime

def get_system_processes(limit=None, filter_keyword=None):
    """
    Capture running system processes with CPU and memory info.
    
    Args:
        limit: Maximum number of processes to return
        filter_keyword: Filter processes by name (case-insensitive)
    
    Returns:
        List of process dictionaries
    """
    processes = []
    
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'nice', 'create_time']):
        try:
            info = proc.info
            
            # Filter by keyword if provided
            if filter_keyword and filter_keyword.lower() not in info['name'].lower():
                continue
            
            # Get CPU percent (this triggers measurement)
            cpu_percent = proc.cpu_percent(interval=0.1)
            
            # Map process info to scheduler format
            process_data = {
                'pid': info['pid'],
                'name': info['name'],
                'arrival': 0,  # All current processes are "arrived"
                'burst': max(1, int(cpu_percent / 10) + 1),  # Estimate based on CPU usage (1-11)
                'priority': map_priority(info['nice']),  # Map nice value to priority
                'cpu_percent': round(cpu_percent, 2),
                'memory_percent': round(info['memory_percent'], 2),
                'nice': info['nice'],
                'create_time': info['create_time']
            }
            
            processes.append(process_data)
            
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
    
    # Sort by CPU usage (descending)
    processes.sort(key=lambda x: x['cpu_percent'], reverse=True)
    
    # Apply limit if specified
    if limit:
        processes = processes[:limit]
    
    return processes

def map_priority(nice_value):
    """
    Map process nice value to scheduler priority (1-5).
    Lower nice = higher priority
    
    Nice values range: -20 (highest priority) to 19 (lowest priority)
    Scheduler priority: 1 (highest) to 5 (lowest)
    """
    if nice_value is None:
        return 3  # Default medium priority
    
    # Map nice (-20 to 19) to priority (1 to 5)
    # -20 to -10 -> 1 (highest)
    # -9 to 0    -> 2
    # 1 to 5     -> 3 (medium)
    # 6 to 10    -> 4
    # 11 to 19   -> 5 (lowest)
    
    if nice_value <= -10:
        return 1
    elif nice_value <= 0:
        return 2
    elif nice_value <= 5:
        return 3
    elif nice_value <= 10:
        return 4
    else:
        return 5

def format_for_csv(processes):
    """Format processes as CSV string."""
    lines = ['pid,name,arrival,burst,priority']
    for p in processes:
        lines.append(f"{p['pid']},{p['name']},{p['arrival']},{p['burst']},{p['priority']}")
    return '\n'.join(lines)

def format_for_json(processes):
    """Format processes as JSON string."""
    # Simplified format for scheduler
    scheduler_processes = [
        {
            'pid': p['pid'],
            'name': p['name'],
            'arrival': p['arrival'],
            'burst': p['burst'],
            'priority': p['priority']
        }
        for p in processes
    ]
    
    return json.dumps({
        'timestamp': datetime.now().isoformat(),
        'total_processes': len(processes),
        'processes': scheduler_processes
    }, indent=2)

def format_for_scheduler_paste(processes):
    """Format processes for direct paste into scheduler UI (tab-separated)."""
    lines = []
    for i, p in enumerate(processes, 1):
        # Format: P{n}\t{arrival}\t{burst}\t{priority}\t{name}
        lines.append(f"P{i}\t{p['arrival']}\t{p['burst']}\t{p['priority']}\t{p['name']}")
    return '\n'.join(lines)

def main():
    parser = argparse.ArgumentParser(
        description='Import system processes for scheduler simulation',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                              # Display top processes
  %(prog)s --limit 15                   # Get top 15 processes
  %(prog)s --filter chrome              # Filter Chrome processes
  %(prog)s --output processes.json      # Save to JSON file
  %(prog)s --format csv > procs.csv     # Export as CSV
        """
    )
    
    parser.add_argument('--limit', '-l', type=int, default=10,
                      help='Maximum number of processes to capture (default: 10)')
    parser.add_argument('--filter', '-f', type=str,
                      help='Filter processes by name (case-insensitive)')
    parser.add_argument('--output', '-o', type=str,
                      help='Output file path (default: print to console)')
    parser.add_argument('--format', '-fmt', choices=['json', 'csv', 'paste'], default='json',
                      help='Output format (default: json)')
    
    args = parser.parse_args()
    
    try:
        # Capture processes
        print("Capturing system processes...", file=sys.stderr)
        processes = get_system_processes(limit=args.limit, filter_keyword=args.filter)
        
        if not processes:
            print("No processes found matching criteria.", file=sys.stderr)
            return 1
        
        print(f"Found {len(processes)} processes.", file=sys.stderr)
        
        # Format output
        if args.format == 'json':
            output = format_for_json(processes)
        elif args.format == 'csv':
            output = format_for_csv(processes)
        elif args.format == 'paste':
            output = format_for_scheduler_paste(processes)
        
        # Write output
        if args.output:
            with open(args.output, 'w') as f:
                f.write(output)
            print(f"Output written to: {args.output}", file=sys.stderr)
        else:
            print("\n" + "="*60, file=sys.stderr)
            print("COPY THE OUTPUT BELOW:", file=sys.stderr)
            print("="*60 + "\n", file=sys.stderr)
            print(output)
        
        return 0
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

if __name__ == '__main__':
    sys.exit(main())

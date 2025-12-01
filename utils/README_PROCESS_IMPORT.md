# System Process Importer

This utility allows you to capture real system processes and import them into the CPU Scheduler Simulator.

## Installation

Install required Python package:

```bash
pip install psutil
```

## Usage

### 1. Capture System Processes

**Basic usage** (top 10 processes by CPU):
```bash
python process_importer.py
```

**Capture more processes:**
```bash
python process_importer.py --limit 20
```

**Filter by process name:**
```bash
python process_importer.py --filter chrome
python process_importer.py --filter python
```

**Save to file:**
```bash
python process_importer.py --output processes.json
python process_importer.py --format csv > processes.csv
```

### 2. Import into Scheduler

#### Method A: JSON Import (Recommended)

1. Run the importer with JSON output:
   ```bash
   python process_importer.py --format json
   ```

2. Copy the entire JSON output

3. In the scheduler web UI, click **"Import System Processes"** button

4. Paste the JSON and click **"Import"**

#### Method B: CSV Import

1. Run the importer with CSV output:
   ```bash
   python process_importer.py --format csv > processes.csv
   ```

2. In the scheduler UI, use the **"Batch CSV Upload"** button

3. Upload the generated `processes.csv` file

#### Method C: Quick Paste Format

1. Run the importer with paste format:
   ```bash
   python process_importer.py --format paste
   ```

2. Copy the output (tab-separated values)

3. Paste directly into the process table in the UI

## How It Works

### Process Mapping

The importer maps system process attributes to scheduler parameters:

| System Attribute | Scheduler Parameter | Mapping Logic |
|-----------------|---------------------|---------------|
| Process ID (PID) | Process ID | Direct mapping |
| Process Name | Label/Name | Direct mapping |
| Current Time | Arrival Time | All set to 0 (already running) |
| CPU Usage % | Burst Time | `(cpu_percent / 10) + 1` (range: 1-11) |
| Nice Value | Priority | Maps -20..19 to 1..5 |

### Priority Mapping

Process **nice values** (Linux/Unix) are mapped to scheduler priorities:

- Nice -20 to -10 → Priority 1 (Highest)
- Nice -9 to 0 → Priority 2
- Nice 1 to 5 → Priority 3 (Medium)
- Nice 6 to 10 → Priority 4
- Nice 11 to 19 → Priority 5 (Lowest)

### Burst Time Estimation

Since real processes don't have "burst time", we estimate based on CPU usage:

```
burst_time = max(1, (cpu_percent / 10) + 1)
```

- 0-10% CPU → 1-2 time units
- 10-20% CPU → 2-3 time units
- 90-100% CPU → 10-11 time units

## Examples

### Example 1: Capture Browser Processes

```bash
python process_importer.py --filter firefox --limit 5
```

Output:
```json
{
  "timestamp": "2025-12-01T10:30:00",
  "total_processes": 5,
  "processes": [
    {
      "pid": 12345,
      "name": "firefox.exe",
      "arrival": 0,
      "burst": 8,
      "priority": 2
    },
    ...
  ]
}
```

### Example 2: Capture Development Environment

```bash
python process_importer.py --filter "code|python|node" --limit 10
```

This captures VS Code, Python, and Node.js processes.

### Example 3: Save and Share

```bash
python process_importer.py --limit 15 --output my_system_snapshot.json
```

Share `my_system_snapshot.json` with others to reproduce your system workload.

## Limitations

1. **Cross-Platform Differences**: Process attributes vary between Windows, Linux, and macOS
2. **Access Permissions**: Some processes require admin/root access to query
3. **Estimation**: Burst time is estimated from CPU usage, not actual execution time
4. **Snapshot Only**: Captures a single moment in time, not process lifetime behavior
5. **Browser Security**: Cannot access system processes directly from web browser

## Tips

- **Use filtering** to capture specific workload types (browsers, IDEs, servers)
- **Adjust burst times** in the UI after import if needed
- **Save snapshots** of interesting workloads for later testing
- **Combine with scenarios**: Import processes, then modify to create realistic scenarios

## Troubleshooting

**"No processes found"**
- Try running with admin/sudo privileges
- Remove or adjust the filter
- Increase the limit

**"psutil not installed"**
```bash
pip install psutil
```

**"Access Denied" errors**
- Some system processes require elevated privileges
- Run as administrator (Windows) or with sudo (Linux/Mac)

**Burst times seem wrong**
- Burst time is estimated from CPU usage
- Edit manually in the UI after import
- CPU usage varies over time; run the importer multiple times for different snapshots

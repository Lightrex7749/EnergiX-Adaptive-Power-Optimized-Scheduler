# Complete Usage Guide
## Energy-Efficient CPU Scheduling Simulator

---

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Accessing the Application](#accessing-the-application)
3. [Using the Simulator](#using-the-simulator)
4. [Understanding Results](#understanding-results)
5. [API Usage](#api-usage)
6. [Troubleshooting](#troubleshooting)
7. [Project Files Overview](#project-files-overview)

---

## 🚀 Quick Start

### Option 1: Web Access (Recommended)
The application is already running and accessible through your browser:

1. **Landing Page**: `http://localhost:3000`
2. **Simulator**: `http://localhost:3000/scheduler-index.html`

### Option 2: Local Setup

#### Backend Setup
```bash
cd /app/backend
python app.py
# Server runs on http://localhost:8001
```

#### Frontend Setup
```bash
cd /app/frontend
yarn start
# Accessible at http://localhost:3000
```

---

## 🌐 Accessing the Application

### Step 1: Open the Landing Page
Navigate to: `http://localhost:3000`

You'll see:
- Project title and description
- **"Launch Simulator"** button
- Feature highlights

### Step 2: Launch the Simulator
Click **"Launch Simulator"** to access the main application.

---

## 🎮 Using the Simulator

### Interface Overview

The simulator has **4 main tabs**:
1. **Input Processes** - Configure simulation parameters
2. **Results** - View scheduling results and Gantt chart
3. **Energy Analysis** - Examine DVFS energy consumption
4. **Compare** - Compare all algorithms side-by-side

---

### Tab 1: Input Processes

#### Step 1: Select Algorithm
Choose from dropdown:
- **FCFS** (First Come First Serve)
- **SJF Non-Preemptive**
- **SJF Preemptive** (SRTF)
- **Round Robin**
- **Priority Scheduling**
- **Energy-Aware Hybrid (EAH)** ⭐ (Default)

#### Step 2: Configure Parameters

**For Round Robin:**
- Set **Time Quantum** (default: 2)
- Smaller quantum = more context switches
- Larger quantum = approaches FCFS

**For EAH:**
- Set **Task Threshold** (optional)
- Leave blank for automatic calculation
- Manual value: Tasks ≤ threshold are "short"

#### Step 3: Add Processes

**Default Processes:**
The simulator comes with 4 pre-loaded processes:
- P1: Arrival=0, Burst=5, Priority=2
- P2: Arrival=1, Burst=3, Priority=1
- P3: Arrival=2, Burst=8, Priority=3
- P4: Arrival=3, Burst=6, Priority=2

**Add More Processes:**
1. Click **"Add Process"**
2. Fill in:
   - **Process ID**: Auto-assigned
   - **Arrival Time**: When process arrives (≥0)
   - **Burst Time**: CPU time needed (≥1)
   - **Priority**: Priority value (0-10, lower = higher priority)

**Load Sample Data:**
- Click **"Load Sample"** for a pre-configured workload
- 6 processes with mixed short/long tasks
- Ideal for testing EAH algorithm

**Remove Process:**
- Click red trash icon next to any process

**Clear All:**
- Click **"Clear All"** to start fresh

#### Step 4: Run Simulation

**Single Algorithm:**
1. Click **"Run Scheduler"**
2. Wait for processing (1-2 seconds)
3. View results in **Results** and **Energy Analysis** tabs

**Compare All:**
1. Click **"Compare All Algorithms"**
2. All 6 algorithms run with same process set
3. View comparison in **Compare** tab

---

### Tab 2: Results

#### Metrics Display
After running, you'll see:

**Key Metrics:**
- **Avg Turnaround Time**: Average time from arrival to completion
- **Avg Waiting Time**: Average time spent waiting in queue
- **Completion Time**: Total time to complete all processes
- **Context Switches**: Number of process switches
- **Task Threshold**: Classification threshold (for EAH)
- **Short/Long Tasks**: Task distribution (for EAH)

#### Gantt Chart
Visual timeline showing:
- **Colored blocks**: Different processes
- **Process labels**: P1, P2, P3, etc.
- **Duration**: Shown on each block
- **Time markers**: Below the chart

**Color Scheme:**
- Green (P1), Orange (P2), Red (P3), Purple (P4), etc.
- IDLE periods shown in gray

**Interactive:**
- Hover over blocks to see details
- Process ID, start time, end time

#### Process Details Table
Comprehensive table with:
- Process ID
- Arrival Time
- Burst Time
- Completion Time
- Turnaround Time
- Waiting Time
- Priority (if applicable)
- Classification (for EAH: "short" or "long")

**Export Results:**
- Click **"Export JSON"** to download results
- Contains complete scheduling data
- Useful for further analysis

---

### Tab 3: Energy Analysis

#### Energy Summary Cards

**Total Energy:**
- Sum of all energy consumed
- Measured in energy units
- Lower is better

**Busy Energy:**
- Energy consumed during process execution
- Majority of total energy
- Depends on CPU frequency states

**Idle Energy:**
- Energy consumed during idle periods
- Usually very low (0.2 W)
- Accumulated over idle time

**Context Switch Energy:**
- Penalty for each process switch
- 0.5 units per switch
- Significant in preemptive algorithms

**Average Power:**
- Total Energy / Total Time
- Indicates overall power consumption rate

#### DVFS Parameters Table

Shows configuration:
- **Frequencies**: HIGH (1.0), MED (0.7), LOW (0.4)
- **Power Levels**: HIGH (5.0), MED (2.1), LOW (0.6), IDLE (0.2)
- **Thresholds**: High (0.6), Low (0.2)
- **Window Size**: 3 time units
- **Hysteresis**: 1 time unit
- **Context Switch Penalty**: 0.5 units

#### Power Timeline Chart

**Graph Features:**
- **Dual Y-axes**:
  - Left: Power Consumption (watts)
  - Right: CPU Utilization (0-1)
- **X-axis**: Time (units)
- **Orange line**: Power consumption over time
- **Blue line**: CPU utilization over time

**Interpretation:**
- High power during busy periods
- Low power during idle
- Gradual transitions (hysteresis effect)
- Utilization drives frequency selection

#### Frequency Timeline Chart

**Bar Chart:**
- **X-axis**: Time units
- **Y-axis**: CPU Frequency (0-1.2)
- **Color coding**:
  - Red: HIGH state (1.0)
  - Orange: MED state (0.7)
  - Green: LOW state (0.4)
  - Gray: IDLE state (0.0)

**Interpretation:**
- Frequent color changes = unstable workload
- Consistent color = stable power state
- Longer bars in lower states = energy efficient

---

### Tab 4: Compare

#### Algorithm Comparison Cards

**Each Card Shows:**
- Algorithm name
- Avg Turnaround Time
- Avg Waiting Time
- Context Switches
- **Total Energy** (highlighted in yellow)
- Completion Time

**All 6 Algorithms:**
1. Energy-Aware Hybrid (EAH)
2. FCFS
3. Priority Scheduling
4. Round Robin
5. SJF Non-Preemptive
6. SJF Preemptive (SRTF)

#### Comparison Chart

**Multi-metric Bar Chart:**
- **X-axis**: Algorithm names
- **Y-axis (Left)**: Energy units
- **Y-axis (Right)**: Time/Count
- **Three datasets**:
  - Yellow bars: Total Energy
  - Blue bars: Avg Turnaround Time
  - Purple bars: Context Switches

**Reading the Chart:**
- **Best Energy**: Shortest yellow bar
- **Best Performance**: Shortest blue bar
- **Fewest Switches**: Shortest purple bar
- **Optimal**: Balance all three metrics

**Key Insights:**
- EAH typically has lowest energy
- SJF Preemptive has best performance but higher energy
- Round Robin has most context switches
- FCFS is simple but not optimal

---

## 📡 API Usage

### Base URL
```
http://localhost:8001/api
```

### Endpoints

#### 1. Health Check
```bash
curl http://localhost:8001/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "CPU Scheduler API"
}
```

#### 2. Run Scheduler
```bash
curl -X POST http://localhost:8001/api/all \
  -H "Content-Type: application/json" \
  -d '{
    "algorithm": "eah",
    "processes": [
      {"pid": 1, "arrival": 0, "burst": 5, "priority": 2},
      {"pid": 2, "arrival": 1, "burst": 3, "priority": 1}
    ],
    "quantum": 2,
    "threshold": null
  }'
```

**Response:** Complete scheduling result + energy data

#### 3. Compare Algorithms
```bash
curl -X POST http://localhost:8001/api/compare \
  -H "Content-Type: application/json" \
  -d '{
    "processes": [
      {"pid": 1, "arrival": 0, "burst": 5, "priority": 2}
    ],
    "quantum": 2
  }'
```

**Response:** Results for all algorithms

---

## 🔧 Troubleshooting

### Issue: Backend not responding

**Solution:**
```bash
# Check if backend is running
curl http://localhost:8001/api/health

# If not running, start it
cd /app/backend
python app.py

# Check logs
tail -f /tmp/flask_app.log
```

### Issue: Frontend not loading

**Solution:**
```bash
# Check frontend service
curl http://localhost:3000

# Restart if needed
cd /app/frontend
yarn start
```

### Issue: Charts not displaying

**Cause:** Chart.js library not loaded

**Solution:**
- Check browser console for errors
- Ensure internet connection (for CDN)
- Clear browser cache
- Reload page

### Issue: API errors in simulator

**Cause:** Backend URL misconfiguration

**Solution:**
Check `/app/frontend/public/js/scheduler-api.js`:
```javascript
const API_BASE_URL = 'https://scheduler-app-9.preview.emergentagent.com';
```

### Issue: Results not showing

**Steps:**
1. Check browser console (F12)
2. Verify API response: Network tab
3. Ensure processes have valid data
4. Try with sample data

---

## 📁 Project Files Overview

### Backend Files

**`/app/backend/app.py`**
- Main Flask application
- API endpoints definition
- Request handling

**`/app/backend/algorithms.py`**
- FCFS, SJF, Round Robin, Priority implementations
- Process class definition
- Metrics calculation

**`/app/backend/energy_aware_scheduler.py`**
- EAH algorithm implementation
- DVFS energy model
- Task classification logic

**`/app/backend/requirements.txt`**
- Python dependencies
- Flask, Flask-CORS

**`/app/backend/sample.json`**
- Pre-configured test cases
- Sample workloads

### Frontend Files

**`/app/frontend/public/scheduler-index.html`**
- Main application page
- UI structure
- Tab navigation

**`/app/frontend/public/css/scheduler-style.css`**
- Modern dark theme
- Responsive design
- Component styling

**`/app/frontend/public/js/scheduler-api.js`**
- API communication
- Fetch requests
- Error handling

**`/app/frontend/public/js/scheduler-gantt.js`**
- Gantt chart rendering
- Process table generation
- Metrics display

**`/app/frontend/public/js/scheduler-charts.js`**
- Chart.js integration
- Power timeline chart
- Frequency chart
- Comparison chart

**`/app/frontend/public/js/scheduler-main.js`**
- Main application logic
- Tab management
- Event handlers
- Process management

### Documentation Files

**`/app/README_PROJECT.md`**
- Complete project documentation
- Architecture overview
- Algorithm explanations
- Setup instructions

**`/app/VIVA_QUESTIONS.md`**
- 30+ viva questions with detailed answers
- Covers all project aspects
- Academic-style responses

**`/app/USAGE_GUIDE.md`** (This file)
- Step-by-step usage instructions
- API documentation
- Troubleshooting guide

---

## 💡 Tips and Best Practices

### For Demonstrations

1. **Start with Default Data**: Use pre-loaded 4 processes
2. **Run EAH First**: Show the novel algorithm
3. **Compare All**: Demonstrate energy savings
4. **Explain Gantt Chart**: Visual understanding
5. **Show Energy Analysis**: DVFS in action

### For Testing

1. **Vary Workloads**:
   - All short tasks (1-3 burst time)
   - All long tasks (10-15 burst time)
   - Mixed workload (sample data)

2. **Test Edge Cases**:
   - Single process
   - All processes arrive at t=0
   - Large gaps in arrival times

3. **Compare Quantum Values**:
   - Round Robin with Q=1, Q=2, Q=5
   - Observe context switch impact

### For Analysis

1. **Energy Efficiency**:
   - Note context switch count
   - Compare energy values
   - Identify optimal algorithm

2. **Performance**:
   - Check average waiting time
   - Observe turnaround time
   - Balance with energy

3. **Scalability**:
   - Test with 10, 20, 50 processes
   - Measure time complexity
   - Observe energy scaling

---

## 🎯 Sample Workflows

### Workflow 1: Basic Demonstration

1. Load default processes
2. Select EAH algorithm
3. Click "Run Scheduler"
4. View Results tab → Gantt chart
5. View Energy Analysis → Charts
6. Export JSON results

### Workflow 2: Algorithm Comparison

1. Load sample data (6 processes)
2. Click "Compare All Algorithms"
3. View Compare tab
4. Analyze metrics cards
5. Study comparison chart
6. Identify best algorithm

### Workflow 3: Energy Optimization

1. Load processes
2. Run Round Robin (Q=2)
3. Note energy consumption
4. Run EAH
5. Compare energy values
6. Calculate % savings

### Workflow 4: Custom Workload

1. Clear all processes
2. Add 5 short tasks (burst ≤3)
3. Add 3 long tasks (burst ≥10)
4. Run EAH with threshold=5
5. Check classification
6. Verify task handling

---

## 📊 Interpreting Results

### Good Performance Indicators

**Low Waiting Time**: < 50% of total burst time  
**Balanced Energy**: Not too high, not oscillating  
**Minimal Context Switches**: ≤ number of processes  
**Fair Scheduling**: No starvation visible  

### Algorithm Selection Guide

**For Battery Life**: Use EAH  
**For Response Time**: Use SJF Preemptive  
**For Fairness**: Use Round Robin  
**For Simplicity**: Use FCFS  

---

## 🆘 Support

### Getting Help

1. Check this guide first
2. Review README_PROJECT.md
3. Consult VIVA_QUESTIONS.md
4. Check browser console for errors
5. Verify backend is running

### Common Questions

**Q: Why is energy same for some algorithms?**  
A: Non-preemptive algorithms (FCFS, SJF, Priority, EAH) have similar context switches, leading to similar energy.

**Q: Why does Round Robin use more energy?**  
A: More context switches due to preemption, each costing 0.5 energy units.

**Q: Can I add more than 10 processes?**  
A: Yes, but visualization may be cluttered. Works fine up to 50 processes.

**Q: What if I want different DVFS parameters?**  
A: Edit `/app/backend/energy_aware_scheduler.py` and modify the constants.

---

## 🎓 For Academic Submission

### Checklist

- ✅ Code is documented
- ✅ README is comprehensive
- ✅ Viva questions prepared
- ✅ Results captured (screenshots/JSON)
- ✅ Comparison table ready
- ✅ Project runs successfully
- ✅ All algorithms tested

### Deliverables

1. **Source Code**: `/app/backend/` and `/app/frontend/`
2. **Documentation**: README, USAGE_GUIDE, VIVA_QUESTIONS
3. **Results**: Exported JSON files
4. **Screenshots**: Gantt charts, energy graphs
5. **Presentation**: Slides explaining EAH
6. **Report**: Complete CA-2 report

---

## 📚 Further Reading

- Operating System Concepts by Silberschatz
- Modern Operating Systems by Tanenbaum
- Research papers on energy-aware scheduling
- DVFS documentation for ARM/x86 processors

---

**End of Usage Guide**

For any issues or questions, refer to the project README or contact your course instructor.

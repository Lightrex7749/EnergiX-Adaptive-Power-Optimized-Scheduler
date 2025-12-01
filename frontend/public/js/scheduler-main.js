/**
 * Main Application Logic
 * Handles UI interactions and orchestrates the application
 */

let processIdCounter = 1;
let currentResults = null;

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeAlgorithmSelector();
    loadDefaultProcesses();
    
    // Health check
    API.healthCheck().then(result => {
        console.log('Backend status:', result);
    }).catch(err => {
        console.error('Backend connection failed:', err);
        showAlert('Warning: Could not connect to backend server', 'warning');
    });
});

/**
 * Tab Management
 */
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelector(`[data-content="${tabName}"]`).classList.add('active');
}

/**
 * Algorithm Selector
 */
function initializeAlgorithmSelector() {
    const algorithmSelect = document.getElementById('algorithm');
    const quantumGroup = document.getElementById('quantum-group');
    const thresholdGroup = document.getElementById('threshold-group');
    
    algorithmSelect.addEventListener('change', (e) => {
        const algorithm = e.target.value;
        
        // Show/hide quantum input
        if (algorithm === 'round_robin') {
            quantumGroup.style.display = 'block';
        } else {
            quantumGroup.style.display = 'none';
        }
        
        // Show/hide threshold input
        if (algorithm === 'eah') {
            thresholdGroup.style.display = 'block';
        } else {
            thresholdGroup.style.display = 'none';
        }
    });
    
    // Trigger initial state
    algorithmSelect.dispatchEvent(new Event('change'));
}

/**
 * Process Management
 */
function loadDefaultProcesses() {
    const defaultProcesses = [
        { pid: 1, arrival: 0, burst: 5, priority: 2 },
        { pid: 2, arrival: 1, burst: 3, priority: 1 },
        { pid: 3, arrival: 2, burst: 8, priority: 3 },
        { pid: 4, arrival: 3, burst: 6, priority: 2 }
    ];
    
    defaultProcesses.forEach(p => {
        addProcessRow(p);
        processIdCounter = Math.max(processIdCounter, p.pid + 1);
    });
}

function addProcess() {
    addProcessRow({
        pid: processIdCounter++,
        arrival: 0,
        burst: 5,
        priority: 1
    });
}

function addProcessRow(process) {
    const tbody = document.getElementById('processTableBody');
    const row = document.createElement('tr');
    row.dataset.pid = process.pid;
    
    row.innerHTML = `
        <td><input type="number" value="${process.pid}" readonly style="background: var(--bg-secondary);"></td>
        <td><input type="number" value="${process.arrival}" min="0" class="arrival-input" data-testid="arrival-${process.pid}"></td>
        <td><input type="number" value="${process.burst}" min="1" class="burst-input" data-testid="burst-${process.pid}"></td>
        <td><input type="number" value="${process.priority}" min="0" class="priority-input" data-testid="priority-${process.pid}"></td>
        <td>
            <button class="btn btn-danger" onclick="removeProcess(${process.pid})" data-testid="remove-${process.pid}">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(row);
}

function removeProcess(pid) {
    const row = document.querySelector(`tr[data-pid="${pid}"]`);
    if (row) {
        row.remove();
    }
}

function clearProcesses() {
    const tbody = document.getElementById('processTableBody');
    tbody.innerHTML = '';
    processIdCounter = 1;
    
    // Remove current sample indicator
    const indicator = document.querySelector('.current-sample-indicator');
    if (indicator) {
        indicator.remove();
    }
    
    // Reset dropdown selection
    const select = document.getElementById('sampleSelect');
    if (select) {
        select.value = '';
    }
}

function getProcesses() {
    const processes = [];
    const rows = document.querySelectorAll('#processTableBody tr');
    
    rows.forEach(row => {
        const pid = parseInt(row.querySelector('input[readonly]').value);
        const arrival = parseInt(row.querySelector('.arrival-input').value);
        const burst = parseInt(row.querySelector('.burst-input').value);
        const priority = parseInt(row.querySelector('.priority-input').value);
        
        processes.push({ pid, arrival, burst, priority });
    });
    
    return processes;
}

/**
 * Sample Workloads - 10 strategically designed scenarios where different algorithms win
 */
const sampleWorkloads = {
    fcfs1: {
        name: 'Sequential Optimal - FCFS Wins',
        description: 'Arrivals naturally ordered, overhead of reordering not justified',
        processes: [
            { pid: 1, arrival: 0, burst: 3, priority: 3 },
            { pid: 2, arrival: 4, burst: 5, priority: 3 },
            { pid: 3, arrival: 10, burst: 4, priority: 3 }
        ]
    },
    sjf1: {
        name: 'Burst Disparity - SJF Wins',
        description: 'Massive burst time differences favor shortest-first',
        processes: [
            { pid: 1, arrival: 0, burst: 25, priority: 3 },
            { pid: 2, arrival: 0, burst: 1, priority: 3 },
            { pid: 3, arrival: 0, burst: 2, priority: 3 },
            { pid: 4, arrival: 0, burst: 18, priority: 3 },
            { pid: 5, arrival: 0, burst: 3, priority: 3 }
        ]
    },
    srtf1: {
        name: 'Late Short Jobs - SRTF Wins',
        description: 'Short processes arrive during long execution, preemption critical',
        processes: [
            { pid: 1, arrival: 0, burst: 18, priority: 3 },
            { pid: 2, arrival: 2, burst: 1, priority: 3 },
            { pid: 3, arrival: 5, burst: 1, priority: 3 },
            { pid: 4, arrival: 8, burst: 2, priority: 3 }
        ]
    },
    rr1: {
        name: 'Interactive Fairness - RR Wins',
        description: 'Equal bursts with staggered arrivals favor time-slicing',
        processes: [
            { pid: 1, arrival: 0, burst: 14, priority: 3 },
            { pid: 2, arrival: 1, burst: 14, priority: 3 },
            { pid: 3, arrival: 2, burst: 14, priority: 3 }
        ]
    },
    priority1: {
        name: 'Urgent Override - Priority Wins',
        description: 'Critical high-priority task dominates scheduling',
        processes: [
            { pid: 1, arrival: 0, burst: 18, priority: 5 },
            { pid: 2, arrival: 0, burst: 3, priority: 1 },
            { pid: 3, arrival: 0, burst: 15, priority: 5 },
            { pid: 4, arrival: 0, burst: 9, priority: 3 }
        ]
    },
    eah1: {
        name: 'Hybrid Threshold - EAH Wins',
        description: 'Strategic mix crosses threshold for optimal hybrid scheduling',
        processes: [
            { pid: 1, arrival: 0, burst: 2, priority: 3 },
            { pid: 2, arrival: 0, burst: 4, priority: 3 },
            { pid: 3, arrival: 0, burst: 7, priority: 3 },
            { pid: 4, arrival: 0, burst: 18, priority: 3 },
            { pid: 5, arrival: 0, burst: 20, priority: 3 }
        ]
    },
    rr2: {
        name: 'Prevent Starvation - RR Wins',
        description: 'Continuous arrivals where RR maintains fairness best',
        processes: [
            { pid: 1, arrival: 0, burst: 22, priority: 3 },
            { pid: 2, arrival: 2, burst: 6, priority: 3 },
            { pid: 3, arrival: 4, burst: 6, priority: 3 }
        ]
    },
    priority2: {
        name: 'Emergency Task - Priority Wins',
        description: 'Extreme priority gap with urgent short task',
        processes: [
            { pid: 1, arrival: 0, burst: 16, priority: 5 },
            { pid: 2, arrival: 0, burst: 2, priority: 1 },
            { pid: 3, arrival: 0, burst: 12, priority: 4 }
        ]
    },
    fcfs2: {
        name: 'Arrival Order Perfect - FCFS Wins',
        description: 'Natural order already optimal, no reordering gain',
        processes: [
            { pid: 1, arrival: 0, burst: 3, priority: 3 },
            { pid: 2, arrival: 4, burst: 5, priority: 3 },
            { pid: 3, arrival: 10, burst: 7, priority: 3 }
        ]
    },
    eah2: {
        name: 'Energy Efficiency - EAH Wins',
        description: 'Large task mix where hybrid approach minimizes energy',
        processes: [
            { pid: 1, arrival: 0, burst: 1, priority: 3 },
            { pid: 2, arrival: 0, burst: 3, priority: 3 },
            { pid: 3, arrival: 0, burst: 4, priority: 3 },
            { pid: 4, arrival: 0, burst: 14, priority: 3 },
            { pid: 5, arrival: 0, burst: 18, priority: 3 },
            { pid: 6, arrival: 0, burst: 20, priority: 3 }
        ]
    }
};

/**
 * Real-World Scenario Templates
 * Based on actual workload patterns from different domains
 */
const scenarioTemplates = {
    webserver: {
        name: '🌐 Web Server Workload',
        description: 'HTTP request handling with mixed short/long requests, periodic background tasks',
        characteristics: 'Mostly short requests (50-200ms), occasional long queries (1-3s), high concurrency',
        processes: [
            { pid: 1, arrival: 0, burst: 2, priority: 2, label: 'Static File Request' },
            { pid: 2, arrival: 1, burst: 1, priority: 1, label: 'Health Check' },
            { pid: 3, arrival: 2, burst: 5, priority: 3, label: 'API Query' },
            { pid: 4, arrival: 3, burst: 1, priority: 2, label: 'Static File Request' },
            { pid: 5, arrival: 4, burst: 15, priority: 4, label: 'Database Report' },
            { pid: 6, arrival: 5, burst: 2, priority: 2, label: 'Image Upload' },
            { pid: 7, arrival: 6, burst: 1, priority: 1, label: 'Ping' },
            { pid: 8, arrival: 7, burst: 3, priority: 3, label: 'Search Query' },
            { pid: 9, arrival: 9, burst: 8, priority: 4, label: 'Batch Processing' },
            { pid: 10, arrival: 10, burst: 2, priority: 2, label: 'File Download' }
        ]
    },
    videoencoding: {
        name: '🎬 Video Encoding',
        description: 'Video transcoding pipeline with different resolution tasks',
        characteristics: 'CPU-intensive, long-running tasks with different priorities based on resolution',
        processes: [
            { pid: 1, arrival: 0, burst: 25, priority: 3, label: '4K Encode' },
            { pid: 2, arrival: 2, burst: 12, priority: 2, label: '1080p Encode' },
            { pid: 3, arrival: 3, burst: 6, priority: 2, label: '720p Encode' },
            { pid: 4, arrival: 5, burst: 3, priority: 1, label: 'Thumbnail Gen' },
            { pid: 5, arrival: 8, burst: 18, priority: 3, label: '4K HDR Encode' },
            { pid: 6, arrival: 10, burst: 8, priority: 2, label: '1080p Encode' },
            { pid: 7, arrival: 12, burst: 2, priority: 1, label: 'Preview Gen' }
        ]
    },
    database: {
        name: '💾 Database Transactions',
        description: 'Mix of OLTP transactions, batch jobs, and backup operations',
        characteristics: 'Short transactions (10-50ms), occasional long-running analytics, critical backup windows',
        processes: [
            { pid: 1, arrival: 0, burst: 1, priority: 1, label: 'SELECT Query' },
            { pid: 2, arrival: 1, burst: 2, priority: 2, label: 'INSERT Transaction' },
            { pid: 3, arrival: 2, burst: 1, priority: 1, label: 'SELECT Query' },
            { pid: 4, arrival: 3, burst: 20, priority: 5, label: 'Full Table Scan' },
            { pid: 5, arrival: 4, burst: 1, priority: 1, label: 'SELECT Query' },
            { pid: 6, arrival: 5, burst: 3, priority: 2, label: 'UPDATE Transaction' },
            { pid: 7, arrival: 6, burst: 1, priority: 1, label: 'SELECT Query' },
            { pid: 8, arrival: 8, burst: 15, priority: 4, label: 'Analytics Job' },
            { pid: 9, arrival: 10, burst: 2, priority: 2, label: 'JOIN Query' },
            { pid: 10, arrival: 12, burst: 25, priority: 5, label: 'Backup Process' }
        ]
    },
    gaming: {
        name: '🎮 Gaming System',
        description: 'Real-time game engine with rendering, physics, AI, and I/O',
        characteristics: 'Frame-critical rendering (16.6ms @ 60fps), physics calculations, AI updates, asset loading',
        processes: [
            { pid: 1, arrival: 0, burst: 2, priority: 1, label: 'Frame Render' },
            { pid: 2, arrival: 1, burst: 3, priority: 2, label: 'Physics Update' },
            { pid: 3, arrival: 2, burst: 2, priority: 1, label: 'Frame Render' },
            { pid: 4, arrival: 3, burst: 4, priority: 3, label: 'AI Processing' },
            { pid: 5, arrival: 4, burst: 2, priority: 1, label: 'Frame Render' },
            { pid: 6, arrival: 5, burst: 8, priority: 4, label: 'Asset Loading' },
            { pid: 7, arrival: 6, burst: 2, priority: 1, label: 'Frame Render' },
            { pid: 8, arrival: 7, burst: 3, priority: 2, label: 'Audio Processing' },
            { pid: 9, arrival: 8, burst: 2, priority: 1, label: 'Frame Render' },
            { pid: 10, arrival: 9, burst: 5, priority: 3, label: 'Network Sync' }
        ]
    },
    scientific: {
        name: '🔬 Scientific Computing',
        description: 'HPC workload with simulations, data analysis, and visualization',
        characteristics: 'Long-running simulations, parallel data processing, periodic checkpoints',
        processes: [
            { pid: 1, arrival: 0, burst: 30, priority: 3, label: 'Simulation Run' },
            { pid: 2, arrival: 5, burst: 15, priority: 2, label: 'Data Analysis' },
            { pid: 3, arrival: 8, burst: 5, priority: 1, label: 'Checkpoint Save' },
            { pid: 4, arrival: 10, burst: 25, priority: 3, label: 'Simulation Run' },
            { pid: 5, arrival: 15, burst: 10, priority: 2, label: 'Statistical Processing' },
            { pid: 6, arrival: 18, burst: 8, priority: 2, label: 'Visualization' },
            { pid: 7, arrival: 20, burst: 5, priority: 1, label: 'Result Export' }
        ]
    }
};

/**
 * Load Scenario Template
 */
function loadScenarioTemplate() {
    const select = document.getElementById('scenarioSelect');
    const scenarioKey = select.value;
    
    if (!scenarioKey) {
        return;
    }
    
    const scenario = scenarioTemplates[scenarioKey];
    if (!scenario) {
        showAlert('Scenario not found', 'error');
        return;
    }
    
    // Clear existing processes
    processes = [];
    
    // Load scenario processes
    scenario.processes.forEach(proc => {
        processes.push({
            pid: proc.pid,
            arrival: proc.arrival,
            burst: proc.burst,
            priority: proc.priority
        });
    });
    
    renderProcessTable();
    
    // Show scenario info
    showAlert(
        `📋 Loaded: ${scenario.name}\n\n` +
        `${scenario.description}\n\n` +
        `${scenario.characteristics}\n\n` +
        `${processes.length} processes loaded`,
        'success'
    );
    
    // Reset select
    select.value = '';
}

function loadSelectedSample() {
    const select = document.getElementById('sampleSelect');
    const sampleKey = select.value;
    
    if (!sampleKey) {
        return;
    }
    
    const sample = sampleWorkloads[sampleKey];
    
    if (!sample) {
        showAlert(`Sample not found: ${sampleKey}`, 'error');
        return;
    }
    
    clearProcesses();
    processIdCounter = 1;
    
    sample.processes.forEach(p => {
        addProcessRow(p);
        processIdCounter = Math.max(processIdCounter, p.pid + 1);
    });
    
    // Update the current sample indicator
    updateCurrentSampleDisplay(sample.name, sample.description);
    
    showAlert(`${sample.name} loaded successfully!`, 'success');
    
    // Keep the selected value visible instead of resetting
    // select.value = ''; // Commented out so selection stays visible
}

function updateCurrentSampleDisplay(name, description) {
    // Remove old indicator if exists
    const oldIndicator = document.querySelector('.current-sample-indicator');
    if (oldIndicator) {
        oldIndicator.remove();
    }
    
    // Create new indicator
    const tableHeader = document.querySelector('.table-header h3');
    if (tableHeader) {
        const indicator = document.createElement('div');
        indicator.className = 'current-sample-indicator';
        indicator.innerHTML = `
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; margin-left: 1rem; padding: 0.5rem 1rem; background: var(--bg-secondary); border-radius: 6px; border: 1px solid var(--primary);">
                <i class="fas fa-check-circle" style="color: var(--success);"></i>
                <span style="color: var(--text-primary); font-weight: 500;">${name}</span>
            </div>
        `;
        tableHeader.appendChild(indicator);
    }
}

function loadSample() {
    // Legacy function for backward compatibility - loads medium workload
    clearProcesses();
    processIdCounter = 1;
    
    const sampleProcesses = sampleWorkloads.medium.processes;
    
    sampleProcesses.forEach(p => {
        addProcessRow(p);
        processIdCounter = Math.max(processIdCounter, p.pid + 1);
    });
    
    showAlert('Sample data loaded successfully!', 'success');
}

/**
 * Run Scheduler
 */
async function runScheduler() {
    const processes = getProcesses();
    
    if (processes.length === 0) {
        showAlert('Please add at least one process', 'error');
        return;
    }
    
    const algorithm = document.getElementById('algorithm').value;
    const quantum = document.getElementById('quantum').value;
    const thresholdInput = document.getElementById('threshold').value;
    const threshold = thresholdInput ? parseFloat(thresholdInput) : null;
    
    try {
        showLoading('Running scheduler...');
        
        const result = await API.runScheduler(algorithm, processes, quantum, threshold);
        currentResults = result;
        
        displayResults(result);
        switchTab('results');
        
        hideLoading();
        showAlert('Scheduler executed successfully!', 'success');
    } catch (error) {
        hideLoading();
        showAlert(`Error: ${error.message}`, 'error');
    }
}

/**
 * Display Results
 */
function displayResults(result) {
    const container = document.getElementById('resultsContent');
    
    let html = '<div class="results-container">';
    
    // Algorithm info
    html += `<div class="alert alert-success" style="margin-bottom: 2rem;">
        <i class="fas fa-check-circle"></i>
        <strong>Algorithm:</strong> ${result.algorithm}
    </div>`;
    
    // Metrics
    html += '<div id="metricsDisplay"></div>';
    
    // Gantt Chart
    html += '<div id="ganttChart"></div>';
    
    // Process Details Table
    html += '<div id="processDetailsTable"></div>';
    
    html += '</div>';
    
    container.innerHTML = html;
    
    // Render components
    setTimeout(() => {
        renderMetrics(result.metrics, result.context_switches, 'metricsDisplay');
        renderGanttChart(result.gantt, 'ganttChart');
        renderProcessTable(result.processes, 'processDetailsTable');
    }, 100);
    
    // Display energy data
    if (result.energy) {
        displayEnergyResults(result.energy);
    }
}

/**
 * Display Energy Results
 */
function displayEnergyResults(energyData) {
    const container = document.getElementById('energyContent');
    container.innerHTML = '<div id="energyCharts"></div>';
    
    setTimeout(() => {
        renderEnergyCharts(energyData, 'energyCharts');
    }, 100);
}

/**
 * Compare All Algorithms
 */
async function compareAll() {
    const processes = getProcesses();
    
    if (processes.length === 0) {
        showAlert('Please add at least one process', 'error');
        return;
    }
    
    const quantum = document.getElementById('quantum').value;
    const threshold = document.getElementById('threshold').value;
    
    try {
        showLoading('Comparing all algorithms...');
        
        const comparisonData = await API.compareAlgorithms(processes, quantum, threshold);
        
        displayComparison(comparisonData);
        switchTab('compare');
        
        hideLoading();
        showAlert('Comparison completed successfully!', 'success');
    } catch (error) {
        hideLoading();
        showAlert(`Error: ${error.message}`, 'error');
    }
}

/**
 * Display Comparison
 */
function displayComparison(comparisonData) {
    const container = document.getElementById('compareContent');
    
    // Determine best algorithms for each metric
    const bestAlgorithms = determineBestAlgorithms(comparisonData);
    
    let html = '<div class="comparison-container">';
    
    // Configuration Info and Export Buttons
    const quantum = document.getElementById('quantum').value;
    const threshold = document.getElementById('threshold').value || 'Auto';
    html += `
        <div class="alert alert-info" style="margin-bottom: 1rem; padding: 1rem; display: flex; gap: 2rem; align-items: center; font-size: 0.95rem; justify-content: space-between;">
            <div style="display: flex; gap: 2rem;">
                <div><i class="fas fa-cog"></i> <strong>Time Quantum:</strong> ${quantum}</div>
                <div><i class="fas fa-sliders-h"></i> <strong>EAH Threshold:</strong> ${threshold}</div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="exportComparisonCSV()" class="btn btn-secondary" style="padding: 0.5rem 1rem;">
                    <i class="fas fa-file-csv"></i> Export CSV
                </button>
                <button onclick="exportComparisonImage()" class="btn btn-secondary" style="padding: 0.5rem 1rem;">
                    <i class="fas fa-image"></i> Export Image
                </button>
            </div>
        </div>
    `;
    
    // Best Algorithm Summary
    html += `
        <div class="alert alert-success" style="margin-bottom: 2rem; padding: 2rem;">
            <div class="best-algorithm-header">
                <i class="fas fa-trophy"></i>
                <div class="best-algorithm-text">
                    <h2>Best Overall Algorithm</h2>
                    <p>Based on comprehensive analysis of all metrics including energy efficiency, turnaround time, waiting time, and context switches</p>
                </div>
            </div>
            <div class="best-algorithm-result">
                <h3>${bestAlgorithms.overall.name}</h3>
                <p>${bestAlgorithms.overall.reason}</p>
            </div>
        </div>
        
        <div class="best-metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div class="best-metric-card">
                <i class="fas fa-flag-checkered" style="color: var(--success);"></i>
                <h4>Fastest Completion</h4>
                <p>${bestAlgorithms.completion.name}</p>
                <span>${bestAlgorithms.completion.value} time units</span>
            </div>
            <div class="best-metric-card">
                <i class="fas fa-clock" style="color: var(--primary);"></i>
                <h4>Lowest Turnaround</h4>
                <p>${bestAlgorithms.turnaround.name}</p>
                <span>${bestAlgorithms.turnaround.value} time units</span>
            </div>
            <div class="best-metric-card">
                <i class="fas fa-hourglass-half" style="color: var(--info);"></i>
                <h4>Lowest Wait Time</h4>
                <p>${bestAlgorithms.waiting.name}</p>
                <span>${bestAlgorithms.waiting.value} time units</span>
            </div>
            <div class="best-metric-card">
                <i class="fas fa-bolt" style="color: var(--warning);"></i>
                <h4>Lowest Energy</h4>
                <p>${bestAlgorithms.energy.name}</p>
                <span>${bestAlgorithms.energy.value} units</span>
            </div>
            <div class="best-metric-card">
                <i class="fas fa-exchange-alt" style="color: #8b5cf6;"></i>
                <h4>Fewest Switches</h4>
                <p>${bestAlgorithms.switches.name}</p>
                <span>${bestAlgorithms.switches.value} switches</span>
            </div>
        </div>
    `;
    
    // Comparison cards
    html += '<h3 style="margin: 2rem 0 1rem 0;">Detailed Comparison</h3>';
    html += '<div class="comparison-grid">';
    
    Object.keys(comparisonData).forEach(algoKey => {
        const algo = comparisonData[algoKey];
        const isBest = algo.algorithm === bestAlgorithms.overall.name;
        
        if (algo.error) {
            html += `
                <div class="comparison-card">
                    <h3>${algoKey.toUpperCase().replace('_', ' ')}</h3>
                    <div class="alert alert-error">
                        <i class="fas fa-exclamation-circle"></i> ${algo.error}
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="comparison-card${isBest ? ' best-algorithm' : ''}">
                    ${isBest ? '<div class="best-badge"><i class="fas fa-crown"></i> Best Overall</div>' : ''}
                    <h3>${algo.algorithm}</h3>
                    <div class="comparison-metric${algo.algorithm === bestAlgorithms.completion.name ? ' metric-best' : ''}">
                        <span class="comparison-metric-label">Completion Time</span>
                        <span class="comparison-metric-value">${algo.completion_time}${algo.algorithm === bestAlgorithms.completion.name ? ' ⭐' : ''}</span>
                    </div>
                    <div class="comparison-metric${algo.algorithm === bestAlgorithms.turnaround.name ? ' metric-best' : ''}">
                        <span class="comparison-metric-label">Avg Turnaround Time</span>
                        <span class="comparison-metric-value">${algo.avg_turnaround}${algo.algorithm === bestAlgorithms.turnaround.name ? ' ⭐' : ''}</span>
                    </div>
                    <div class="comparison-metric${algo.algorithm === bestAlgorithms.waiting.name ? ' metric-best' : ''}">
                        <span class="comparison-metric-label">Avg Waiting Time</span>
                        <span class="comparison-metric-value">${algo.avg_waiting}${algo.algorithm === bestAlgorithms.waiting.name ? ' ⭐' : ''}</span>
                    </div>
                    <div class="comparison-metric${algo.algorithm === bestAlgorithms.energy.name ? ' metric-best' : ''}">
                        <span class="comparison-metric-label">Total Energy</span>
                        <span class="comparison-metric-value" style="color: var(--warning);">${algo.total_energy}${algo.algorithm === bestAlgorithms.energy.name ? ' ⭐' : ''}</span>
                    </div>
                    <div class="comparison-metric${algo.algorithm === bestAlgorithms.switches.name ? ' metric-best' : ''}">
                        <span class="comparison-metric-label">Context Switches</span>
                        <span class="comparison-metric-value">${algo.context_switches}${algo.algorithm === bestAlgorithms.switches.name ? ' ⭐' : ''}</span>
                    </div>
            `;
            
            // Add advanced metrics if available (inside the card)
            if (algo.advanced_metrics) {
                html += `
                    <div class="comparison-metric-advanced" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                        <h4 style="font-size: 0.9rem; margin-bottom: 0.75rem; color: var(--text-primary);">Advanced Metrics</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.85rem;">
                            <div style="padding: 0.5rem; background: var(--bg-tertiary); border-radius: 4px;">
                                <div style="color: var(--text-secondary); font-size: 0.75rem;">CPU Utilization</div>
                                <div style="font-weight: 600; color: var(--success);">${algo.advanced_metrics.cpu_utilization}%</div>
                            </div>
                            <div style="padding: 0.5rem; background: var(--bg-tertiary); border-radius: 4px;">
                                <div style="color: var(--text-secondary); font-size: 0.75rem;">Throughput</div>
                                <div style="font-weight: 600; color: var(--primary);">${algo.advanced_metrics.throughput}</div>
                            </div>
                            <div style="padding: 0.5rem; background: var(--bg-tertiary); border-radius: 4px;">
                                <div style="color: var(--text-secondary); font-size: 0.75rem;">Avg Response Time</div>
                                <div style="font-weight: 600; color: var(--info);">${algo.advanced_metrics.avg_response_time}</div>
                            </div>
                            <div style="padding: 0.5rem; background: var(--bg-tertiary); border-radius: 4px;">
                                <div style="color: var(--text-secondary); font-size: 0.75rem;">Fairness Index</div>
                                <div style="font-weight: 600; color: var(--warning);">${algo.advanced_metrics.fairness_index}</div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // Close the comparison card
            html += `
                </div>
            `;
        }
    });
    
    html += '</div>';
    
    // Gantt Charts Section
    html += '<h3 style="margin: 3rem 0 1rem 0;">Execution Timeline (Gantt Charts)</h3>';
    html += '<div class="gantt-comparison-container" style="display: grid; gap: 2rem; margin-bottom: 2rem;">';
    
    Object.keys(comparisonData).forEach(algoKey => {
        const algo = comparisonData[algoKey];
        if (!algo.error && algo.gantt) {
            const containerId = `gantt-${algoKey}`;
            html += `
                <div class="gantt-section" style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h4 style="margin: 0; color: var(--text-primary);">${algo.algorithm}</h4>
                        <button class="btn btn-secondary btn-sm animate-btn" data-algo="${algoKey}" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">
                            <i class="fas fa-play-circle"></i> Animate
                        </button>
                    </div>
                    <div id="${containerId}"></div>
                    <div id="animation-${algoKey}" style="display: none; margin-top: 1rem;"></div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    
    // Comparison chart
    html += '<div id="comparisonChart"></div>';
    
    html += '</div>';
    
    container.innerHTML = html;
    
    // Store comparison data globally for animation
    window.currentComparisonData = comparisonData;
    
    setTimeout(() => {
        renderComparisonChart(comparisonData, 'comparisonChart');
        
        // Render all Gantt charts
        Object.keys(comparisonData).forEach(algoKey => {
            const algo = comparisonData[algoKey];
            if (!algo.error && algo.gantt) {
                const containerId = `gantt-${algoKey}`;
                renderGanttChart(algo.gantt, containerId);
            }
        });
        
        // Attach animation button listeners
        document.querySelectorAll('.animate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const algoKey = e.currentTarget.getAttribute('data-algo');
                toggleAnimation(algoKey);
            });
        });
    }, 100);
}

/**
 * Toggle Animation View for an Algorithm
 */
function toggleAnimation(algoKey) {
    const animationContainer = document.getElementById(`animation-${algoKey}`);
    const ganttContainer = document.getElementById(`gantt-${algoKey}`);
    const btn = document.querySelector(`.animate-btn[data-algo="${algoKey}"]`);
    
    if (!animationContainer || !btn) return;
    
    const algo = window.currentComparisonData[algoKey];
    if (!algo || !algo.gantt || !algo.processes) return;
    
    if (animationContainer.style.display === 'none') {
        // Show animation
        animationContainer.style.display = 'block';
        ganttContainer.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-chart-bar"></i> Static View';
        
        // Initialize animation
        initializeAnimation(`animation-${algoKey}`, algo.gantt, algo.processes);
    } else {
        // Hide animation
        animationContainer.style.display = 'none';
        ganttContainer.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-play-circle"></i> Animate';
    }
}

/**
 * Determine Best Algorithms for Each Metric
 */
function determineBestAlgorithms(comparisonData) {
    const validAlgos = Object.values(comparisonData).filter(algo => !algo.error);
    
    if (validAlgos.length === 0) {
        return null;
    }
    
    // Find best for each metric
    const bestEnergy = validAlgos.reduce((min, algo) => 
        parseFloat(algo.total_energy) < parseFloat(min.total_energy) ? algo : min
    );
    
    const bestTurnaround = validAlgos.reduce((min, algo) => 
        parseFloat(algo.avg_turnaround) < parseFloat(min.avg_turnaround) ? algo : min
    );
    
    const bestWaiting = validAlgos.reduce((min, algo) => 
        parseFloat(algo.avg_waiting) < parseFloat(min.avg_waiting) ? algo : min
    );
    
    const bestSwitches = validAlgos.reduce((min, algo) => 
        algo.context_switches < min.context_switches ? algo : min
    );
    
    // Find best completion time
    const bestCompletion = validAlgos.reduce((min, algo) => 
        parseFloat(algo.completion_time) < parseFloat(min.completion_time) ? algo : min
    );
    
    // Calculate overall best with algorithm-specific weighted scoring
    // Different algorithms optimize for different goals:
    // - Time-based (FCFS, SJF, SRTF): Favor completion/turnaround/waiting (50% total)
    // - Energy-based (EAH): Favor energy + low switches (40% total)
    // - Fairness-based (RR): Penalize less for high switches, reward balanced turnaround
    // - Priority-based: Reward respecting priority order (via turnaround of high-priority tasks)
    
    const scores = validAlgos.map(algo => {
        const normalizedCompletion = parseFloat(algo.completion_time) / parseFloat(bestCompletion.completion_time);
        const normalizedTurnaround = parseFloat(algo.avg_turnaround) / parseFloat(bestTurnaround.avg_turnaround);
        const normalizedWaiting = parseFloat(algo.avg_waiting) / parseFloat(bestWaiting.avg_waiting);
        const normalizedEnergy = parseFloat(algo.total_energy) / parseFloat(bestEnergy.total_energy);
        const normalizedSwitches = algo.context_switches / (bestSwitches.context_switches || 1);
        
        // Algorithm-specific scoring weights
        let weights = { completion: 0.15, turnaround: 0.25, waiting: 0.25, energy: 0.20, switches: 0.15 };
        
        // Adjust weights based on algorithm type
        const algoName = algo.algorithm.toLowerCase();
        
        if (algoName.includes('round robin')) {
            // RR focuses on fairness (turnaround) and accepts higher switches
            weights = { completion: 0.10, turnaround: 0.40, waiting: 0.30, energy: 0.10, switches: 0.10 };
        } else if (algoName.includes('energy') || algoName.includes('eah')) {
            // EAH optimizes for energy and low switches
            weights = { completion: 0.10, turnaround: 0.20, waiting: 0.15, energy: 0.35, switches: 0.20 };
        } else if (algoName.includes('priority')) {
            // Priority focuses on respecting urgency (turnaround of important tasks)
            weights = { completion: 0.15, turnaround: 0.35, waiting: 0.20, energy: 0.15, switches: 0.15 };
        }
        
        const score = (normalizedCompletion * weights.completion) +
                     (normalizedTurnaround * weights.turnaround) + 
                     (normalizedWaiting * weights.waiting) + 
                     (normalizedEnergy * weights.energy) + 
                     (normalizedSwitches * weights.switches);
        
        return { algo, score };
    });
    
    // Find the best score with proper tie-breaking rules
    const overall = scores.reduce((best, current) => {
        const scoreDiff = Math.abs(current.score - best.score);
        
        // If scores are essentially equal (within 0.01), apply tie-breaking rules
        if (scoreDiff < 0.01) {
            // Tie-Breaker Rule #1: Lowest Energy Consumption (use raw values, not rounded)
            const energyDiff = Math.abs(parseFloat(current.algo.total_energy) - parseFloat(best.algo.total_energy));
            if (energyDiff > 0.001) {
                return parseFloat(current.algo.total_energy) < parseFloat(best.algo.total_energy) ? current : best;
            }
            
            // Tie-Breaker Rule #2: Lowest Context Switches
            if (current.algo.context_switches !== best.algo.context_switches) {
                return current.algo.context_switches < best.algo.context_switches ? current : best;
            }
            
            // Tie-Breaker Rule #3: Algorithm Simplicity
            // FCFS (6) > SJF Non-Preemptive (5) > Priority (4) > EAH (3) > Round Robin (2) > SRTF (1)
            const simplicityRanking = {
                'FCFS': 6,
                'SJF Non-Preemptive': 5,
                'Priority Scheduling (Non-Preemptive)': 4,
                'Energy-Aware Hybrid (EAH)': 3,
                'Round Robin (Quantum=2)': 2,
                'SJF Preemptive (SRTF)': 1,
                'Priority Scheduling (Preemptive)': 2
            };
            
            const currentSimplicity = simplicityRanking[current.algo.algorithm] || 0;
            const bestSimplicity = simplicityRanking[best.algo.algorithm] || 0;
            
            if (currentSimplicity !== bestSimplicity) {
                return currentSimplicity > bestSimplicity ? current : best;
            }
        }
        
        // Otherwise, pick the one with lower score
        return current.score < best.score ? current : best;
    }).algo;
    
    // Generate reason for overall best with detailed analysis of all 5 metrics
    let reason = '';
    let strengths = [];
    
    if (overall.algorithm === bestCompletion.algorithm) {
        strengths.push('fastest completion time (' + overall.completion_time + ' time units)');
    }
    if (overall.algorithm === bestTurnaround.algorithm) {
        strengths.push('lowest avg turnaround time (' + overall.avg_turnaround + ')');
    }
    if (overall.algorithm === bestWaiting.algorithm) {
        strengths.push('lowest avg waiting time (' + overall.avg_waiting + ')');
    }
    if (overall.algorithm === bestEnergy.algorithm) {
        strengths.push('lowest energy consumption (' + overall.total_energy + ' units)');
    }
    if (overall.algorithm === bestSwitches.algorithm) {
        strengths.push('fewest context switches (' + overall.context_switches + ')');
    }
    
    if (strengths.length >= 3) {
        reason = 'Dominates with ' + strengths.join(', ') + '. ';
    } else if (strengths.length > 0) {
        reason = 'Excels in ' + strengths.join(' and ') + ', while maintaining strong performance across other metrics. ';
    } else {
        reason = 'Achieves the best overall balance across all 5 core metrics: completion time, turnaround time, waiting time, energy consumption, and context switches. ';
    }
    
    // Add context-specific recommendation based on strengths
    const completionRank = validAlgos.filter(a => parseFloat(a.completion_time) < parseFloat(overall.completion_time)).length + 1;
    const energyRank = validAlgos.filter(a => parseFloat(a.total_energy) < parseFloat(overall.total_energy)).length + 1;
    const switchesRank = validAlgos.filter(a => a.context_switches < overall.context_switches).length + 1;
    
    // Check if this was a tie-breaking scenario
    const minScore = Math.min(...scores.map(s => s.score));
    const tiedAlgos = scores.filter(s => Math.abs(s.score - minScore) < 0.01);
    
    if (tiedAlgos.length > 1) {
        // Multiple algorithms tied - tie-breaking was used
        if (energyRank === 1) {
            reason += 'Won due to lowest energy consumption in tie-breaking (Rule #1). ';
        } else if (switchesRank === 1) {
            reason += 'Won due to fewest context switches in tie-breaking (Rule #2). ';
        } else {
            reason += 'Won due to algorithm simplicity in tie-breaking (Rule #3) - simpler algorithms have less overhead and are more predictable. ';
        }
        reason += 'When performance metrics are equal, energy efficiency, minimal context switching, and algorithmic simplicity determine the winner.';
    } else if (energyRank === 1 && switchesRank === 1) {
        reason += 'Ideal for battery-powered mobile and embedded devices where energy efficiency is paramount.';
    } else if (completionRank === 1 || (overall.algorithm === bestTurnaround.algorithm && overall.algorithm === bestWaiting.algorithm)) {
        reason += 'Perfect for high-performance systems where speed and responsiveness are critical.';
    } else if (switchesRank === 1) {
        reason += 'Excellent for systems where minimizing overhead and maintaining stability are important.';
    } else {
        reason += 'Great all-around choice for general-purpose computing with balanced requirements.';
    }
    
    return {
        overall: {
            name: overall.algorithm,
            reason: reason
        },
        completion: {
            name: bestCompletion.algorithm,
            value: bestCompletion.completion_time
        },
        turnaround: {
            name: bestTurnaround.algorithm,
            value: bestTurnaround.avg_turnaround
        },
        waiting: {
            name: bestWaiting.algorithm,
            value: bestWaiting.avg_waiting
        },
        energy: {
            name: bestEnergy.algorithm,
            value: bestEnergy.total_energy
        },
        switches: {
            name: bestSwitches.algorithm,
            value: bestSwitches.context_switches
        }
    };
}

/**
 * Export Results
 */
function exportResults() {
    if (!currentResults) {
        showAlert('No results to export', 'error');
        return;
    }
    
    const dataStr = JSON.stringify(currentResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scheduler_results_${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showAlert('Results exported successfully!', 'success');
}

/**
 * Export Comparison as CSV
 */
function exportComparisonCSV() {
    const compareContent = document.getElementById('compareContent');
    if (!compareContent || compareContent.innerHTML === '') {
        showAlert('No comparison data to export', 'error');
        return;
    }

    // Get all algorithm data from the comparison cards
    const comparisonCards = compareContent.querySelectorAll('.comparison-card:not(.best-algorithm)');
    
    let csv = 'Algorithm,Completion Time,Avg Turnaround,Avg Waiting,Total Energy,Context Switches\n';
    
    comparisonCards.forEach(card => {
        const algorithm = card.querySelector('h3')?.textContent || '';
        const metrics = card.querySelectorAll('.comparison-metric-value');
        if (metrics.length >= 5) {
            const values = Array.from(metrics).map(m => m.textContent.replace(' ⭐', '').trim());
            csv += `"${algorithm}",${values.join(',')}\n`;
        }
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comparison_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    showAlert('CSV exported successfully!', 'success');
}

/**
 * Export Comparison as Image
 */
async function exportComparisonImage() {
    const compareContent = document.getElementById('compareContent');
    if (!compareContent || compareContent.innerHTML === '') {
        showAlert('No comparison data to export', 'error');
        return;
    }

    try {
        // Use html2canvas library (need to add script tag)
        if (typeof html2canvas === 'undefined') {
            showAlert('Export feature requires additional library. Downloading screenshot manually...', 'info');
            // Fallback: Open print dialog
            window.print();
            return;
        }
        
        const canvas = await html2canvas(compareContent);
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `comparison_${Date.now()}.png`;
            link.click();
            URL.revokeObjectURL(url);
            showAlert('Image exported successfully!', 'success');
        });
    } catch (error) {
        showAlert('Error exporting image. Try using browser Print instead.', 'error');
        console.error(error);
    }
}

/**
 * UI Utilities
 */
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    // Insert at top of container
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alertDiv.style.transition = 'opacity 0.5s';
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 500);
    }, 5000);
}

function showLoading(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    
    overlay.innerHTML = `
        <div style="text-align: center;">
            <div class="loading" style="margin: 0 auto 1rem;"></div>
            <p style="color: var(--text-primary); font-size: 1.1rem;">${message}</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

/**
 * Handle CSV File Upload for Batch Testing
 */
function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
        showAlert('Please upload a CSV file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvContent = e.target.result;
            parseAndRunBatchTests(csvContent);
        } catch (error) {
            showAlert('Error reading CSV file: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

/**
 * Parse CSV and Run Batch Tests
 * CSV Format: Each scenario separated by blank line
 * Columns: pid,arrival,burst,priority
 */
function parseAndRunBatchTests(csvContent) {
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 0) {
        showAlert('CSV file is empty', 'error');
        return;
    }
    
    // Parse scenarios (separated by blank lines or scenario markers)
    const scenarios = [];
    let currentScenario = [];
    let scenarioName = `Scenario ${scenarios.length + 1}`;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for scenario name comment
        if (line.startsWith('#') || line.startsWith('//')) {
            if (currentScenario.length > 0) {
                scenarios.push({ name: scenarioName, processes: currentScenario });
                currentScenario = [];
            }
            scenarioName = line.replace(/^[#\/]+\s*/, '').trim() || `Scenario ${scenarios.length + 1}`;
            continue;
        }
        
        // Skip header row
        if (line.toLowerCase().includes('pid') && line.toLowerCase().includes('arrival')) {
            continue;
        }
        
        // Parse process line
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 3) {
            const process = {
                pid: parseInt(parts[0]) || currentScenario.length + 1,
                arrival: parseInt(parts[1]) || 0,
                burst: parseInt(parts[2]) || 1,
                priority: parts[3] ? parseInt(parts[3]) : 3
            };
            
            if (process.burst > 0) {
                currentScenario.push(process);
            }
        }
    }
    
    // Add last scenario
    if (currentScenario.length > 0) {
        scenarios.push({ name: scenarioName, processes: currentScenario });
    }
    
    if (scenarios.length === 0) {
        showAlert('No valid processes found in CSV', 'error');
        return;
    }
    
    // Run batch tests
    runBatchTests(scenarios);
}

/**
 * Run Batch Tests on Multiple Scenarios
 */
async function runBatchTests(scenarios) {
    showLoading(`Running batch tests on ${scenarios.length} scenarios...`);
    
    const batchResults = [];
    const quantum = parseInt(document.getElementById('quantum').value) || 2;
    const thresholdInput = document.getElementById('threshold').value;
    const threshold = thresholdInput ? parseFloat(thresholdInput) : null;
    
    try {
        for (let i = 0; i < scenarios.length; i++) {
            const scenario = scenarios[i];
            showLoading(`Testing scenario ${i + 1}/${scenarios.length}: ${scenario.name}...`);
            
            const result = await compareAlgorithms(scenario.processes, quantum, threshold);
            
            // Determine best algorithm
            const bestAlgos = determineBestAlgorithms(result);
            
            batchResults.push({
                scenario: scenario.name,
                processCount: scenario.processes.length,
                results: result,
                bestOverall: bestAlgos ? bestAlgos.overall.name : 'N/A',
                bestCompletion: bestAlgos ? bestAlgos.completion.name : 'N/A',
                bestEnergy: bestAlgos ? bestAlgos.energy.name : 'N/A',
                bestTurnaround: bestAlgos ? bestAlgos.turnaround.name : 'N/A'
            });
        }
        
        hideLoading();
        displayBatchResults(batchResults);
        
    } catch (error) {
        hideLoading();
        showAlert('Error during batch testing: ' + error.message, 'error');
    }
}

/**
 * Display Batch Test Results
 */
function displayBatchResults(batchResults) {
    const container = document.getElementById('resultsContent');
    if (!container) return;
    
    let html = `
        <div class="batch-results-container" style="padding: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <h2><i class="fas fa-chart-bar"></i> Batch Test Results</h2>
                    <p style="color: var(--text-secondary); margin-top: 0.5rem;">
                        Tested ${batchResults.length} scenarios
                    </p>
                </div>
                <button class="btn btn-primary" onclick="exportBatchResultsCSV()">
                    <i class="fas fa-download"></i> Export Summary
                </button>
            </div>
            
            <!-- Summary Statistics -->
            <div class="summary-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
    `;
    
    // Calculate algorithm win counts
    const winCounts = {};
    batchResults.forEach(result => {
        const algo = result.bestOverall;
        winCounts[algo] = (winCounts[algo] || 0) + 1;
    });
    
    const sortedAlgos = Object.entries(winCounts).sort((a, b) => b[1] - a[1]);
    
    html += `
        <div class="stat-card" style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">${batchResults.length}</div>
            <div style="color: var(--text-secondary); font-size: 0.9rem;">Total Scenarios</div>
        </div>
    `;
    
    if (sortedAlgos.length > 0) {
        html += `
            <div class="stat-card" style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color);">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--success);">${sortedAlgos[0][0]}</div>
                <div style="color: var(--text-secondary); font-size: 0.9rem;">Most Wins (${sortedAlgos[0][1]})</div>
            </div>
        `;
    }
    
    const totalProcesses = batchResults.reduce((sum, r) => sum + r.processCount, 0);
    html += `
        <div class="stat-card" style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="font-size: 2rem; font-weight: 700; color: var(--info);">${totalProcesses}</div>
            <div style="color: var(--text-secondary); font-size: 0.9rem;">Total Processes Tested</div>
        </div>
    `;
    
    html += '</div>';
    
    // Results Table
    html += `
        <div style="overflow-x: auto;">
            <table class="batch-results-table" style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                <thead style="background: var(--bg-tertiary);">
                    <tr>
                        <th style="padding: 0.75rem; text-align: left; border: 1px solid var(--border-color);">#</th>
                        <th style="padding: 0.75rem; text-align: left; border: 1px solid var(--border-color);">Scenario Name</th>
                        <th style="padding: 0.75rem; text-align: center; border: 1px solid var(--border-color);">Processes</th>
                        <th style="padding: 0.75rem; text-align: center; border: 1px solid var(--border-color);">Best Overall</th>
                        <th style="padding: 0.75rem; text-align: center; border: 1px solid var(--border-color);">Best Completion</th>
                        <th style="padding: 0.75rem; text-align: center; border: 1px solid var(--border-color);">Best Energy</th>
                        <th style="padding: 0.75rem; text-align: center; border: 1px solid var(--border-color);">Best Turnaround</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    batchResults.forEach((result, index) => {
        html += `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.75rem; border: 1px solid var(--border-color);">${index + 1}</td>
                <td style="padding: 0.75rem; border: 1px solid var(--border-color); font-weight: 600;">${result.scenario}</td>
                <td style="padding: 0.75rem; text-align: center; border: 1px solid var(--border-color);">${result.processCount}</td>
                <td style="padding: 0.75rem; text-align: center; border: 1px solid var(--border-color); color: var(--success); font-weight: 600;">
                    <i class="fas fa-crown"></i> ${result.bestOverall}
                </td>
                <td style="padding: 0.75rem; text-align: center; border: 1px solid var(--border-color);">${result.bestCompletion}</td>
                <td style="padding: 0.75rem; text-align: center; border: 1px solid var(--border-color);">${result.bestEnergy}</td>
                <td style="padding: 0.75rem; text-align: center; border: 1px solid var(--border-color);">${result.bestTurnaround}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        
        <!-- Algorithm Win Distribution -->
        <div style="margin-top: 2rem;">
            <h3 style="margin-bottom: 1rem;">Algorithm Performance Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
    `;
    
    sortedAlgos.forEach(([algo, count]) => {
        const percentage = ((count / batchResults.length) * 100).toFixed(1);
        html += `
            <div class="algo-win-card" style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
                <div style="font-weight: 600; margin-bottom: 0.5rem;">${algo}</div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="flex: 1; height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; background: var(--primary); width: ${percentage}%;"></div>
                    </div>
                    <span style="font-size: 0.85rem; color: var(--text-secondary);">${count} (${percentage}%)</span>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
        
        <div style="margin-top: 2rem; padding: 1rem; background: var(--bg-tertiary); border-radius: 8px; border-left: 3px solid var(--info);">
            <strong>💡 Tip:</strong> CSV format for batch testing:<br>
            <code style="display: block; margin-top: 0.5rem; padding: 0.5rem; background: var(--bg-secondary); border-radius: 4px; font-size: 0.85rem;">
                # Scenario Name<br>
                pid,arrival,burst,priority<br>
                1,0,5,2<br>
                2,1,3,1<br>
                <br>
                # Another Scenario<br>
                pid,arrival,burst,priority<br>
                1,0,8,3<br>
                2,2,4,2
            </code>
        </div>
    </div>
    `;
    
    container.innerHTML = html;
    
    // Store results for export
    window.currentBatchResults = batchResults;
    
    // Show results
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
}

/**
 * Export Batch Results as CSV
 */
function exportBatchResultsCSV() {
    if (!window.currentBatchResults) {
        showAlert('No batch results to export', 'error');
        return;
    }
    
    let csv = 'Scenario,Processes,Best Overall,Best Completion,Best Energy,Best Turnaround\n';
    
    window.currentBatchResults.forEach(result => {
        csv += `"${result.scenario}",${result.processCount},"${result.bestOverall}","${result.bestCompletion}","${result.bestEnergy}","${result.bestTurnaround}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch_test_results_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    showAlert('Batch results exported successfully!', 'success');
}

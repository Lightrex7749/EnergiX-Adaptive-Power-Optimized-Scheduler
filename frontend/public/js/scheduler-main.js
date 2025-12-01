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
 * Sample Workloads
 */
const sampleWorkloads = {
    light: {
        name: 'Light Load - Favors FCFS',
        description: 'Sequential arrivals with similar burst times - Best for FCFS',
        processes: [
            { pid: 1, arrival: 0, burst: 5, priority: 2 },
            { pid: 2, arrival: 1, burst: 4, priority: 2 },
            { pid: 3, arrival: 2, burst: 6, priority: 2 },
            { pid: 4, arrival: 3, burst: 5, priority: 2 }
        ]
    },
    medium: {
        name: 'Interactive Workload - Favors Round Robin',
        description: 'Multiple processes arriving together - Best for Round Robin fairness',
        processes: [
            { pid: 1, arrival: 0, burst: 10, priority: 2 },
            { pid: 2, arrival: 0, burst: 8, priority: 2 },
            { pid: 3, arrival: 0, burst: 12, priority: 2 },
            { pid: 4, arrival: 1, burst: 9, priority: 2 },
            { pid: 5, arrival: 1, burst: 11, priority: 2 },
            { pid: 6, arrival: 2, burst: 7, priority: 2 }
        ]
    },
    heavy: {
        name: 'Mixed Burst Times - Favors SJF/SRTF',
        description: 'Short and long tasks arriving close together - Best for SJF algorithms',
        processes: [
            { pid: 1, arrival: 0, burst: 15, priority: 2 },
            { pid: 2, arrival: 0, burst: 2, priority: 2 },
            { pid: 3, arrival: 1, burst: 20, priority: 2 },
            { pid: 4, arrival: 1, burst: 3, priority: 2 },
            { pid: 5, arrival: 2, burst: 18, priority: 2 },
            { pid: 6, arrival: 2, burst: 1, priority: 2 },
            { pid: 7, arrival: 3, burst: 4, priority: 2 },
            { pid: 8, arrival: 3, burst: 16, priority: 2 }
        ]
    },
    mixed: {
        name: 'Priority-Critical Tasks - Favors Priority Scheduling',
        description: 'Urgent high-priority tasks mixed with background jobs',
        processes: [
            { pid: 1, arrival: 0, burst: 10, priority: 3 },
            { pid: 2, arrival: 0, burst: 4, priority: 1 },
            { pid: 3, arrival: 1, burst: 8, priority: 3 },
            { pid: 4, arrival: 1, burst: 3, priority: 1 },
            { pid: 5, arrival: 2, burst: 12, priority: 2 },
            { pid: 6, arrival: 3, burst: 2, priority: 1 },
            { pid: 7, arrival: 4, burst: 15, priority: 3 },
            { pid: 8, arrival: 5, burst: 5, priority: 1 }
        ]
    },
    io_intensive: {
        name: 'I/O Intensive - Favors SRTF',
        description: 'Short bursts with frequent arrivals - Best for preemptive SJF',
        processes: [
            { pid: 1, arrival: 0, burst: 3, priority: 2 },
            { pid: 2, arrival: 1, burst: 1, priority: 2 },
            { pid: 3, arrival: 2, burst: 2, priority: 2 },
            { pid: 4, arrival: 3, burst: 1, priority: 2 },
            { pid: 5, arrival: 4, burst: 3, priority: 2 },
            { pid: 6, arrival: 5, burst: 2, priority: 2 },
            { pid: 7, arrival: 6, burst: 1, priority: 2 },
            { pid: 8, arrival: 7, burst: 2, priority: 2 }
        ]
    },
    cpu_intensive: {
        name: 'CPU Bound - Favors EAH',
        description: 'Long-running tasks with minimal context switches - Best for Energy-Aware Hybrid',
        processes: [
            { pid: 1, arrival: 0, burst: 20, priority: 2 },
            { pid: 2, arrival: 1, burst: 18, priority: 2 },
            { pid: 3, arrival: 2, burst: 25, priority: 2 },
            { pid: 4, arrival: 3, burst: 22, priority: 2 },
            { pid: 5, arrival: 4, burst: 15, priority: 2 }
        ]
    },
    realtime: {
        name: 'Energy-Efficient Scenario - Favors EAH',
        description: 'Mix of short and long tasks - Best for Energy-Aware Hybrid with DVFS',
        processes: [
            { pid: 1, arrival: 0, burst: 3, priority: 2 },
            { pid: 2, arrival: 0, burst: 15, priority: 2 },
            { pid: 3, arrival: 1, burst: 2, priority: 2 },
            { pid: 4, arrival: 2, burst: 18, priority: 2 },
            { pid: 5, arrival: 3, burst: 4, priority: 2 },
            { pid: 6, arrival: 4, burst: 20, priority: 2 },
            { pid: 7, arrival: 5, burst: 1, priority: 2 }
        ]
    }
};

function loadSelectedSample() {
    const select = document.getElementById('sampleSelect');
    const sampleKey = select.value;
    
    if (!sampleKey) {
        return;
    }
    
    const sample = sampleWorkloads[sampleKey];
    
    clearProcesses();
    processIdCounter = 1;
    
    sample.processes.forEach(p => {
        addProcessRow(p);
        processIdCounter = Math.max(processIdCounter, p.pid + 1);
    });
    
    showAlert(`${sample.name} loaded: ${sample.description}`, 'success');
    
    // Reset dropdown
    select.value = '';
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
    
    try {
        showLoading('Comparing all algorithms...');
        
        const comparisonData = await API.compareAlgorithms(processes, quantum);
        
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
    
    // Best Algorithm Summary
    html += `
        <div class="alert alert-success" style="margin-bottom: 2rem; padding: 2rem;">
            <div class="best-algorithm-header">
                <i class="fas fa-trophy"></i>
                <div class="best-algorithm-text">
                    <h2>🏆 Best Overall Algorithm</h2>
                    <p>Based on comprehensive analysis of all metrics including energy efficiency, turnaround time, waiting time, and context switches</p>
                </div>
            </div>
            <div class="best-algorithm-result">
                <h3>${bestAlgorithms.overall.name}</h3>
                <p>${bestAlgorithms.overall.reason}</p>
            </div>
        </div>
        
        <div class="best-metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div class="best-metric-card">
                <i class="fas fa-bolt" style="color: var(--warning);"></i>
                <h4>Lowest Energy</h4>
                <p>${bestAlgorithms.energy.name}</p>
                <span>${bestAlgorithms.energy.value} units</span>
            </div>
            <div class="best-metric-card">
                <i class="fas fa-clock" style="color: var(--primary);"></i>
                <h4>Fastest Completion</h4>
                <p>${bestAlgorithms.turnaround.name}</p>
                <span>${bestAlgorithms.turnaround.value} time units</span>
            </div>
            <div class="best-metric-card">
                <i class="fas fa-hourglass-half" style="color: var(--success);"></i>
                <h4>Lowest Wait Time</h4>
                <p>${bestAlgorithms.waiting.name}</p>
                <span>${bestAlgorithms.waiting.value} time units</span>
            </div>
            <div class="best-metric-card">
                <i class="fas fa-exchange-alt" style="color: var(--info);"></i>
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
                    <div class="comparison-metric${algo.algorithm === bestAlgorithms.turnaround.name ? ' metric-best' : ''}">
                        <span class="comparison-metric-label">Avg Turnaround Time</span>
                        <span class="comparison-metric-value">${algo.avg_turnaround}${algo.algorithm === bestAlgorithms.turnaround.name ? ' ⭐' : ''}</span>
                    </div>
                    <div class="comparison-metric${algo.algorithm === bestAlgorithms.waiting.name ? ' metric-best' : ''}">
                        <span class="comparison-metric-label">Avg Waiting Time</span>
                        <span class="comparison-metric-value">${algo.avg_waiting}${algo.algorithm === bestAlgorithms.waiting.name ? ' ⭐' : ''}</span>
                    </div>
                    <div class="comparison-metric${algo.algorithm === bestAlgorithms.switches.name ? ' metric-best' : ''}">
                        <span class="comparison-metric-label">Context Switches</span>
                        <span class="comparison-metric-value">${algo.context_switches}${algo.algorithm === bestAlgorithms.switches.name ? ' ⭐' : ''}</span>
                    </div>
                    <div class="comparison-metric${algo.algorithm === bestAlgorithms.energy.name ? ' metric-best' : ''}">
                        <span class="comparison-metric-label">Total Energy</span>
                        <span class="comparison-metric-value" style="color: var(--warning);">${algo.total_energy}${algo.algorithm === bestAlgorithms.energy.name ? ' ⭐' : ''}</span>
                    </div>
                    <div class="comparison-metric">
                        <span class="comparison-metric-label">Completion Time</span>
                        <span class="comparison-metric-value">${algo.completion_time}</span>
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    
    // Comparison chart
    html += '<div id="comparisonChart"></div>';
    
    html += '</div>';
    
    container.innerHTML = html;
    
    setTimeout(() => {
        renderComparisonChart(comparisonData, 'comparisonChart');
    }, 100);
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
    
    // Calculate overall best using balanced scoring with penalties
    // Energy: 35%, Turnaround: 20%, Waiting: 20%, Switches: 25%
    // Higher weight on switches to penalize excessive context switching
    const scores = validAlgos.map(algo => {
        const normalizedEnergy = parseFloat(algo.total_energy) / parseFloat(bestEnergy.total_energy);
        const normalizedTurnaround = parseFloat(algo.avg_turnaround) / parseFloat(bestTurnaround.avg_turnaround);
        const normalizedWaiting = parseFloat(algo.avg_waiting) / parseFloat(bestWaiting.avg_waiting);
        const normalizedSwitches = algo.context_switches / (bestSwitches.context_switches || 1);
        
        // Composite score with balanced weights
        const score = (normalizedEnergy * 0.35) + 
                     (normalizedTurnaround * 0.20) + 
                     (normalizedWaiting * 0.20) + 
                     (normalizedSwitches * 0.25);
        
        return { algo, score };
    });
    
    const overall = scores.reduce((best, current) => 
        current.score < best.score ? current : best
    ).algo;
    
    // Generate reason for overall best with detailed analysis
    let reason = '';
    let strengths = [];
    
    if (overall.algorithm === bestEnergy.algorithm) {
        strengths.push('lowest energy consumption (' + overall.total_energy + ' units)');
    }
    if (overall.algorithm === bestTurnaround.algorithm) {
        strengths.push('fastest average turnaround time (' + overall.avg_turnaround + ' time units)');
    }
    if (overall.algorithm === bestWaiting.algorithm) {
        strengths.push('minimal average waiting time (' + overall.avg_waiting + ' time units)');
    }
    if (overall.algorithm === bestSwitches.algorithm) {
        strengths.push('fewest context switches (' + overall.context_switches + ')');
    }
    
    if (strengths.length > 0) {
        reason = 'This algorithm excels with ' + strengths.join(', ') + '. ';
    } else {
        reason = 'This algorithm achieves the best overall balance across all performance metrics. ';
    }
    
    // Add context-specific recommendation
    const energyRank = validAlgos.filter(a => parseFloat(a.total_energy) < parseFloat(overall.total_energy)).length + 1;
    const switchesRank = validAlgos.filter(a => a.context_switches < overall.context_switches).length + 1;
    
    if (energyRank === 1 && switchesRank === 1) {
        reason += 'Optimal for battery-powered and mobile devices where energy efficiency is critical.';
    } else if (overall.algorithm === bestTurnaround.algorithm || overall.algorithm === bestWaiting.algorithm) {
        reason += 'Best choice when minimizing response time and maximizing throughput are priorities.';
    } else {
        reason += 'Provides excellent balance between performance and resource efficiency for general-purpose systems.';
    }
    
    return {
        overall: {
            name: overall.algorithm,
            reason: reason
        },
        energy: {
            name: bestEnergy.algorithm,
            value: bestEnergy.total_energy
        },
        turnaround: {
            name: bestTurnaround.algorithm,
            value: bestTurnaround.avg_turnaround
        },
        waiting: {
            name: bestWaiting.algorithm,
            value: bestWaiting.avg_waiting
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

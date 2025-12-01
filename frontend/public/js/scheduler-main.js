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
 * Sample Workloads - Each designed to showcase a specific algorithm's strength
 */
const sampleWorkloads = {
    light: {
        name: 'Default Mix',
        description: 'General test case with varied arrival times and bursts',
        processes: [
            { pid: 1, arrival: 0, burst: 8, priority: 2 },
            { pid: 2, arrival: 1, burst: 4, priority: 3 },
            { pid: 3, arrival: 2, burst: 9, priority: 1 },
            { pid: 4, arrival: 3, burst: 5, priority: 2 }
        ]
    },
    medium: {
        name: 'Long Jobs First - FCFS Wins',
        description: 'Processes arrive in optimal order for FCFS - no reordering needed',
        processes: [
            { pid: 1, arrival: 0, burst: 3, priority: 2 },
            { pid: 2, arrival: 1, burst: 6, priority: 2 },
            { pid: 3, arrival: 2, burst: 9, priority: 2 },
            { pid: 4, arrival: 3, burst: 12, priority: 2 }
        ]
    },
    heavy: {
        name: 'Shortest First - SJF Wins',
        description: 'Mix of very short and very long jobs - SJF minimizes waiting dramatically',
        processes: [
            { pid: 1, arrival: 0, burst: 20, priority: 2 },
            { pid: 2, arrival: 0, burst: 1, priority: 2 },
            { pid: 3, arrival: 0, burst: 15, priority: 2 },
            { pid: 4, arrival: 0, burst: 2, priority: 2 },
            { pid: 5, arrival: 1, burst: 18, priority: 2 },
            { pid: 6, arrival: 1, burst: 1, priority: 2 }
        ]
    },
    mixed: {
        name: 'Urgent Tasks - Priority Wins',
        description: 'Critical high-priority tasks must preempt low-priority background work',
        processes: [
            { pid: 1, arrival: 0, burst: 8, priority: 5 },
            { pid: 2, arrival: 0, burst: 12, priority: 5 },
            { pid: 3, arrival: 1, burst: 2, priority: 1 },
            { pid: 4, arrival: 2, burst: 4, priority: 1 },
            { pid: 5, arrival: 3, burst: 3, priority: 1 },
            { pid: 6, arrival: 4, burst: 10, priority: 4 }
        ]
    },
    io_intensive: {
        name: 'Preemptive Advantage - SRTF Wins',
        description: 'Long job interrupted by short jobs - preemption saves huge waiting time',
        processes: [
            { pid: 1, arrival: 0, burst: 10, priority: 2 },
            { pid: 2, arrival: 2, burst: 1, priority: 2 },
            { pid: 3, arrival: 3, burst: 1, priority: 2 },
            { pid: 4, arrival: 4, burst: 1, priority: 2 },
            { pid: 5, arrival: 5, burst: 1, priority: 2 },
            { pid: 6, arrival: 6, burst: 1, priority: 2 }
        ]
    },
    cpu_intensive: {
        name: 'Energy Saver - EAH Wins',
        description: 'Mix of short and long tasks - EAH hybrid approach minimizes energy with fewer switches',
        processes: [
            { pid: 1, arrival: 0, burst: 2, priority: 2 },
            { pid: 2, arrival: 0, burst: 18, priority: 2 },
            { pid: 3, arrival: 1, burst: 3, priority: 2 },
            { pid: 4, arrival: 2, burst: 20, priority: 2 },
            { pid: 5, arrival: 3, burst: 1, priority: 2 },
            { pid: 6, arrival: 4, burst: 15, priority: 2 }
        ]
    },
    realtime: {
        name: 'Time Slice Fairness - RR Wins',
        description: 'Short equal bursts arriving continuously - Round Robin provides best average response',
        processes: [
            { pid: 1, arrival: 0, burst: 5, priority: 2 },
            { pid: 2, arrival: 0, burst: 5, priority: 2 },
            { pid: 3, arrival: 1, burst: 5, priority: 2 },
            { pid: 4, arrival: 1, burst: 5, priority: 2 },
            { pid: 5, arrival: 2, burst: 5, priority: 2 },
            { pid: 6, arrival: 2, burst: 5, priority: 2 }
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
    
    // Find best completion time
    const bestCompletion = validAlgos.reduce((min, algo) => 
        parseFloat(algo.completion_time) < parseFloat(min.completion_time) ? algo : min
    );
    
    // Calculate overall best by comparing 5 core metrics (all equally weighted at 20% each)
    // 1. Completion Time (20%) - Lower is better
    // 2. Average Turnaround Time (20%) - Lower is better  
    // 3. Average Waiting Time (20%) - Lower is better
    // 4. Energy Consumption (20%) - Lower is better
    // 5. Context Switches (20%) - Lower is better
    const scores = validAlgos.map(algo => {
        const normalizedCompletion = parseFloat(algo.completion_time) / parseFloat(bestCompletion.completion_time);
        const normalizedTurnaround = parseFloat(algo.avg_turnaround) / parseFloat(bestTurnaround.avg_turnaround);
        const normalizedWaiting = parseFloat(algo.avg_waiting) / parseFloat(bestWaiting.avg_waiting);
        const normalizedEnergy = parseFloat(algo.total_energy) / parseFloat(bestEnergy.total_energy);
        const normalizedSwitches = algo.context_switches / (bestSwitches.context_switches || 1);
        
        // Equal weight for all 5 metrics (20% each)
        const score = (normalizedCompletion * 0.20) +
                     (normalizedTurnaround * 0.20) + 
                     (normalizedWaiting * 0.20) + 
                     (normalizedEnergy * 0.20) + 
                     (normalizedSwitches * 0.20);
        
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

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

function loadSample() {
    clearProcesses();
    processIdCounter = 1;
    
    const sampleProcesses = [
        { pid: 1, arrival: 0, burst: 3, priority: 1 },
        { pid: 2, arrival: 0, burst: 9, priority: 2 },
        { pid: 3, arrival: 1, burst: 2, priority: 1 },
        { pid: 4, arrival: 2, burst: 12, priority: 3 },
        { pid: 5, arrival: 3, burst: 4, priority: 2 },
        { pid: 6, arrival: 4, burst: 1, priority: 1 }
    ];
    
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
    
    let html = '<div class="comparison-container">';
    
    // Comparison cards
    html += '<div class="comparison-grid">';
    
    Object.keys(comparisonData).forEach(algoKey => {
        const algo = comparisonData[algoKey];
        
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
                <div class="comparison-card">
                    <h3>${algo.algorithm}</h3>
                    <div class="comparison-metric">
                        <span class="comparison-metric-label">Avg Turnaround Time</span>
                        <span class="comparison-metric-value">${algo.avg_turnaround}</span>
                    </div>
                    <div class="comparison-metric">
                        <span class="comparison-metric-label">Avg Waiting Time</span>
                        <span class="comparison-metric-value">${algo.avg_waiting}</span>
                    </div>
                    <div class="comparison-metric">
                        <span class="comparison-metric-label">Context Switches</span>
                        <span class="comparison-metric-value">${algo.context_switches}</span>
                    </div>
                    <div class="comparison-metric">
                        <span class="comparison-metric-label">Total Energy</span>
                        <span class="comparison-metric-value" style="color: var(--warning);">${algo.total_energy}</span>
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

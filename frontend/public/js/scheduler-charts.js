/**
 * Chart.js Visualization Module
 * Renders energy and performance charts
 */

let powerChart = null;
let frequencyChart = null;
let energyComparisonChart = null;

function renderEnergyCharts(energyData, containerId = 'energyCharts') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Render energy summary
    let html = '<div class="energy-summary">';
    html += '<div class="metrics-grid">';
    
    html += `
        <div class="metric-card">
            <div class="metric-label"><i class="fas fa-bolt"></i> Total Energy</div>
            <div class="metric-value" style="color: #f59e0b;">${energyData.total_energy}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">Energy Units</div>
        </div>
    `;
    
    html += `
        <div class="metric-card">
            <div class="metric-label"><i class="fas fa-fire"></i> Busy Energy</div>
            <div class="metric-value" style="color: #ef4444;">${energyData.busy_energy}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">Energy Units</div>
        </div>
    `;
    
    html += `
        <div class="metric-card">
            <div class="metric-label"><i class="fas fa-moon"></i> Idle Energy</div>
            <div class="metric-value" style="color: #64748b;">${energyData.idle_energy}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">Energy Units</div>
        </div>
    `;
    
    html += `
        <div class="metric-card">
            <div class="metric-label"><i class="fas fa-exchange-alt"></i> Context Switch Energy</div>
            <div class="metric-value" style="color: #8b5cf6;">${energyData.context_switch_energy}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">Energy Units</div>
        </div>
    `;
    
    html += `
        <div class="metric-card">
            <div class="metric-label"><i class="fas fa-tachometer-alt"></i> Avg Power</div>
            <div class="metric-value" style="color: #10b981;">${energyData.avg_power}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">Power Units/Time</div>
        </div>
    `;
    
    html += '</div></div>';
    
    // DVFS Parameters
    html += '<div class="energy-params">';
    html += '<h3 style="grid-column: 1 / -1; margin-bottom: 1rem;"><i class="fas fa-cog"></i> DVFS Parameters</h3>';
    
    const params = energyData.parameters;
    html += `<div class="param-item"><span class="param-label">HIGH Frequency:</span><span class="param-value">${params.freq_high}</span></div>`;
    html += `<div class="param-item"><span class="param-label">MED Frequency:</span><span class="param-value">${params.freq_med}</span></div>`;
    html += `<div class="param-item"><span class="param-label">LOW Frequency:</span><span class="param-value">${params.freq_low}</span></div>`;
    html += `<div class="param-item"><span class="param-label">HIGH Power:</span><span class="param-value">${params.power_high}</span></div>`;
    html += `<div class="param-item"><span class="param-label">MED Power:</span><span class="param-value">${params.power_med}</span></div>`;
    html += `<div class="param-item"><span class="param-label">LOW Power:</span><span class="param-value">${params.power_low}</span></div>`;
    html += `<div class="param-item"><span class="param-label">IDLE Power:</span><span class="param-value">${params.power_idle}</span></div>`;
    html += `<div class="param-item"><span class="param-label">Context Switch Penalty:</span><span class="param-value">${params.context_switch_penalty}</span></div>`;
    html += `<div class="param-item"><span class="param-label">Utilization Threshold (High):</span><span class="param-value">${params.util_threshold_high}</span></div>`;
    html += `<div class="param-item"><span class="param-label">Utilization Threshold (Low):</span><span class="param-value">${params.util_threshold_low}</span></div>`;
    html += `<div class="param-item"><span class="param-label">Window Size:</span><span class="param-value">${params.window_size}</span></div>`;
    html += `<div class="param-item"><span class="param-label">Hysteresis:</span><span class="param-value">${params.hysteresis}</span></div>`;
    
    html += '</div>';
    
    // Chart canvases
    html += '<div class="chart-container" style="margin-top: 2rem;"><h3><i class="fas fa-chart-line"></i> Power Timeline</h3><canvas id="powerChart"></canvas></div>';
    html += '<div class="chart-container"><h3><i class="fas fa-chart-area"></i> Frequency Timeline</h3><canvas id="frequencyChart"></canvas></div>';
    
    container.innerHTML = html;
    
    // Render charts
    setTimeout(() => {
        renderPowerChart(energyData.power_timeline);
        renderFrequencyChart(energyData.frequency_timeline);
    }, 100);
}

function renderPowerChart(powerTimeline) {
    const canvas = document.getElementById('powerChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    if (powerChart) {
        powerChart.destroy();
    }
    
    const times = powerTimeline.map(p => p.time);
    const powers = powerTimeline.map(p => p.power);
    const utilizations = powerTimeline.map(p => p.utilization);
    
    powerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times,
            datasets: [
                {
                    label: 'Power Consumption',
                    data: powers,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'y'
                },
                {
                    label: 'CPU Utilization',
                    data: utilizations,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#cbd5e1',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time',
                        color: '#cbd5e1'
                    },
                    ticks: { color: '#cbd5e1' },
                    grid: { color: 'rgba(51, 65, 85, 0.5)' }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Power (units)',
                        color: '#cbd5e1'
                    },
                    ticks: { color: '#cbd5e1' },
                    grid: { color: 'rgba(51, 65, 85, 0.5)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Utilization (0-1)',
                        color: '#cbd5e1'
                    },
                    ticks: { color: '#cbd5e1' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

function renderFrequencyChart(frequencyTimeline) {
    const canvas = document.getElementById('frequencyChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    if (frequencyChart) {
        frequencyChart.destroy();
    }
    
    const times = frequencyTimeline.map(f => f.time);
    const frequencies = frequencyTimeline.map(f => f.frequency);
    const states = frequencyTimeline.map(f => f.state);
    
    // Color code by state
    const backgroundColors = states.map(state => {
        switch(state) {
            case 'HIGH': return 'rgba(239, 68, 68, 0.6)';
            case 'MED': return 'rgba(245, 158, 11, 0.6)';
            case 'LOW': return 'rgba(16, 185, 129, 0.6)';
            case 'IDLE': return 'rgba(100, 116, 139, 0.6)';
            default: return 'rgba(59, 130, 246, 0.6)';
        }
    });
    
    frequencyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: times,
            datasets: [{
                label: 'CPU Frequency',
                data: frequencies,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(c => c.replace('0.6', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#cbd5e1',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1,
                    callbacks: {
                        afterLabel: function(context) {
                            return 'State: ' + states[context.dataIndex];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time',
                        color: '#cbd5e1'
                    },
                    ticks: { color: '#cbd5e1' },
                    grid: { color: 'rgba(51, 65, 85, 0.5)' }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Frequency',
                        color: '#cbd5e1'
                    },
                    ticks: { color: '#cbd5e1' },
                    grid: { color: 'rgba(51, 65, 85, 0.5)' },
                    beginAtZero: true,
                    max: 1.2
                }
            }
        }
    });
}

function renderComparisonChart(comparisonData, containerId = 'comparisonChart') {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '<div class="chart-container" style="height: 500px;"><canvas id="comparisonCanvas"></canvas></div>';
    container.innerHTML = html;
    
    setTimeout(() => {
        const canvas = document.getElementById('comparisonCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (energyComparisonChart) {
            energyComparisonChart.destroy();
        }
        
        const algorithms = Object.keys(comparisonData);
        const energies = algorithms.map(algo => comparisonData[algo].total_energy || 0);
        const turnarounds = algorithms.map(algo => comparisonData[algo].avg_turnaround || 0);
        const waitings = algorithms.map(algo => comparisonData[algo].avg_waiting || 0);
        const contextSwitches = algorithms.map(algo => comparisonData[algo].context_switches || 0);
        
        energyComparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: algorithms.map(a => a.toUpperCase().replace('_', ' ')),
                datasets: [
                    {
                        label: 'Total Energy',
                        data: energies,
                        backgroundColor: 'rgba(245, 158, 11, 0.7)',
                        borderColor: '#f59e0b',
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Avg Turnaround Time',
                        data: turnarounds,
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Context Switches',
                        data: contextSwitches,
                        backgroundColor: 'rgba(139, 92, 246, 0.7)',
                        borderColor: '#8b5cf6',
                        borderWidth: 2,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#cbd5e1',
                            font: { size: 12 }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Algorithm Performance Comparison',
                        color: '#f1f5f9',
                        font: { size: 16, weight: 'bold' }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#f1f5f9',
                        bodyColor: '#cbd5e1',
                        borderColor: '#334155',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#cbd5e1' },
                        grid: { color: 'rgba(51, 65, 85, 0.5)' }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Energy (units)',
                            color: '#cbd5e1'
                        },
                        ticks: { color: '#cbd5e1' },
                        grid: { color: 'rgba(51, 65, 85, 0.5)' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Time / Count',
                            color: '#cbd5e1'
                        },
                        ticks: { color: '#cbd5e1' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    }, 100);
}

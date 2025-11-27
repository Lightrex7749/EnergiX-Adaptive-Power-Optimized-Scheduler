/**
 * Gantt Chart Visualization Module
 * Renders interactive Gantt charts for process scheduling
 */

function renderGanttChart(gantt, containerId = 'ganttChart') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Calculate total time
    const totalTime = Math.max(...gantt.map(seg => seg.end));
    
    // Create Gantt HTML
    let html = '<div class="gantt-container">';
    html += '<h3><i class="fas fa-chart-gantt"></i> Gantt Chart</h3>';
    html += '<div class="gantt-chart">';
    
    // Timeline
    html += '<div class="gantt-timeline">';
    gantt.forEach(segment => {
        const duration = segment.end - segment.start;
        const widthPercent = (duration / totalTime) * 100;
        
        let color = '#64748b'; // Default IDLE color
        if (segment.process !== 'IDLE') {
            // Generate color based on process ID
            const processNum = parseInt(segment.process.replace('P', ''));
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
            color = colors[processNum % colors.length];
        }
        
        html += `
            <div class="gantt-segment" 
                 style="width: ${widthPercent}%; background: ${color};"
                 title="${segment.process}: ${segment.start} - ${segment.end}">
                <div style="font-size: 0.9rem;">${segment.process}</div>
                <div style="font-size: 0.75rem; opacity: 0.8;">${duration}ms</div>
            </div>
        `;
    });
    html += '</div>';
    
    // Time labels
    html += '<div class="gantt-labels">';
    gantt.forEach(segment => {
        const duration = segment.end - segment.start;
        const widthPercent = (duration / totalTime) * 100;
        html += `<div class="gantt-label" style="width: ${widthPercent}%;">${segment.start}</div>`;
    });
    html += `<div class="gantt-label" style="width: 0; position: absolute; right: 0;">${totalTime}</div>`;
    html += '</div>';
    
    html += '</div></div>';
    
    container.innerHTML = html;
}

function renderProcessTable(processes, containerId = 'processDetailsTable') {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '<div class="process-detail-table">';
    html += '<h3><i class="fas fa-table"></i> Process Details</h3>';
    html += '<div class="table-wrapper">';
    html += '<table>';
    html += '<thead><tr>';
    html += '<th>Process ID</th>';
    html += '<th>Arrival</th>';
    html += '<th>Burst</th>';
    html += '<th>Completion</th>';
    html += '<th>Turnaround</th>';
    html += '<th>Waiting</th>';
    if (processes[0].priority !== undefined) {
        html += '<th>Priority</th>';
    }
    if (processes[0].classification) {
        html += '<th>Classification</th>';
    }
    html += '</tr></thead>';
    
    html += '<tbody>';
    processes.forEach(p => {
        html += '<tr>';
        html += `<td>P${p.pid}</td>`;
        html += `<td>${p.arrival}</td>`;
        html += `<td>${p.burst}</td>`;
        html += `<td>${p.completion}</td>`;
        html += `<td>${p.turnaround}</td>`;
        html += `<td>${p.waiting}</td>`;
        if (p.priority !== undefined) {
            html += `<td>${p.priority}</td>`;
        }
        if (p.classification) {
            html += `<td><span class="badge ${p.classification}">${p.classification}</span></td>`;
        }
        html += '</tr>';
    });
    html += '</tbody></table></div></div>';
    
    container.innerHTML = html;
}

function renderMetrics(metrics, contextSwitches, containerId = 'metricsDisplay') {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '<div class="metrics-grid">';
    
    html += `
        <div class="metric-card">
            <div class="metric-label"><i class="fas fa-clock"></i> Avg Turnaround Time</div>
            <div class="metric-value">${metrics.avg_turnaround}</div>
        </div>
    `;
    
    html += `
        <div class="metric-card">
            <div class="metric-label"><i class="fas fa-hourglass-half"></i> Avg Waiting Time</div>
            <div class="metric-value">${metrics.avg_waiting}</div>
        </div>
    `;
    
    html += `
        <div class="metric-card">
            <div class="metric-label"><i class="fas fa-flag-checkered"></i> Completion Time</div>
            <div class="metric-value">${metrics.total_completion}</div>
        </div>
    `;
    
    html += `
        <div class="metric-card">
            <div class="metric-label"><i class="fas fa-exchange-alt"></i> Context Switches</div>
            <div class="metric-value">${contextSwitches}</div>
        </div>
    `;
    
    if (metrics.threshold) {
        html += `
            <div class="metric-card">
                <div class="metric-label"><i class="fas fa-ruler"></i> Task Threshold</div>
                <div class="metric-value">${metrics.threshold}</div>
            </div>
        `;
    }
    
    if (metrics.short_tasks_count !== undefined) {
        html += `
            <div class="metric-card">
                <div class="metric-label"><i class="fas fa-bolt"></i> Short / Long Tasks</div>
                <div class="metric-value">${metrics.short_tasks_count} / ${metrics.long_tasks_count}</div>
            </div>
        `;
    }
    
    html += '</div>';
    
    container.innerHTML = html;
}

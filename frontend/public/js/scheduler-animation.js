/**
 * Algorithm Animation Module
 * Provides step-by-step visualization of scheduling algorithms
 */

class SchedulerAnimation {
    constructor(containerId, ganttData, processesData) {
        this.container = document.getElementById(containerId);
        this.gantt = ganttData;
        this.processes = processesData;
        this.currentStep = 0;
        this.isPlaying = false;
        this.playInterval = null;
        this.speed = 1000; // milliseconds per step
        
        this.init();
    }
    
    init() {
        if (!this.container || !this.gantt) return;
        
        this.render();
        this.updateDisplay();
    }
    
    render() {
        const maxTime = Math.max(...this.gantt.map(seg => seg.end));
        
        const html = `
            <div class="animation-container" style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border); overflow: hidden;">
                <!-- Controls -->
                <div class="animation-controls" style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
                    <button id="play-btn-${this.container.id}" class="btn btn-primary" style="padding: 0.5rem 1rem; flex-shrink: 0;">
                        <i class="fas fa-play"></i> Play
                    </button>
                    <button id="pause-btn-${this.container.id}" class="btn btn-secondary" style="padding: 0.5rem 1rem; flex-shrink: 0;" disabled>
                        <i class="fas fa-pause"></i> Pause
                    </button>
                    <button id="step-btn-${this.container.id}" class="btn btn-secondary" style="padding: 0.5rem 1rem; flex-shrink: 0;">
                        <i class="fas fa-step-forward"></i> Step
                    </button>
                    <button id="reset-btn-${this.container.id}" class="btn btn-secondary" style="padding: 0.5rem 1rem; flex-shrink: 0;">
                        <i class="fas fa-undo"></i> Reset
                    </button>
                    
                    <div style="flex: 1 1 250px; display: flex; align-items: center; gap: 0.5rem; min-width: 200px;">
                        <label style="font-size: 0.9rem; color: var(--text-primary); flex-shrink: 0;">Speed:</label>
                        <input type="range" id="speed-slider-${this.container.id}" min="100" max="2000" value="1000" step="100" style="flex: 1; min-width: 100px;">
                        <span id="speed-label-${this.container.id}" style="font-size: 0.85rem; color: var(--text-primary); min-width: 50px; text-align: right;">1.0x</span>
                    </div>
                </div>
                
                <!-- Current Time Display -->
                <div style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-size: 0.9rem; color: var(--text-secondary);">
                            Time: <span id="current-time-${this.container.id}" style="font-weight: 600; color: var(--primary);">0</span> / ${maxTime}
                        </span>
                        <span style="font-size: 0.9rem; color: var(--text-secondary);">
                            Step: <span id="current-step-${this.container.id}" style="font-weight: 600; color: var(--primary);">0</span> / ${this.gantt.length}
                        </span>
                    </div>
                    <div style="background: var(--bg-tertiary); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div id="progress-bar-${this.container.id}" style="height: 100%; background: var(--primary); width: 0%; transition: width 0.3s;"></div>
                    </div>
                </div>
                
                <!-- Gantt Chart -->
                <div id="gantt-animation-${this.container.id}" style="margin-bottom: 1.5rem;"></div>
                
                <!-- Process State Table -->
                <div style="overflow-x: auto;">
                    <table class="process-state-table" style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                        <thead style="background: var(--bg-tertiary);">
                            <tr>
                                <th style="padding: 0.5rem; text-align: left; border: 1px solid var(--border-color);">Process</th>
                                <th style="padding: 0.5rem; text-align: center; border: 1px solid var(--border-color);">State</th>
                                <th style="padding: 0.5rem; text-align: center; border: 1px solid var(--border-color);">Arrival</th>
                                <th style="padding: 0.5rem; text-align: center; border: 1px solid var(--border-color);">Burst</th>
                                <th style="padding: 0.5rem; text-align: center; border: 1px solid var(--border-color);">Remaining</th>
                                <th style="padding: 0.5rem; text-align: center; border: 1px solid var(--border-color);">Completion</th>
                            </tr>
                        </thead>
                        <tbody id="process-table-${this.container.id}">
                        </tbody>
                    </table>
                </div>
                
                <!-- Current Execution Info -->
                <div id="execution-info-${this.container.id}" style="margin-top: 1rem; padding: 1rem; background: var(--bg-tertiary); border-radius: 4px; border-left: 3px solid var(--primary);">
                    <div style="font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">Current Execution:</div>
                    <div id="execution-text-${this.container.id}" style="font-size: 0.9rem; color: var(--text-secondary);">
                        Ready to start animation
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
        this.attachEventListeners();
    }
    
    attachEventListeners() {
        const playBtn = document.getElementById(`play-btn-${this.container.id}`);
        const pauseBtn = document.getElementById(`pause-btn-${this.container.id}`);
        const stepBtn = document.getElementById(`step-btn-${this.container.id}`);
        const resetBtn = document.getElementById(`reset-btn-${this.container.id}`);
        const speedSlider = document.getElementById(`speed-slider-${this.container.id}`);
        
        playBtn.addEventListener('click', () => this.play());
        pauseBtn.addEventListener('click', () => this.pause());
        stepBtn.addEventListener('click', () => this.step());
        resetBtn.addEventListener('click', () => this.reset());
        
        speedSlider.addEventListener('input', (e) => {
            this.speed = 2100 - parseInt(e.target.value); // Invert so higher slider = faster
            const speedLabel = document.getElementById(`speed-label-${this.container.id}`);
            const speedMultiplier = (2100 - this.speed) / 1000;
            speedLabel.textContent = `${speedMultiplier.toFixed(1)}x`;
            
            // Restart interval if playing
            if (this.isPlaying) {
                clearInterval(this.playInterval);
                this.playInterval = setInterval(() => this.step(), this.speed);
            }
        });
    }
    
    play() {
        if (this.currentStep >= this.gantt.length) {
            this.reset();
        }
        
        this.isPlaying = true;
        document.getElementById(`play-btn-${this.container.id}`).disabled = true;
        document.getElementById(`pause-btn-${this.container.id}`).disabled = false;
        document.getElementById(`step-btn-${this.container.id}`).disabled = true;
        
        this.playInterval = setInterval(() => {
            this.step();
            if (this.currentStep >= this.gantt.length) {
                this.pause();
            }
        }, this.speed);
    }
    
    pause() {
        this.isPlaying = false;
        clearInterval(this.playInterval);
        document.getElementById(`play-btn-${this.container.id}`).disabled = false;
        document.getElementById(`pause-btn-${this.container.id}`).disabled = true;
        document.getElementById(`step-btn-${this.container.id}`).disabled = false;
    }
    
    step() {
        if (this.currentStep < this.gantt.length) {
            this.currentStep++;
            this.updateDisplay();
        }
    }
    
    reset() {
        this.pause();
        this.currentStep = 0;
        this.updateDisplay();
    }
    
    updateDisplay() {
        const currentSegment = this.gantt[this.currentStep];
        const maxTime = Math.max(...this.gantt.map(seg => seg.end));
        const currentTime = currentSegment ? currentSegment.start : 0;
        
        // Update time and progress
        document.getElementById(`current-time-${this.container.id}`).textContent = currentTime;
        document.getElementById(`current-step-${this.container.id}`).textContent = this.currentStep;
        const progress = (this.currentStep / this.gantt.length) * 100;
        document.getElementById(`progress-bar-${this.container.id}`).style.width = `${progress}%`;
        
        // Render animated Gantt chart
        this.renderAnimatedGantt();
        
        // Update process table
        this.updateProcessTable(currentTime);
        
        // Update execution info
        this.updateExecutionInfo(currentSegment);
    }
    
    renderAnimatedGantt() {
        const container = document.getElementById(`gantt-animation-${this.container.id}`);
        const maxTime = Math.max(...this.gantt.map(seg => seg.end));
        const visibleGantt = this.gantt.slice(0, this.currentStep);
        
        let html = '<div style="position: relative; height: 60px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden;">';
        
        visibleGantt.forEach(segment => {
            const duration = segment.end - segment.start;
            const left = (segment.start / maxTime) * 100;
            const width = (duration / maxTime) * 100;
            
            let color = '#64748b';
            if (segment.pid && segment.pid !== 'IDLE') {
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
                color = colors[segment.pid % colors.length];
            }
            
            const isCurrentSegment = visibleGantt.length > 0 && segment === visibleGantt[visibleGantt.length - 1];
            const animation = isCurrentSegment ? 'animation: pulse 1s infinite;' : '';
            
            html += `
                <div style="position: absolute; left: ${left}%; width: ${width}%; height: 100%; background: ${color}; 
                            display: flex; flex-direction: column; justify-content: center; align-items: center; 
                            color: white; font-size: 0.85rem; border-right: 1px solid rgba(255,255,255,0.2); ${animation}">
                    <div style="font-weight: 600;">P${segment.pid || '?'}</div>
                    <div style="font-size: 0.75rem; opacity: 0.8;">${segment.start}-${segment.end}</div>
                </div>
            `;
        });
        
        // Add time markers
        for (let i = 0; i <= 10; i++) {
            const time = Math.floor((maxTime / 10) * i);
            const left = (i * 10);
            html += `<div style="position: absolute; left: ${left}%; bottom: -20px; font-size: 0.75rem; color: var(--text-secondary);">${time}</div>`;
        }
        
        html += '</div>';
        
        // Add pulse animation style
        if (!document.getElementById('pulse-animation-style')) {
            const style = document.createElement('style');
            style.id = 'pulse-animation-style';
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `;
            document.head.appendChild(style);
        }
        
        container.innerHTML = html;
    }
    
    updateProcessTable(currentTime) {
        const tbody = document.getElementById(`process-table-${this.container.id}`);
        
        let html = '';
        this.processes.forEach(proc => {
            const hasArrived = proc.arrival <= currentTime;
            const isComplete = proc.completion !== undefined && proc.completion <= currentTime;
            const isExecuting = this.gantt[this.currentStep - 1]?.pid === proc.pid;
            
            let state = 'Not Arrived';
            let stateColor = 'var(--text-secondary)';
            
            if (isComplete) {
                state = 'Completed';
                stateColor = 'var(--success)';
            } else if (isExecuting) {
                state = 'Running';
                stateColor = 'var(--primary)';
            } else if (hasArrived) {
                state = 'Ready';
                stateColor = 'var(--warning)';
            }
            
            // Calculate remaining time
            let remaining = proc.burst;
            const executedSegments = this.gantt.slice(0, this.currentStep).filter(seg => seg.pid === proc.pid);
            const executedTime = executedSegments.reduce((sum, seg) => sum + (seg.end - seg.start), 0);
            remaining = Math.max(0, proc.burst - executedTime);
            
            const rowStyle = isExecuting ? 'background: rgba(59, 130, 246, 0.1);' : '';
            
            html += `
                <tr style="${rowStyle}">
                    <td style="padding: 0.5rem; border: 1px solid var(--border-color); font-weight: 600;">P${proc.pid}</td>
                    <td style="padding: 0.5rem; border: 1px solid var(--border-color); text-align: center; color: ${stateColor}; font-weight: 600;">
                        ${isExecuting ? '<i class="fas fa-circle-notch fa-spin"></i> ' : ''}${state}
                    </td>
                    <td style="padding: 0.5rem; border: 1px solid var(--border-color); text-align: center;">${proc.arrival}</td>
                    <td style="padding: 0.5rem; border: 1px solid var(--border-color); text-align: center;">${proc.burst}</td>
                    <td style="padding: 0.5rem; border: 1px solid var(--border-color); text-align: center;">${remaining}</td>
                    <td style="padding: 0.5rem; border: 1px solid var(--border-color); text-align: center;">${proc.completion || '-'}</td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    }
    
    updateExecutionInfo(segment) {
        const infoDiv = document.getElementById(`execution-text-${this.container.id}`);
        
        if (!segment) {
            infoDiv.innerHTML = '<i class="fas fa-info-circle"></i> Animation ready to start';
            return;
        }
        
        const process = this.processes.find(p => p.pid === segment.pid);
        
        let html = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <div>
                    <span style="color: var(--text-secondary);">Executing:</span>
                    <strong style="color: var(--primary);"> Process P${segment.pid}</strong>
                </div>
                <div>
                    <span style="color: var(--text-secondary);">Time Slot:</span>
                    <strong> ${segment.start} → ${segment.end}</strong>
                </div>
                <div>
                    <span style="color: var(--text-secondary);">Duration:</span>
                    <strong> ${segment.end - segment.start} units</strong>
                </div>
        `;
        
        if (process) {
            html += `
                <div>
                    <span style="color: var(--text-secondary);">Priority:</span>
                    <strong> ${process.priority || 'N/A'}</strong>
                </div>
            `;
        }
        
        html += '</div>';
        
        infoDiv.innerHTML = html;
    }
}

// Global function to initialize animation
function initializeAnimation(containerId, ganttData, processesData) {
    return new SchedulerAnimation(containerId, ganttData, processesData);
}

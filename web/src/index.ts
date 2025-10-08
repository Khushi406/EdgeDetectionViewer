/**
 * Edge Detection Web Viewer - TypeScript Implementation
 * FLAM R&D Assessment - Real-time Frame Display and Statistics
 * 
 * This web viewer demonstrates TypeScript integration with the Android
 * edge detection application, providing frame display and performance stats.
 */

interface FrameStats {
    fps: number;
    resolution: string;
    processingTime: number;
    timestamp: number;
    frameCount: number;
}

interface ProcessedFrame {
    imageData: string; // Base64 encoded image
    stats: FrameStats;
    algorithm: string;
}

class EdgeDetectionViewer {
    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;
    private statsContainer!: HTMLElement;
    private frameCounter: number = 0;
    private lastUpdateTime: number = Date.now();
    private isProcessing: boolean = false;

    constructor() {
        this.initializeDOM();
        this.setupEventListeners();
        this.startDemo();
    }

    private initializeDOM(): void {
        // Create main container
        const container = document.createElement('div');
        container.className = 'viewer-container';
        
        // Create header
        const header = document.createElement('header');
        header.innerHTML = `
            <h1>🔍 Edge Detection Web Viewer</h1>
            <p>FLAM R&D Assessment - TypeScript Integration</p>
        `;
        
        // Create canvas for frame display
        this.canvas = document.createElement('canvas');
        this.canvas.width = 640;
        this.canvas.height = 480;
        this.canvas.className = 'frame-canvas';
        
        // Get 2D context
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Failed to get 2D canvas context');
        }
        this.ctx = context;
        
        // Create stats container
        this.statsContainer = document.createElement('div');
        this.statsContainer.className = 'stats-container';
        
        // Create controls
        const controls = document.createElement('div');
        controls.className = 'controls';
        controls.innerHTML = `
            <button id="toggleBtn" class="btn-primary">Toggle Processing</button>
            <button id="exportBtn" class="btn-secondary">Export Frame</button>
            <button id="resetBtn" class="btn-secondary">Reset Stats</button>
        `;
        
        // Assemble the UI
        container.appendChild(header);
        container.appendChild(this.canvas);
        container.appendChild(this.statsContainer);
        container.appendChild(controls);
        
        document.body.appendChild(container);
        
        // Apply styles
        this.applyStyles();
    }

    private applyStyles(): void {
        const style = document.createElement('style');
        style.textContent = `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                color: white;
                min-height: 100vh;
                padding: 20px;
            }
            
            .viewer-container {
                max-width: 1200px;
                margin: 0 auto;
                text-align: center;
            }
            
            header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }
            
            header p {
                font-size: 1.2em;
                opacity: 0.9;
                margin-bottom: 30px;
            }
            
            .frame-canvas {
                border: 3px solid #4CAF50;
                border-radius: 10px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                background: #000;
                margin: 20px 0;
                max-width: 100%;
                height: auto;
            }
            
            .stats-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            
            .stat-card {
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 20px;
                border: 1px solid rgba(255,255,255,0.2);
            }
            
            .stat-card h3 {
                color: #4CAF50;
                margin-bottom: 10px;
                font-size: 1.1em;
            }
            
            .stat-value {
                font-size: 2em;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .stat-unit {
                font-size: 0.9em;
                opacity: 0.8;
            }
            
            .controls {
                display: flex;
                justify-content: center;
                gap: 15px;
                flex-wrap: wrap;
                margin-top: 30px;
            }
            
            .btn-primary, .btn-secondary {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 1em;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .btn-primary {
                background: #4CAF50;
                color: white;
            }
            
            .btn-primary:hover {
                background: #45a049;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(76,175,80,0.4);
            }
            
            .btn-secondary {
                background: rgba(255,255,255,0.1);
                color: white;
                border: 1px solid rgba(255,255,255,0.3);
            }
            
            .btn-secondary:hover {
                background: rgba(255,255,255,0.2);
                transform: translateY(-2px);
            }
            
            .processing {
                border-color: #FF9800 !important;
            }
            
            @media (max-width: 768px) {
                header h1 {
                    font-size: 2em;
                }
                
                .controls {
                    flex-direction: column;
                    align-items: center;
                }
                
                .btn-primary, .btn-secondary {
                    width: 200px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    private setupEventListeners(): void {
        // Toggle processing button
        const toggleBtn = document.getElementById('toggleBtn');
        toggleBtn?.addEventListener('click', () => {
            this.isProcessing = !this.isProcessing;
            this.canvas.classList.toggle('processing', this.isProcessing);
            if (toggleBtn) {
                toggleBtn.textContent = this.isProcessing ? 'Stop Processing' : 'Start Processing';
            }
        });

        // Export frame button
        const exportBtn = document.getElementById('exportBtn');
        exportBtn?.addEventListener('click', () => {
            this.exportCurrentFrame();
        });

        // Reset stats button
        const resetBtn = document.getElementById('resetBtn');
        resetBtn?.addEventListener('click', () => {
            this.resetStats();
        });
    }

    private startDemo(): void {
        // Generate sample processed frame data for demonstration
        this.generateSampleFrame();
        
        // Start update loop
        setInterval(() => {
            if (this.isProcessing) {
                this.generateSampleFrame();
            }
            this.updateStats();
        }, 1000 / 15); // 15 FPS update rate
    }

    private generateSampleFrame(): void {
        // Generate a sample edge-detected frame using canvas drawing
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sample edge patterns
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        
        const time = Date.now() * 0.001;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Draw animated edge patterns
        for (let i = 0; i < 50; i++) {
            this.ctx.beginPath();
            const angle = (i / 50) * Math.PI * 2 + time;
            const radius = 50 + Math.sin(time + i * 0.1) * 30;
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + 20);
            const y2 = centerY + Math.sin(angle) * (radius + 20);
            
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
        
        // Add corner detection patterns
        this.drawCornerPatterns(time);
        
        this.frameCounter++;
    }

    private drawCornerPatterns(time: number): void {
        this.ctx.strokeStyle = '#00FF00';
        this.ctx.lineWidth = 1;
        
        // Draw grid pattern for edge simulation
        const gridSize = 20;
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            if (Math.sin(time + x * 0.01) > 0.5) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.canvas.height);
                this.ctx.stroke();
            }
        }
        
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            if (Math.cos(time + y * 0.01) > 0.5) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
                this.ctx.stroke();
            }
        }
    }

    private updateStats(): void {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastUpdateTime;
        const fps = this.isProcessing ? Math.round(1000 / (deltaTime || 1)) : 0;
        
        const stats: FrameStats = {
            fps: Math.min(fps, 15), // Cap at 15 FPS for demo
            resolution: `${this.canvas.width}x${this.canvas.height}`,
            processingTime: this.isProcessing ? Math.random() * 20 + 15 : 0, // 15-35ms simulation
            timestamp: currentTime,
            frameCount: this.frameCounter
        };
        
        this.displayStats(stats);
        this.lastUpdateTime = currentTime;
    }

    private displayStats(stats: FrameStats): void {
        this.statsContainer.innerHTML = `
            <div class="stat-card">
                <h3>📊 Frame Rate</h3>
                <div class="stat-value">${stats.fps}</div>
                <div class="stat-unit">FPS</div>
            </div>
            <div class="stat-card">
                <h3>📐 Resolution</h3>
                <div class="stat-value">${stats.resolution}</div>
                <div class="stat-unit">pixels</div>
            </div>
            <div class="stat-card">
                <h3>⚡ Processing Time</h3>
                <div class="stat-value">${stats.processingTime.toFixed(1)}</div>
                <div class="stat-unit">ms</div>
            </div>
            <div class="stat-card">
                <h3>🖼️ Frame Count</h3>
                <div class="stat-value">${stats.frameCount}</div>
                <div class="stat-unit">frames</div>
            </div>
            <div class="stat-card">
                <h3>🔧 Algorithm</h3>
                <div class="stat-value">Canny</div>
                <div class="stat-unit">OpenCV</div>
            </div>
            <div class="stat-card">
                <h3>📱 Status</h3>
                <div class="stat-value">${this.isProcessing ? 'Active' : 'Idle'}</div>
                <div class="stat-unit">mode</div>
            </div>
        `;
    }

    private exportCurrentFrame(): void {
        // Export current canvas as image
        const link = document.createElement('a');
        link.download = `edge_detection_${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
        
        console.log('Frame exported successfully');
    }

    private resetStats(): void {
        this.frameCounter = 0;
        this.lastUpdateTime = Date.now();
        console.log('Statistics reset');
    }

    // Method to receive frame data from Android app (for future integration)
    public receiveFrameData(frameData: ProcessedFrame): void {
        // This method would be called by the Android app via WebView or HTTP
        console.log('Received frame data:', frameData);
        
        // Load and display the actual processed frame
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        };
        img.src = frameData.imageData;
        
        // Update stats with real data
        this.displayStats(frameData.stats);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Edge Detection Web Viewer - FLAM R&D Assessment');
    console.log('TypeScript application initializing...');
    
    const viewer = new EdgeDetectionViewer();
    
    // Make viewer globally available for integration
    (window as any).edgeDetectionViewer = viewer;
    
    console.log('✅ Web viewer ready for frame data');
});
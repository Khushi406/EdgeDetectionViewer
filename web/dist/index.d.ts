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
    imageData: string;
    stats: FrameStats;
    algorithm: string;
}
declare class EdgeDetectionViewer {
    private canvas;
    private ctx;
    private statsContainer;
    private frameCounter;
    private lastUpdateTime;
    private isProcessing;
    constructor();
    private initializeDOM;
    private applyStyles;
    private setupEventListeners;
    private startDemo;
    private generateSampleFrame;
    private drawCornerPatterns;
    private updateStats;
    private displayStats;
    private exportCurrentFrame;
    private resetStats;
    receiveFrameData(frameData: ProcessedFrame): void;
}

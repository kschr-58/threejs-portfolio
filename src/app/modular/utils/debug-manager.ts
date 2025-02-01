import GUI from "three/examples/jsm/libs/lil-gui.module.min";
import Stats from 'three/examples/jsm/libs/stats.module';

export default class DebugManager {
    private gui!: GUI;
    private fpsStats!: Stats;
    private memoryStats!: Stats;

    private isActive: boolean;

    constructor() {
        this.isActive = window.location.hash == '#debug';

        if (!this.isActive) return;

        this.gui = new GUI();
        this.fpsStats = new Stats();
        this.memoryStats = new Stats();

        this.fpsStats.showPanel(0);
        this.memoryStats.showPanel(2);

        this.addToDocument();
    }

    public isDebugModeEnabled(): boolean {
        return this.isActive;
    }

    public getGUI(): GUI {
        return this.gui;
    }

    public tick(): void {
        this.fpsStats.begin();
        this.memoryStats.begin();

        this.fpsStats.end();
        this.memoryStats.end();
    }

    private addToDocument(): void {
        const parent = document.getElementById('performance_stats');

        if (parent == null) throw new Error('Performance stats element not part of template');

        this.fpsStats.dom.style.position = 'relative';
        this.memoryStats.dom.style.position = 'relative';

        parent.appendChild(this.fpsStats.dom);
        parent.appendChild(this.memoryStats.dom);
    }
}
import * as THREE from 'three';
import SizeUtils from './utils/size-utils';
import TimeUtils from './utils/time-utils';
import CameraManager from './cameraManager';
import { RendererManager } from './rendererManager';
import World from './world/world';
import ResourceManager from './utils/resource-manager';
import { sourcesArray } from './sources';
import DebugManager from './utils/debug-manager';
import CursorUtils from './utils/cursor-utils';
import { ThemeService } from '../../services/theme.service';

let instance: Experience | null = null;

declare global {
    interface Window { experience: Experience } // Allows for console debugging
}

export class Experience {
    // Utils objects
    private canvas!: HTMLCanvasElement;
    private sizeUtils!: SizeUtils;
    private timeUtils!: TimeUtils;
    private cursorUtils!: CursorUtils;
    private resourceManager!: ResourceManager;
    private cameraManager!: CameraManager;
    private rendererManager!: RendererManager;
    private debugManager!: DebugManager;

    // World
    private world!: World;

    // ThreeJS objects
    private scene!: THREE.Scene;

    // Colors
    private lightThemeColor = new THREE.Color(0xffffff);
    private darkThemeColor = new THREE.Color(0x292929);

    // Debugging
    private debugObject: {[k: string]: any} = {};
    private debugEnabled = false;

    constructor(canvas: HTMLCanvasElement, private themeService: ThemeService) {
        // Check if instance already exists
        if (instance != null) { 
            return instance;
        }
        
        instance = this;

        this.canvas = canvas;

        // Utility objects
        this.resourceManager = new ResourceManager(sourcesArray);
        this.sizeUtils = new SizeUtils();
        this.timeUtils = new TimeUtils();
        this.cursorUtils = new CursorUtils();
        this.debugManager = new DebugManager();

        // ThreeJS objects
        this.scene = new THREE.Scene();

        // Subscribe to dark mode event 
        this.scene.background = themeService.isDarkThemeEnabled() ? this.darkThemeColor : this.lightThemeColor;
        themeService.themeChangeEvent.subscribe(() => this.setTheme());

        // Manager objects
        this.cameraManager = new CameraManager(this);
        this.rendererManager = new RendererManager(this);

        // World
        this.world = new World(this);

        // Subscribe to events
        this.sizeUtils.resizeEvent.subscribe(() => {
            this.resize();
        });

        this.timeUtils.tickEvent.subscribe(() => {
            this.tick();
        });

        window.experience = this;

        this.debugEnabled = this.debugManager.isDebugModeEnabled();
        if (this.debugEnabled) this.setDebugSettings();
    }

    public getSizeUtils(): SizeUtils {
        return this.sizeUtils;
    }

    public getTimeUtils(): TimeUtils {
        return this.timeUtils;
    }

    public getCursorUtils(): CursorUtils {
        return this.cursorUtils;
    }

    public getResourceManager(): ResourceManager {
        return this.resourceManager;
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public getScene(): THREE.Scene {
        return this.scene;
    }

    public getCameraManager(): CameraManager {
        return this.cameraManager;
    }

    public getRendererManager(): RendererManager {
        return this.rendererManager;
    }

    public getDebugManager(): DebugManager {
        return this.debugManager;
    }

    public getThemeService(): ThemeService {
        return this.themeService;
    }

    public destroy(): void {
        this.sizeUtils.resizeEvent.unsubscribe();
        this.timeUtils.tickEvent.unsubscribe();

        this.scene.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();

                // Dispose materials
                for (const key in child.material) {
                    const value = child.material[key];
                    
                    // Check if value can be disposed
                    if (value && typeof value.dispose === 'function') value.dispose();
                }
            }
        });

        this.cameraManager.getControls().dispose();
        this.rendererManager.getRenderer().dispose();
        if (this.debugManager.isDebugModeEnabled()) this.debugManager.getGUI().destroy();
    }

    private resize(): void {
        this.cameraManager.resize();
        this.rendererManager.resize();
    }

    private tick(): void {
        this.cameraManager.tick();
        this.world.tick();
        this.rendererManager.tick();

        if (this.debugEnabled) this.debugManager.tick();
    }

    private setTheme(): void {
        const darkThemeEnabled = this.themeService.isDarkThemeEnabled();
        this.scene.background = darkThemeEnabled ? this.darkThemeColor : this.lightThemeColor;
    }

    private setDebugSettings(): void {
        const gui = this.debugManager.getGUI();

        const sceneFolder = gui.addFolder('Scene');
        sceneFolder.addColor(this.scene, 'background');

        // Materials
        this.debugObject['toggleDarkTheme'] = () => {
            this.themeService.themeChangeRequestEvent.next();
        }

        sceneFolder.add(this.debugObject, 'toggleDarkTheme').name('Toggle dark theme');
    }
}
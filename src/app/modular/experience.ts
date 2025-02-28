import * as THREE from 'three';
import TimeUtils from './utils/time-utils';
import CameraManager from './managers/camera-manager';
import { RendererManager } from './managers/renderer-manager';
import World from './world/world';
import RaycastUtils from './utils/raycast-utils';
import { ThemeService } from '../services/theme.service';
import ResourceLoadingService from '../services/resource-loading.service';
import { sourcesArray } from 'src/app/modular/utils/sources';
import SizesService from '../services/sizes.service';
import DebugService from '../services/debug.service';
import SharedMaterialsUtils from './utils/shared-materials-utils';

let instance: Experience | null = null;

declare global {
    interface Window { experience: Experience } // Allows for console debugging
}

export class Experience { //TODO migrate to modular component 
    // Utils objects
    private canvas!: HTMLCanvasElement;
    private timeUtils!: TimeUtils;
    private raycastUtils!: RaycastUtils;
    private sharedMaterialsUtils!: SharedMaterialsUtils;

    // Manager objects
    private cameraManager!: CameraManager;
    private rendererManager!: RendererManager;

    // World
    private world!: World;

    // ThreeJS objects
    private scene!: THREE.Scene;

    // Debugging
    private debugObject: {[k: string]: any} = {};

    constructor(
        canvas: HTMLCanvasElement) {
        // Check if instance already exists
        if (instance != null) { 
            return instance;
        }
        
        instance = this;

        this.canvas = canvas;

        // Load resources
        ResourceLoadingService.getInstance().loadResources(sourcesArray);

        // ThreeJS objects
        this.scene = new THREE.Scene();

        // Manager objects
        this.cameraManager = new CameraManager(this);
        this.rendererManager = new RendererManager(this);

        // Utility objects
        this.timeUtils = new TimeUtils();
        this.raycastUtils = new RaycastUtils(this.cameraManager);
        this.sharedMaterialsUtils = new SharedMaterialsUtils();

        // World
        this.world = new World(this);

        // Subscribe to events
        SizesService.getInstance().resizeEvent.subscribe(() => {
            this.resize();
        });

        this.timeUtils.tickEvent.subscribe(() => {
            this.tick();
        });

        window.experience = this;

        const debugEnabled = DebugService.getInstance().isDebugModeEnabled();
        if (debugEnabled) this.setDebugSettings();
    }

    public getTimeUtils(): TimeUtils {
        return this.timeUtils;
    }

    public getRaycastUtils(): RaycastUtils {
        return this.raycastUtils;
    }

    public getSharedMaterialsUtils(): SharedMaterialsUtils {
        return this.sharedMaterialsUtils;
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

    public destroy(): void {
        // Unsubscrive from events
        SizesService.getInstance().resizeEvent.unsubscribe();
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
        if (DebugService.getInstance().isDebugModeEnabled()) DebugService.getInstance().getGUI().destroy();
    }

    private resize(): void {
        this.cameraManager.resize();
        this.rendererManager.resize();
    }

    private tick(): void {
        // Prevent objects from animating while page is inactive
        if (document.hidden) return;

        this.cameraManager.tick();
        this.world.tick();
        this.rendererManager.tick();
        this.raycastUtils.tick();
    }

    private setDebugSettings(): void {
        const gui = DebugService.getInstance().getGUI();

        const sceneFolder = gui.addFolder('Scene');

        // Materials
        this.debugObject['toggleDarkTheme'] = () => {
            ThemeService.getInstance().swapTheme();
        }
        this.debugObject['queueThemeSwitch'] = () => {
            ThemeService.getInstance().themeChangeRequestEvent.next();
        }

        sceneFolder.add(this.debugObject, 'toggleDarkTheme').name('Toggle dark theme');
        sceneFolder.add(this.debugObject, 'queueThemeSwitch').name('Queue theme switch');
    }
}
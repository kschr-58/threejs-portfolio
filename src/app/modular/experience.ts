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
import { ThemeService } from '../services/theme.service';

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

    // Materials & colors
    private lightThemeColor = new THREE.Color(0xf2f0ef);
    private darkThemeColor = new THREE.Color(0x1c1c1c);
    private basicThemeMaterial!: THREE.MeshBasicMaterial;

    // Debugging
    private debugMaterialRed = new THREE.MeshBasicMaterial({color: 'red', wireframe: true, visible: false});
    private debugMaterialCyan = new THREE.MeshBasicMaterial({color: 'cyan', wireframe: true, visible: false});
    private debugObject: {[k: string]: any} = {};

    constructor(
        canvas: HTMLCanvasElement) {
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

        // Manager objects
        this.cameraManager = new CameraManager(this);
        this.rendererManager = new RendererManager(this);

        // World
        this.world = new World(this);

        // Set theme material
        const darkThemeEnabled = ThemeService.getInstance().isDarkThemeEnabled();
        this.basicThemeMaterial = new THREE.MeshBasicMaterial({color: darkThemeEnabled ? this.darkThemeColor : this.lightThemeColor});
        this.basicThemeMaterial.toneMapped = false;

        // Subscribe to events
        this.sizeUtils.resizeEvent.subscribe(() => {
            this.resize();
        });

        this.timeUtils.tickEvent.subscribe(() => {
            this.tick();
        });

        ThemeService.getInstance().themeChangeEvent.subscribe(darkThemeEnabled => {
            this.basicThemeMaterial.color = darkThemeEnabled ? this.darkThemeColor : this.lightThemeColor;
        });

        window.experience = this;

        const debugEnabled = this.debugManager.isDebugModeEnabled();
        if (debugEnabled) this.setDebugSettings();
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

    public getBasicThemeMaterial(): THREE.MeshBasicMaterial {
        return this.basicThemeMaterial;
    }
    
    public getDebugMaterialRed(): THREE.MeshBasicMaterial {
        return this.debugMaterialRed;
    }

    public getDebugMaterialCyan(): THREE.MeshBasicMaterial {
        return this.debugMaterialCyan;
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
        // Prevent objects from animating while page is inactive
        if (document.hidden) return;

        this.cameraManager.tick();
        this.world.tick();
        this.rendererManager.tick();

        if (this.debugManager.isDebugModeEnabled()) this.debugManager.tick();
    }

    private setDebugSettings(): void {
        const gui = this.debugManager.getGUI();
        this.debugMaterialCyan.visible = this.debugMaterialRed.visible = true;

        this.basicThemeMaterial.copy(this.debugMaterialCyan);

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
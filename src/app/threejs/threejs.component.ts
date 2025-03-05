import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import DebugService from '../services/debug.service';
import ResourceLoadingService from '../services/resource-loading.service';
import SizesService from '../services/sizes.service';
import { ThemeService } from '../services/theme.service';
import CameraManager from './managers/camera-manager';
import { RendererManager } from './managers/renderer-manager';
import RaycastUtils from './utils/raycast-utils';
import SharedMaterialsUtils from './utils/shared-materials-utils';
import { sourcesArray } from './utils/sources';
import TimeUtils from './utils/time-utils';
import World from './world/world';

@Component({
  selector: 'app-threejs',
  templateUrl: './threejs.component.html',
  styleUrl: './threejs.component.scss'
})
export class ThreeJSComponent implements OnInit {
  private static INSTANCE: ThreeJSComponent;

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

  constructor() {
    // Check if instance already exists
    if (ThreeJSComponent.INSTANCE != null) throw new Error('Trying to reinstantiate ThreeJS component');

    ThreeJSComponent.INSTANCE = this;
  }

  public ngOnInit(): void {
    const canvasElement = document.getElementById('main_canvas');
    if (!(canvasElement instanceof HTMLCanvasElement)) throw new Error('Could not find canvas element');

    this.canvas = canvasElement;

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

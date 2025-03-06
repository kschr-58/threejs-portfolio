import { CubeTexture, CubeTextureLoader, LoadingManager, NearestFilter, Texture, TextureLoader } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Subject } from "rxjs";
import { Injectable } from "@angular/core";
import Source from "src/models/source";

@Injectable({
    providedIn: 'root'
})
export default class ResourceLoadingService {
    private static INSTANCE: ResourceLoadingService;

    // Resources
    public gltfMap = new Map<string, GLTF>;
    public textureMap = new Map<string, Texture>;
    public cubeTextureMap = new Map<string, CubeTexture>;

    // Loaders
    private loadingManager!: LoadingManager;
    private gltfLoader!: GLTFLoader;
    private textureLoader!: TextureLoader;
    private cubeTextureLoader!: CubeTextureLoader;

    // Events
    public loadingStartedEvent = new Subject<void>();
    public loadingFinishedEvent = new Subject<boolean>();
    public loadingProgressEvent = new Subject<number>();

    // Values
    private resourcesLoaded: boolean = false;

    constructor() {
        if (!ResourceLoadingService.INSTANCE) ResourceLoadingService.INSTANCE = this;
        else throw new Error('Trying to re-instantiate ResourceLoadingService');

        this.setLoadingManager();
        this.setLoaders();
    }

    public static getInstance(): ResourceLoadingService {
        return this.INSTANCE;
    }

    public loadResources(sources: Source[]): void {
        this.loadingStartedEvent.next();

        for (const source of sources) {
            if (source.type == 'gltf') {
                if (source.path == undefined) throw new Error('Source does not contain path');
                this.gltfLoader.load(source.path, gltf => {
                    this.gltfMap.set(source.name, gltf);
                });
            }else if (source.type == 'texture') {
                if (source.path == undefined) throw new Error('Source does not contain path');
                this.textureLoader.load(source.path, texture => {
                    this.textureMap.set(source.name, texture);
                });
            } else if (source.type == 'gltfTexture') {
                if (source.path == undefined) throw new Error('Source does not contain path');
                this.textureLoader.load(source.path, texture => {
                    texture.flipY = false;
                    texture.magFilter = NearestFilter;
                    this.textureMap.set(source.name, texture);
                });
            } else if (source.type == 'cubeTexture') {
                if (source.paths == undefined) throw new Error('Source does not contain paths');
                this.cubeTextureLoader.load(source.paths, texture => {
                    this.cubeTextureMap.set(source.name, texture);
                });
            }
        }
    }

    public resourcesReady(): boolean {
        return this.resourcesLoaded;
    }

    private setLoadingManager(): void {
        this.loadingManager = new LoadingManager(
            // On load
            () => {
                this.resourcesLoaded = true;
                this.loadingFinishedEvent.next(true);
            },
            // On progress
            (itemUrl, itemsLoaded, itemsTotal) => {
                const progress = itemsLoaded / itemsTotal;
                this.loadingProgressEvent.next(progress);
            },
            (url) => {
                this.loadingFinishedEvent.next(false);
                throw new Error(`Could not load resource: ${url}`);
            }
        );
    }

    private setLoaders(): void {
        this.gltfLoader = new GLTFLoader(this.loadingManager);
        this.textureLoader = new TextureLoader(this.loadingManager);
        this.cubeTextureLoader = new CubeTextureLoader(this.loadingManager);
    }
}

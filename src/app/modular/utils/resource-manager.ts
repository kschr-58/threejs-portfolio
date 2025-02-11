import { CubeTexture, CubeTextureLoader, Group, NearestFilter, Texture, TextureLoader } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Source } from "../sources";
import { Subject } from "rxjs";

export default class ResourceManager {
    private sources: Source[];

    // Resources
    public gltfMap = new Map<string, GLTF>;
    public textureMap = new Map<string, Texture>;
    public cubeTextureMap = new Map<string, CubeTexture>;

    // Loaders
    private gltfLoader!: GLTFLoader;
    private textureLoader!: TextureLoader;
    private cubeTextureLoader!: CubeTextureLoader;

    // Events
    public resourcesLoadedEvent = new Subject<boolean>();

    private resourcesLoaded: boolean = false;
    
    constructor(sources: Source[]) {
        this.sources = sources;

        this.setLoaders();
        this.loadResources();
    }

    public async loadResources(): Promise<void> {
        try {
            for (const source of this.sources) {
                if (source.type == 'gltf') {
                    if (source.path == undefined) throw new Error('Source does not contain path');
                    await this.gltfLoader.loadAsync(source.path)
                    .then(gltf => {
                        this.gltfMap.set(source.name, gltf);
                    });
                }else if (source.type == 'texture') {
                    if (source.path == undefined) throw new Error('Source does not contain path');
                    await this.textureLoader.loadAsync(source.path)
                    .then(texture => {
                        this.textureMap.set(source.name, texture);
                    });
                } else if (source.type == 'gltfTexture') {
                    if (source.path == undefined) throw new Error('Source does not contain path');
                    await this.textureLoader.loadAsync(source.path)
                    .then(texture => {
                        texture.flipY = false;
                        texture.magFilter = NearestFilter;
                        this.textureMap.set(source.name, texture);
                    });
                } else if (source.type == 'cubeTexture') {
                    if (source.paths == undefined) throw new Error('Source does not contain paths');
                    await this.cubeTextureLoader.loadAsync(source.paths)
                    .then(texture => {
                        this.cubeTextureMap.set(source.name, texture);
                    });
                }
            }
  
            this.resourcesLoaded = true;
            this.resourcesLoadedEvent.next(true);
        } catch (err) {
            this.resourcesLoadedEvent.next(false);
            console.log(err);
        }
    }

    public resourcesReady(): boolean {
        return this.resourcesLoaded;
    }

    private setLoaders(): void {
        this.gltfLoader = new GLTFLoader();
        this.textureLoader = new TextureLoader();
        this.cubeTextureLoader = new CubeTextureLoader();
    }
}

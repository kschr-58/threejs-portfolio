export class Source {
    public name: string;
    public type: string;
    public paths?: string[];
    public path?: string;

    constructor(name: string, type: string, path?: string, paths?: string[]) {
        this.name = name;
        this.type = type;
        this.path = path;
        this.paths = paths;
    }
}

export const sourcesArray = [
    new Source(
        'perlin',
        'texture',
        'http://localhost:8080/textures/perlin.png',
    ),
    new Source(
        'study',
        'gltf',
        'http://localhost:8080/Study_Baked.glb'
    ),
    new Source(
        'monoboyTest',
        'gltf',
        'http://localhost:8080/SittingTest.glb'
    ),
    new Source(
        'character',
        'gltf',
        'http://localhost:8080/Character.glb'
    ),
    new Source(
        'logos',
        'gltf',
        'http://localhost:8080/Logos.glb'
    ),
    new Source(
        'characterTexture',
        'gltfTexture',
        'http://localhost:8080/textures/MonoboyTexture.jpg'
    ),
    new Source(
        'characterTextureInverted',
        'gltfTexture',
        'http://localhost:8080/textures/MonoboyTexture_Inverted_2.jpg'
    ),
    new Source(
        'snapVFX',
        'texture',
        'http://localhost:8080/textures/Snap_VFX.jpg'
    ),
    new Source(
        'logosTexture',
        'gltfTexture',
        'http://localhost:8080/textures/Logos_Texture.jpg'
    ),
];

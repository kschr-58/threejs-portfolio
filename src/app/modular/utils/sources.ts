import { environment } from "src/environments/environment";
import Source from "src/models/source";

export const sourcesArray = [
    new Source(
        'character',
        'gltf',
        `${environment.apiUrl}/file/Character.glb`
    ),
    new Source(
        'study-mono',
        'gltf',
        `${environment.apiUrl}/file/Study_Mono.glb`
    ),
    new Source(
        'logos',
        'gltf',
        `${environment.apiUrl}/file/Logos.glb`
    ),
    new Source(
        'characterTexture',
        'gltfTexture',
        `${environment.apiUrl}/texture/MonoboyTexture.png`
    ),
    new Source(
        'snapVFX',
        'texture',
        `${environment.apiUrl}/texture/Snap_VFX.jpg`
    ),
    new Source(
        'logosTexture',
        'gltfTexture',
        `${environment.apiUrl}/texture/Logos_Texture.jpg`
    ),
];

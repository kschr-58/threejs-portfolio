import { environment } from "src/environments/environment";
import Source from "src/models/source";

export const sourcesArray = [
    new Source(
        'character',
        'gltf',
        `${environment.apiUrl}/model/Character.glb`
    ),
    new Source(
        'study-mono',
        'gltf',
        `${environment.apiUrl}/model/Study_Mono.glb`
    ),
    new Source(
        'logos',
        'gltf',
        `${environment.apiUrl}/model/Logos.glb`
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
        `${environment.apiUrl}/texture/Logos_Texture.png`
    ),
];

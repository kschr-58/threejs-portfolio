import { Group, Material, Mesh, MeshBasicMaterial, SRGBColorSpace, Texture, Vector3 } from "three";
import { Experience } from "../../experience";
import Logo from "./logo";
import gsap from "gsap";

export default class Logos {
    private logos = new Map<string, Logo>();

    // ThreeJS components
    private experience: Experience;
    private sceneGroup!: Group;
    private material!: Material;
    private logosTexture!: Texture;
    private logoMeshes: Mesh[] = [];

    // Positions
    private logosStartingPosition = new Vector3(0, -1.2, .25);
    private logoMargin = new Vector3(.17, 0, 0);

    constructor(experience: Experience) {
        this.experience = experience;

        this.mapResources();
        this.instantiateMeshes();
        this.logosBounceAnimation();
    }

    public tick(): void {
        const logoComponents = this.logos.values();

        for (const logo of logoComponents) {
            logo.tick();
        }
    }

    private mapResources(): void {
        const gltf = this.experience.getResourceManager().gltfMap.get('logos');
        const textureResource = this.experience.getResourceManager().textureMap.get('logosTexture');

        if (gltf == undefined || textureResource == undefined) throw new Error('Cannot load logos resources');

        textureResource.colorSpace = SRGBColorSpace;
        this.logosTexture = textureResource;

        this.material = new MeshBasicMaterial({map: textureResource});
        this.material.toneMapped = false;

        this.sceneGroup = gltf.scene;
        this.sceneGroup.traverse(node => {
            if (node instanceof Mesh) {
                node.material = this.material;
                this.logoMeshes.push(node);
            }
        });
    }

    private instantiateMeshes(): void {
        let index = 0;
        let seesawIndex = 0;

        for (const logoMesh of this.logoMeshes) {
            // Position left or right from starting position based on index
            const isOnLeftSide = index % 2 == 0;

            console.log(`index: ${index} seesaw: ${seesawIndex}`);

            const relativeMargin = new Vector3();
            relativeMargin.copy(this.logoMargin);
            if (isOnLeftSide) {
                relativeMargin.x *= -1;
                relativeMargin.y *= -1;
                relativeMargin.z *= -1;
            }
            
            const newPosition = new Vector3();
            newPosition.copy(this.logosStartingPosition);
            newPosition.x += relativeMargin.x * seesawIndex;
            newPosition.y += relativeMargin.y * seesawIndex;
            newPosition.z += relativeMargin.z * seesawIndex;

            const newLogo = new Logo(this.experience, logoMesh, newPosition);

            this.logos.set(logoMesh.name, newLogo);

            index++;
            if (isOnLeftSide) seesawIndex ++;
        }
    }

    private logosBounceAnimation(): void {
        const logoComponents = this.logos.values();

        let index = 0;
        for (const logo of logoComponents) {
            const mesh = logo.getMesh();

            gsap.from(mesh.position, {y: -1.5, duration: 1.5 + index * .1, ease: 'bounce.out', delay: index * .2});
            index++;
        }
    }
}
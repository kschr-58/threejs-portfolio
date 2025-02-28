import { Color, Group, Mesh, MeshBasicMaterial, Plane, ShaderMaterial, Texture, Vector2, Vector3 } from "three";
import { Experience } from "../../experience";
import Logo from "./logo";
import ResourceLoadingService from "src/app/services/resource-loading.service";
import PagePlane from "../page-plane";

export default class LogosCollection {
    private logos = new Map<string, Logo>();

    // ThreeJS components
    private experience: Experience;
    private sceneGroup!: Group;
    private logoMeshes: Mesh[] = [];
    private logoBackgroundMesh!: Mesh;

    // Collection positioning
    private collectionPage: number;
    private collectionLeftMargin: number;
    private collectionTopMargin: number;
    private collectionZPosition: number;

    // Logo positioning
    private logoBaseAnimationDuration = 1.5;
    private logosPerRow: number;
    private logoHorizontalMargin: number; // Value represents a screen percentage
    private logoVerticalMargin: number;

    // Debugging
    private debugObject: {[k: string]: any} = {};

    constructor(
        experience: Experience, 
        page: number, 
        collectionLeftMargin: number, 
        collectionTopMargin: number, 
        collectionZPosition: number,
        logosPerRow: number,
        logoHorizontalMargin: number,
        logoVerticalMargin: number
    ) {
        this.experience = experience;
        this.collectionPage = page;
        this.collectionLeftMargin = collectionLeftMargin;
        this.collectionTopMargin = collectionTopMargin;
        this.collectionZPosition = collectionZPosition;
        this.logosPerRow = logosPerRow;
        this.logoHorizontalMargin = logoHorizontalMargin;
        this.logoVerticalMargin = logoVerticalMargin;

        this.mapResources();
        this.instantiateMeshes();
    }

    private mapResources(): void {
        const gltf = ResourceLoadingService.getInstance().gltfMap.get('logos');
        
        if (gltf == undefined) throw new Error('Cannot load logos resources');

        this.sceneGroup = gltf.scene;
        this.sceneGroup.traverse(node => {
            if (node instanceof Mesh) {
                if (node.name == 'Background') {
                    node.material = new MeshBasicMaterial({
                        color: new Color('black'),
                        transparent: true,
                        opacity: 0.5
                    })
                    this.logoBackgroundMesh = node;
                }
                else this.logoMeshes.push(node);
            }
        });
    }

    private instantiateMeshes(): void {
        let columnIndex = 0;
        let row = 0;

        const yMargin = this.collectionTopMargin + (this.logoVerticalMargin * row);

        for (const logoMesh of this.logoMeshes) {
            if (columnIndex % this.logosPerRow == 0 && columnIndex > 0) {
                columnIndex = 0;
                row++;
            }

            const xMargin = this.collectionLeftMargin + (this.logoHorizontalMargin * columnIndex);

            const newLogo = new Logo(this.experience, this.logoBackgroundMesh, logoMesh, this.collectionPage, xMargin, yMargin, this.collectionZPosition);

            this.logos.set(logoMesh.name, newLogo);

            columnIndex++;
        }
    }
}
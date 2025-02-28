import { Color, Group, Mesh, MeshBasicMaterial, Plane, ShaderMaterial, Texture, Vector2, Vector3 } from "three";
import { Experience } from "../../experience";
import Logo from "./logo";
import ResourceLoadingService from "src/app/services/resource-loading.service";
import PagePlane from "../page-plane";

export default class LogosCollection {
    // ThreeJS components
    private experience: Experience;
    private sceneGroup!: Group;
    private logoMeshes: Mesh[] = [];

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
            if (node instanceof Mesh && node.children.length > 0) {
                this.logoMeshes.push(node);
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

            const newLogo = new Logo(this.experience, logoMesh, this.collectionPage, xMargin, yMargin, this.collectionZPosition);

            columnIndex++;
        }
    }
}
import * as THREE from "three";
import { Experience } from "../../experience";
import PageComponent3D from "../page-component-3d";
import SizesService from "src/app/services/sizes.service";

export default class LogosForegroundPlane extends PageComponent3D {
    private geometry!: THREE.PlaneGeometry;

    // Values
    private planeDimensions = new THREE.Vector2(1, .18);

    constructor(experience: Experience, page: number, leftMargin: number, topMargin: number, zPosition: number) {
        super(experience, page, leftMargin, topMargin, zPosition);

        this.mapResources();
        this.addToScene();
        this.resize();

        // Subscribe to camera resize event
        SizesService.getInstance().resizeEvent.subscribe(() => {
            this.resize();
        });
    }

    protected mapResources(): void {
        const material = this.experience.getBasicThemeMaterial();
        this.geometry = new THREE.PlaneGeometry(this.planeDimensions.x, this.planeDimensions.y);
        this.mesh = new THREE.Mesh(this.geometry, material);
        this.mesh.name = 'Foreground_Plane';

        this.positionableObject = this.mesh;
    }

    protected override addToScene(): void {
        this.experience.getScene().add(this.mesh);

        super.addToScene();
    }

    private resize(): void {
        const aspect = SizesService.getInstance().getAspect();

        this.mesh.scale.x = aspect;
    }
}
import * as THREE from "three";
import { Experience } from "../experience";

export default class ForegroundPlane {
    private experience: Experience;
    private geometry: THREE.PlaneGeometry;
    private mesh: THREE.Mesh;

    // Positions & rotations
    private meshPosition = new THREE.Vector3(0, -.9, 0);

    // Values
    private planeDimensions = new THREE.Vector2(2, 1);

    constructor(experience: Experience) {
        this.experience = experience;

        const material = experience.getBasicThemeMaterial();
        this.geometry = new THREE.PlaneGeometry(this.planeDimensions.x, this.planeDimensions.y);
        this.mesh = new THREE.Mesh(this.geometry, material);

        this.mesh.position.copy(this.meshPosition);

        this.addToScene();
    }

    private addToScene(): void {
        this.experience.getScene().add(this.mesh);
    }
}
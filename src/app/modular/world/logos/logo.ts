import { Mesh, Vector3 } from "three";
import { Experience } from "../../experience";

export default class Logo {
    private experience: Experience;
    private mesh!: Mesh;

    private position: Vector3;

    constructor(experience: Experience, mesh: Mesh, position: Vector3) {
        this.experience = experience;
        this.mesh = mesh;
        this.position = position;

        this.addToScene();
    }

    public getMesh(): Mesh {
        return this.mesh;
    }

    public tick(): void {
        const elapsedTime = this.experience.getTimeUtils().getElapsedTime();
        const yRotation = (Math.sin(elapsedTime) + 1) * Math.PI; // Allow for full rotation to the other side
        const zRotation = Math.sin(elapsedTime) *  - .5;

        this.mesh.rotation.y = yRotation;
        this.mesh.rotation.z = zRotation;
    }

    private addToScene(): void {
        this.mesh.position.copy(this.position);

        this.experience.getScene().add(this.mesh);
    }
}
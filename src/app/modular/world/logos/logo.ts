import { Mesh, Vector3 } from "three";
import { Experience } from "../../experience";
import PageComponent3D from "../page-component-3d";

export default class Logo extends PageComponent3D {
    constructor(experience: Experience, mesh: Mesh, page: number, leftMargin: number, topMargin: number, zPosition: number) {
        super(experience, page, leftMargin, topMargin, zPosition);

        this.mesh = mesh;
        this.mapResources();
        this.addToScene();
    }

    protected mapResources(): void {


        this.positionableObject = this.mesh;
    }

    public getMesh(): Mesh {
        return this.mesh;
    }

    public tick(): void {
        const elapsedTime = this.experience.getTimeUtils().getElapsedTime();
        const yRotation = (Math.sin(elapsedTime) + 1) * Math.PI; // Allow for full rotation to the other side
        const zRotation = Math.sin(elapsedTime) *  - .1;

        this.mesh.rotation.y = yRotation;
        this.mesh.rotation.z = zRotation;
    }
    
    protected override addToScene(): void {
        this.experience.getScene().add(this.mesh);

        super.addToScene();
    }

    protected override positionComponent(): void {
        super.positionComponent();
    }
}
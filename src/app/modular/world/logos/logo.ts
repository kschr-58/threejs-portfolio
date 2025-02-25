import { Mesh, ShaderMaterial, Raycaster } from "three";
import { Experience } from "../../experience";
import PageComponent3D from "../page-component-3d";
import gsap from 'gsap';
import RaycastObject from "src/models/raycast-object";

export default class Logo extends PageComponent3D {
    private material!: ShaderMaterial;

    constructor(experience: Experience, mesh: Mesh, page: number, leftMargin: number, topMargin: number, zPosition: number) {
        super(experience, page, leftMargin, topMargin, zPosition);

        this.mesh = mesh;
        this.mapResources();
        this.addToScene();
        this.registerRaycastObject();
    }

    protected mapResources(): void {
        this.positionableObject = this.mesh;
        const mat = this.mesh.material;
        if (!(mat instanceof ShaderMaterial)) throw new Error('Logo has not been assigned shader material');

        this.material = mat;
    }

    public getMesh(): Mesh {
        return this.mesh;
    }

    public tick(): void {
        const elapsedTime = this.experience.getTimeUtils().getElapsedTime();
        // const yRotation = (Math.sin(elapsedTime) + 1) * Math.PI; // Allow for full rotation to the other side
        const yRotation = Math.sin(elapsedTime) *  0.25;
        const zRotation = Math.sin(elapsedTime) *  - 0.1;

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

    private registerRaycastObject(): void {
        const onInitialHoverFunction = () => this.textureFill();
        const onExitFunction = () => this.undoTextureFill();
        const raycastObject = new RaycastObject(this.mesh, undefined, onExitFunction, undefined, onInitialHoverFunction);

        this.experience.getRaycastUtils().addRaycastObject(raycastObject);
    }

    private textureFill(): void {
        gsap.to(this.material.uniforms['uTextureCoverage'], { value: 100.0, duration: 0.3, ease: 'power1.in'});
    }

    private undoTextureFill(): void {
        gsap.to(this.material.uniforms['uTextureCoverage'], { value: 0.0, duration: 0.3, ease: 'power1.out'});
    }
}
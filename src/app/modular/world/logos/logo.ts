import { Mesh, ShaderMaterial, Raycaster, Texture, Vector3 } from "three";
import { Experience } from "../../experience";
import PageComponent3D from "../page-component-3d";
import gsap from 'gsap';
import RaycastObject from "src/models/raycast-object";
import vertexShader from "../../shaders/logos/vertex.glsl";
import fragmentShader from "../../shaders/logos/fragment.glsl";
import ResourceLoadingService from "src/app/services/resource-loading.service";

export default class Logo extends PageComponent3D {
    private texture!: Texture;
    private material!: ShaderMaterial;

    constructor(experience: Experience, mesh: Mesh, page: number, leftMargin: number, topMargin: number, zPosition: number) {
        super(experience, page, leftMargin, topMargin, zPosition);

        this.mesh = mesh;
        this.mapResources();
        this.addToScene();
        this.registerRaycastObject();
    }

    protected mapResources(): void {
        const textureResource = ResourceLoadingService.getInstance().textureMap.get('logosTexture');

        if (textureResource == undefined) throw new Error('Cannot load logos resources');

        this.texture = textureResource;
        
        this.positionableObject = this.mesh;
        this.material = new ShaderMaterial({
            toneMapped: false,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                uMeshSize: { value: 1.1 },
                uTextureCoverage: { value: 0.0 },
                uRingSize: { value: 0.05 },
                uRingColor: { value: new Vector3(0.5, 0.0, 1.0) },
                uTexture: { value: this.texture },
            }
        });

        this.mesh.material = this.material;
    }

    public getMesh(): Mesh {
        return this.mesh;
    }

    public tick(): void {
        const elapsedTime = this.experience.getTimeUtils().getElapsedTime();
        // const yRotation = (Math.sin(elapsedTime) + 1) * Math.PI; // Allow for full rotation to the other side
        const yRotation = Math.sin(elapsedTime) *  0.3;
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
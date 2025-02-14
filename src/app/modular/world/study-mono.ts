import * as THREE from "three";
import { Experience } from "../experience";
import ResourceLoadingService from "src/app/services/resource-loading.service";
import PageComponent3D from "./page-component-3d";

export default class StudyMono extends PageComponent3D {
    // Resources
    private sceneGroup!: THREE.Group;

    // Rotations
    private defaultRotation = new THREE.Vector3(.5, -.75, 0);

    // Values
    private sceneScale = .17;
    private rotationAmount = .05;

    constructor(experience: Experience, page: number, leftMargin: number, topMargin: number, zPosition: number) {
        super(experience, page, leftMargin, topMargin, zPosition);

        this.mapResources();
        this.addToScene();

        if (experience.getDebugManager().isDebugModeEnabled()) this.setDebugOptions();
    }

    public tick(): void {
        const elapsedTime = this.experience.getTimeUtils().getElapsedTime();
        const rotationOffset = Math.sin(elapsedTime) * this.rotationAmount;

        this.positionableObject.rotation.y = this.defaultRotation.y + rotationOffset; // TODO rotate based on horizontal mouse movement
    }

    protected override mapResources(): void {
        const resource = ResourceLoadingService.getInstance().gltfMap.get('study-mono');
        if (resource == undefined || resource.scene == undefined) throw new Error('study-mono resource cannot be loaded');
        
        this.sceneGroup = resource.scene;

        const mat = this.experience.getMeshMonoMaterial();
        const outlineMat = this.experience.getOutlineMaterial();

        this.sceneGroup.traverse(node => {
            if (node instanceof THREE.Object3D && node.name == 'Scene') {
                this.positionableObject = node;
            }
            if (node instanceof THREE.Mesh) {
                if (node.material.name == 'Mono_White') {
                    node.material = mat;
                }
                else if (node.material.name == 'Outline_Black') {
                    node.material = outlineMat;
                }
            }
        });
    }

    protected override addToScene(): void {
        this.sceneGroup.scale.set(this.sceneScale, this.sceneScale, this.sceneScale);
        this.positionableObject.rotation.set(
            this.defaultRotation.x,
            this.defaultRotation.y,
            this.defaultRotation.z
        );

        this.experience.getScene().add(this.sceneGroup);

        super.addToScene();
    }

    private setDebugOptions(): void {
        const gui = this.experience.getDebugManager().getGUI();

        const folder = gui.addFolder('StudyScene');
        folder.add(this.positionableObject.rotation, 'x', -2, 2);
        folder.add(this.positionableObject.rotation, 'y', -2, 2);
        folder.add(this.positionableObject.rotation, 'z', -2, 2);
    }
}
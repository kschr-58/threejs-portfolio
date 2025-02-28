import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { Experience } from "../experience";
import * as THREE from 'three';
import ResourceLoadingService from "src/app/services/resource-loading.service";
import SizesService from "src/app/services/sizes.service";
import DebugService from "src/app/services/debug.service";

export default class MonoboyTest {
    private experience: Experience;

    // Animation
    private animationMixer: THREE.AnimationMixer;

    // Resources
    private gltf: GLTF;
    private sceneGroup: THREE.Group;
    private animations: THREE.AnimationClip[];

    // Scene objects
    private headBone!: THREE.Bone;
    private headRotationObject!: THREE.Object3D;
    private raycastPlane!: THREE.Mesh;
    private debugHeadTrackingSphere!: THREE.Mesh;

    // Positions and rotations
    private headPosition: THREE.Vector3 = new THREE.Vector3;
    private mousePosition: THREE.Vector2 = new THREE.Vector2;
    private defaultRotation: THREE.Quaternion = new THREE.Quaternion;

    // Interaction variables
    private currentInteractionObject: THREE.Intersection | null = null;

    // Values
    private animationSpeed = .02;
    private headRotationSpeed = .02;
    private headRotationEnabled = false;
    private debugEnabled = false;

    constructor(experience: Experience) {
        this.experience = experience;

        const resource = ResourceLoadingService.getInstance().gltfMap.get('monoboyTest');
        if (resource == undefined || resource.scene == undefined) throw new Error('Could not load monoboytest resource');

        this.gltf = resource;
        this.sceneGroup = resource.scene;
        this.sceneGroup.scale.set(3.8, 3.8, 3.8);
        this.sceneGroup.position.set(1, .5, 1.4);

        this.animationMixer = new THREE.AnimationMixer(this.sceneGroup);
        this.animations = resource.animations;

        // Check for debug mode
        if (DebugService.getInstance().isDebugModeEnabled()) this.debugEnabled = true;

        this.setMaterials();
        this.addToScene();
        this.startSceneAnimations();
        this.addTrackingSphere();
        this.addRaycastPlane();
        this.addDebugSpheres();
    }

    public tick() {
        this.animationMixer.update(this.animationSpeed);
        this.cursorRaycast();

        // Smooth headbone rotation towards mouse position or back to default position
        if (this.headRotationEnabled) this.headBone.quaternion.slerp(this.headRotationObject.quaternion, this.headRotationSpeed);
        else this.headBone.quaternion.slerp(this.defaultRotation, this.headRotationSpeed);
    }

    private setMaterials() {
        const outlineMaterial = new THREE.MeshBasicMaterial({color: 0x000000});

        this.sceneGroup.traverse(node => {
            if (node instanceof THREE.Mesh && node.material.name == 'Outline_Black') node.material = outlineMaterial;
        });
    }

    private addTrackingSphere() {
        this.sceneGroup.traverse(node => {
            if (node instanceof THREE.Bone && node.name == "DEF-spine006") {
                this.headBone = node;
                // Set default head rotation
                this.defaultRotation = this.headBone.quaternion.clone();

                // Add head rotation object
                this.headRotationObject = new THREE.Mesh(
                    new THREE.SphereGeometry(.2, 6, 6),
                    new THREE.MeshBasicMaterial({color: 'yellow', wireframe: true, transparent: true, opacity: this.debugEnabled ? 0.5 : 0})
                );

                this.headRotationObject.position.copy(this.headBone.position);
                this.headBone.add(this.headRotationObject);
            }
        });
    }

    private addRaycastPlane(): void {
        this.raycastPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(3.5, 3.5),
            new THREE.MeshStandardMaterial({color: 'red', wireframe: true, transparent: true, opacity: this.debugEnabled ? 0.5 : 0})
        );

        this.raycastPlane.position.set(1.7, 5, 2.1);
        this.raycastPlane.rotateX(Math.PI / -4);

        this.experience.getScene().add(this.raycastPlane);

        this.raycastPlane.updateMatrixWorld();
    }

    private addToScene() {
        this.experience.getScene().add(this.sceneGroup);
    }

    private startSceneAnimations(): void {
        const sittingClip = THREE.AnimationClip.findByName(this.animations, 'Sit');
        const sittingAction = this.animationMixer.clipAction(sittingClip);
        sittingAction.clampWhenFinished = true;
        sittingAction.loop = THREE.LoopRepeat;

        const typingClip = THREE.AnimationClip.findByName(this.animations, 'Typing');
        THREE.AnimationUtils.makeClipAdditive(typingClip);
        const typingAction = this.animationMixer.clipAction(typingClip);
        typingAction.blendMode = THREE.AdditiveAnimationBlendMode;

        const headClipA = THREE.AnimationClip.findByName(this.animations, 'Head_Movement_A');
        THREE.AnimationUtils.makeClipAdditive(headClipA);
        const headActionA = this.animationMixer.clipAction(headClipA);
        headActionA.blendMode = THREE.AdditiveAnimationBlendMode;

        sittingAction.play();
        typingAction.play();
    }

    // region Raycasting

    private cursorRaycast(): void {
        // Get mouseposition
        const windowWidth = SizesService.getInstance().getWidth();
        const windowHeight = SizesService.getInstance().getHeight();
        const mousePos = this.experience.getRaycastUtils().getCursorPosition();

        this.mousePosition.x = mousePos.x / windowWidth * 2 - 1;
        this.mousePosition.y = (mousePos.y / windowHeight * 2 - 1) * - 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(this.mousePosition, this.experience.getCameraManager().getCamera());

        const intersects = raycaster.intersectObjects([this.raycastPlane, this.headRotationObject]);
        if (intersects.length > 0) {
            // Check if intersect with raycast plane exists
            const headTrackingPlaneIntersection = intersects.find(
            intersect => intersect.object == this.raycastPlane
            );

            // Check for interactable objects being intersected
            const headBoneIntersection = intersects.find(
            intersect => intersect.object == this.headRotationObject
            );

            if (headTrackingPlaneIntersection) {
            const contactPoint = headTrackingPlaneIntersection.point;

            this.debugHeadTrackingSphere.position.x = contactPoint.x;
            this.debugHeadTrackingSphere.position.y = contactPoint.y;
            this.debugHeadTrackingSphere.position.z = contactPoint.z;
        
            this.headRotationObject.lookAt(contactPoint);
            this.headRotationEnabled = true;
            }

            if (headBoneIntersection) this.currentInteractionObject = headBoneIntersection;
            else this.currentInteractionObject = null;

            return;
        }

        this.headRotationEnabled = false;
    }

    private addDebugSpheres(): void {
        this.debugHeadTrackingSphere = new THREE.Mesh(
            new THREE.SphereGeometry(.1, 6, 6), 
            new THREE.MeshBasicMaterial({color: 'blue', wireframe: true, transparent: true, opacity: this.debugEnabled ? 0.5 : 0})
        );

        this.experience.getScene().add(this.debugHeadTrackingSphere);
    }
    
    // endregion
}
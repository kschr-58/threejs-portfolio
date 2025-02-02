import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { Experience } from "../experience";
import * as THREE from 'three';

export default class Character {
    private experience: Experience;

    // Resources
    private gltf: GLTF;
    private sceneGroup: THREE.Group;
    private textureMaterial!: THREE.MeshBasicMaterial;
    private outlineMaterial!: THREE.MeshBasicMaterial;
    private defaultTexture!: THREE.Texture;
    private invertedTexture!: THREE.Texture;
    private interactionObjectMaterial = new THREE.MeshBasicMaterial({color: 'red', wireframe: true, visible: false});

    // Scene objects
    private headBone!: THREE.Bone;
    private headRotationObject!: THREE.Object3D;
    private raycastPlane!: THREE.Mesh;
    private debugHeadTrackingSphere!: THREE.Mesh;

    // Animation
    private animationMixer: THREE.AnimationMixer;
    private animations: THREE.AnimationClip[];
    private animationActions = new Map<string, THREE.AnimationAction>();
    private isCurrentlyPlayingAction = false;
    private isCurrentlyPlayingMTAction = false;
    private previousAction!: THREE.AnimationAction;
    private previousMTAction!: THREE.AnimationAction;
    private fingerSnapAction!: THREE.AnimationAction;
    private queuedAction: THREE.AnimationAction | null = null;
    private queuedMTAction: THREE.AnimationAction | null = null;

    // Morph targets
    private morphTargetMeshes: THREE.Mesh[] = [];
    private morphTargetsDict!: { [key: string]: number };
    private morphTargetInfluences: number[] = [];

    // Positions and rotations
    private scenePosition = new THREE.Vector3(.38, -1.575, 0);
    private headWorldPosition = new THREE.Vector3();
    private mousePosition: THREE.Vector2 = new THREE.Vector2;
    private defaultRotation: THREE.Quaternion = new THREE.Quaternion;

    // Interaction variables
    private currentInteractionObject: THREE.Intersection | null = null;

    // Values
    private animationSpeed = .0011;
    private headRotationSpeed = 2;
    private headRotationEnabled = false;
    private raycastPlaneRadius = new THREE.Vector2(.79, .7);
    private blinkDelay = 5000;
    private themeTransitionQueued = false;
    private themeTransitionInProgress = false;

    // Debugging
    private debugObject: {[k: string]: any} = {};

    constructor(experience: Experience) {
        this.experience = experience;

        const resource = experience.getResourceManager().gltfMap.get('character');
        const darkTexture = experience.getResourceManager().textureMap.get('characterTextureInverted');

        if (resource == undefined || resource.scene == undefined) throw new Error('Could not load character resource');
        if (darkTexture == undefined) throw new Error('Could not load character texture');

        this.gltf = resource;
        this.sceneGroup = resource.scene;
        this.sceneGroup.position.copy(this.scenePosition);

        this.animationMixer = new THREE.AnimationMixer(this.sceneGroup);
        this.animations = resource.animations;

        darkTexture.colorSpace = THREE.SRGBColorSpace;
        this.invertedTexture = darkTexture;

        // Initialization
        this.addToScene();
        this.mapSceneElements();
        this.mapAnimations();
        this.addRaycastPlane();
        this.addTrackingPoint();
        this.setThemeMaterials(experience.getThemeService().isDarkThemeEnabled());

        // Event listeners
        const themeService = experience.getThemeService();
        themeService.themeChangeRequestEvent.subscribe(() => {
            this.themeTransitionQueued = true;
        });
        themeService.themeChangeEvent.subscribe(darkThemeEnabled => {
            this.setThemeMaterials(darkThemeEnabled);
        })

        // Animations
        this.registerAnimationEvents();
        this.startSceneAnimations();
        this.startPeriodicAnimations();

        if (this.experience.getDebugManager().isDebugModeEnabled()) this.setDebugSettings();
    }

    // #region Initialization
    
    private mapSceneElements() {
        this.sceneGroup.traverse(node => {
            if (node instanceof THREE.SkinnedMesh) {
                node.frustumCulled = false; // Prevent camera clipping issues when zooming in
                if (this.morphTargetsDict == undefined && node.morphTargetDictionary && node.morphTargetInfluences) {
                    this.morphTargetsDict = node.morphTargetDictionary;
                    this.morphTargetInfluences = node.morphTargetInfluences;
                }
                this.morphTargetMeshes.push(node);

                if (node.material.name == 'Texture') {
                    this.textureMaterial = node.material;

                    const texture = this.textureMaterial.map;
                    if (texture == undefined) throw new Error('Character is missing texture');

                    texture.colorSpace = THREE.SRGBColorSpace;
                    node.material.toneMapped = false;
                    this.defaultTexture = texture;
                } else if (node.material.name == 'Outline_Black') {
                    node.material = new THREE.MeshBasicMaterial({color: 'black'});
                    node.material.toneMapped = false;

                    this.outlineMaterial = node.material;
                }
            }
            if (node instanceof THREE.Bone && node.name == "DEF-spine006") {
                this.headBone = node;

                // Set head world position
                node.getWorldPosition(this.headWorldPosition);

                // Set default head rotation
                this.defaultRotation = this.headBone.quaternion.clone();

                // Add head rotation object
                this.headRotationObject = new THREE.Mesh(
                    new THREE.SphereGeometry(.2, 6, 6),
                    this.interactionObjectMaterial
                );

                this.headRotationObject.position.copy(this.headBone.position);
                this.headBone.add(this.headRotationObject);
            }
        });
    }

    private mapAnimations(): void {
        for (const animation of this.animations) {
            const action = this.animationMixer.clipAction(animation);

            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;

            if (animation.name == 'Fingersnap') {
                this.fingerSnapAction = action;
            }

            this.animationActions.set(animation.name, action);
        }
    }

    private addToScene() {
        this.experience.getScene().add(this.sceneGroup);
    }

    private setThemeMaterials(darkThemeEnabled: boolean) {
        this.textureMaterial.map = darkThemeEnabled ? this.invertedTexture : this.defaultTexture;
        this.outlineMaterial.color = new THREE.Color(darkThemeEnabled ? 'white' : 'black');
    }

    // #endregion

    // #region Animation

    private startSceneAnimations(): void {
        const climbAction = this.animationActions.get('Climb');
        const climbMTAction = this.animationActions.get('Climb_SK');

        this.playAnimationAction(climbAction);
        this.playAnimationAction(climbMTAction);

        this.queuedAction = this.animationActions.get('Wave') || null;
        this.queuedMTAction = this.animationActions.get('Wave_SK') || null;
    }

    private registerAnimationEvents(): void {
        this.animationMixer.addEventListener('finished', finishedAnimation => {
            this.onAnimationFinish(finishedAnimation);
        });
    }

    private startPeriodicAnimations(): void {
        const blinkMTAction = this.animationActions.get('Blink_SK');

        this.experience.getTimeUtils().registerTimedEvent(this.blinkDelay).subscribe(() => {
            if (!this.isCurrentlyPlayingMTAction) this.playAnimationAction(blinkMTAction);
        });

        // TODO play random idle animations
    }

    private playAnimationAction(action: THREE.AnimationAction | undefined): void {
        if (!action) throw new Error('Animation action is undefined');
        
        const isMTAction = action.getClip().name.endsWith('_SK');

        if (isMTAction) {
            if (this.isCurrentlyPlayingMTAction) return;

            if (this.previousMTAction) this.previousMTAction.fadeOut(0.1);

            action.reset();
            action.play();

            this.isCurrentlyPlayingMTAction = true;
            this.previousMTAction = action;
        } else {
            if (this.isCurrentlyPlayingAction) return;

            if (this.previousAction) this.previousAction.fadeOut(0.1); // Prevents teleporting issues

            action.reset();
            action.play();

            this.isCurrentlyPlayingAction = true;
            this.previousAction = action;
        }
    }
    
    private setMorphTransform(index: number, value: number): void {
        for (const mesh of this.morphTargetMeshes) {
            if (mesh.morphTargetInfluences) mesh.morphTargetInfluences[index] = value;
        }
    }

    private onAnimationFinish(finishedAnimation: {action: THREE.AnimationAction}): void {
        const isMTAction = finishedAnimation.action.getClip().name.endsWith('_SK');

        if (isMTAction) {
            this.isCurrentlyPlayingMTAction = false;

            if (this.queuedMTAction) {
                console.log(`action in queue: ${this.queuedMTAction.getClip().name}`);
                this.playAnimationAction(this.queuedMTAction);
                this.queuedMTAction = null;
            }
        }
        else {
            this.isCurrentlyPlayingAction = false;

            if (this.queuedAction) {
                console.log(`action in queue: ${this.queuedAction.getClip().name}`);
                this.playAnimationAction(this.queuedAction);
                this.queuedAction = null;
            }
        }
    }

    private startThemeTransition(): void {
        // Check if the theme switch animation is already running
        if (this.fingerSnapAction.isRunning()) return;

        this.themeTransitionInProgress = true;

        this.playAnimationAction(this.fingerSnapAction);
    }

    // #endregion

    // #region Raycasting

    private addTrackingPoint(): void {
        this.debugHeadTrackingSphere = new THREE.Mesh(
            new THREE.BoxGeometry(.01, .01, .01), 
            this.interactionObjectMaterial
        );

        this.experience.getScene().add(this.debugHeadTrackingSphere);
    }

    private addRaycastPlane(): void {
        this.raycastPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(this.raycastPlaneRadius.x, this.raycastPlaneRadius.y),
            this.interactionObjectMaterial
        );

        this.raycastPlane.position.x = this.headWorldPosition.x - .07;
        this.raycastPlane.position.y = -.03;
        this.raycastPlane.position.z = this.headWorldPosition.z + .45; // Slight offset for tracking purposes

        this.experience.getScene().add(this.raycastPlane);

        this.raycastPlane.updateMatrixWorld();
    }

    private cursorRaycast(): void {
        // Get mouseposition
        const windowWidth = this.experience.getSizeUtils().getWidth();
        const windowHeight = this.experience.getSizeUtils().getHeight();
        const mousePos = this.experience.getCursorUtils().getCursorPosition();

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
            
                this.headRotationObject.lookAt(this.debugHeadTrackingSphere.position);
                this.headRotationEnabled = true;
            }

            if (headBoneIntersection) this.currentInteractionObject = headBoneIntersection;
            else this.currentInteractionObject = null;

            return;
        }

        this.headRotationEnabled = false;
    }
    // #endregion

    // #region Tick

    public tick() {
        const animationDeltaSpeed = this.experience.getTimeUtils().getDeltaTime() * this.animationSpeed;

        this.animationMixer.update(animationDeltaSpeed);
        this.cursorRaycast();

        // Smooth headbone rotation towards mouse position or back to default position
        if (this.headRotationEnabled) this.headBone.quaternion.slerp(this.headRotationObject.quaternion, animationDeltaSpeed * this.headRotationSpeed);
        else this.headBone.quaternion.slerp(this.defaultRotation, animationDeltaSpeed * this.headRotationSpeed);

        // Check if theme transition is queued
        if (this.themeTransitionQueued && !this.isCurrentlyPlayingAction) {
            this.startThemeTransition();
        }

        // Check for theme transition
        if (this.themeTransitionInProgress && this.fingerSnapAction.isRunning() && this.fingerSnapAction.time > 0.45) {
            // Fire off theme transition event
            this.experience.getThemeService().swapTheme();

            this.themeTransitionInProgress = false;
            this.themeTransitionQueued = false;
        }
    }

    // #endregion

    // #region Debugging

    private setDebugSettings(): void {
        const gui = this.experience.getDebugManager().getGUI();

        const characterFolder = gui.addFolder('Character');
        characterFolder.close();

        const positionFolder = characterFolder.addFolder('Positioning');

        positionFolder.add(this.sceneGroup.position, 'x', -2, 2, 0.01);
        positionFolder.add(this.sceneGroup.position, 'y', -2, 2, 0.01);
        
        // Animations
        const animationFolder = characterFolder.addFolder('Animation');

        for (const animation of this.animations) {
            this.debugObject[animation.name] = () => {
                const action = this.animationActions.get(animation.name);

                this.playAnimationAction(action);
            }
    
            animationFolder.add(this.debugObject, animation.name).name(`Play ${animation.name}`);
        }

        // Morph targets
        const morphFolder = characterFolder.addFolder('Morph Targets');

        for (const mt in this.morphTargetsDict) {
          const index = this.morphTargetsDict[mt];

          morphFolder.add(this.morphTargetInfluences, index, 0, 1, 0.05)
          .setValue(this.morphTargetInfluences[index])
          .name(mt)
          .listen()
          .onChange(() => this.setMorphTransform(index, this.morphTargetInfluences[index]));
        }

        // Show interaction objects
        this.interactionObjectMaterial.visible = true;
    }

    // #endregion
}
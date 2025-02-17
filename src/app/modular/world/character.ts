import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { Experience } from "../experience";
import { gsap } from 'gsap';
import * as THREE from 'three';
import { ThemeService } from "src/app/services/theme.service";
import PageComponent3D from "./page-component-3d";
import { ScrollService } from "src/app/services/scroll.service";
import ResourceLoadingService from "src/app/services/resource-loading.service";

export default class Character extends PageComponent3D {
    // Resources
    private sceneGroup!: THREE.Group;
    private textureMaterial!: THREE.MeshBasicMaterial;
    private outlineMaterial!: THREE.MeshBasicMaterial;
    private defaultTexture!: THREE.Texture;
    private invertedTexture!: THREE.Texture;
    private snapVFXTexture!: THREE.Texture;

    // Materials & colors
    private vfxMaterial!: THREE.SpriteMaterial;
    private defaultVFXColor = new THREE.Color(0xffffff);
    private invertedVFXColor = new THREE.Color(0x121212);

    // Scene objects
    private headBone!: THREE.Bone;
    private indexFingerBone!: THREE.Bone;
    private headRotationObject!: THREE.Object3D;
    private raycastPlane!: THREE.Mesh;
    private headTrackingPointObject!: THREE.Mesh;
    private snapVFXSprite!: THREE.Sprite;

    // Animation
    private animationMixer!: THREE.AnimationMixer;
    private animations!: THREE.AnimationClip[];
    private animationActions = new Map<string, THREE.AnimationAction>();
    private isCurrentlyPlayingAction = false;
    private isCurrentlyPlayingMTAction = false;
    private previousAction!: THREE.AnimationAction;
    private previousMTAction!: THREE.AnimationAction;
    private fingerSnapAction!: THREE.AnimationAction;
    private queuedAction: THREE.AnimationAction | null = null;
    private queuedMTAction: THREE.AnimationAction | null = null;
    private vfxTL = gsap.timeline();

    // Morph targets
    private morphTargetMeshes: THREE.Mesh[] = [];
    private morphTargetsDict!: { [key: string]: number };
    private morphTargetInfluences: number[] = [];

    // Positions and rotations
    private headWorldPosition = new THREE.Vector3();
    private mousePosition: THREE.Vector2 = new THREE.Vector2;
    private defaultRotation: THREE.Quaternion = new THREE.Quaternion;
    private raycastPlaneOffset = new THREE.Vector3(-.05, .35, .5);

    // Values
    private sceneScale = 1.3;
    private animationSpeed = .0011;
    private headRotationSpeed = 2;
    private headRotationEnabled = false;
    private raycastPlaneRadius = new THREE.Vector2(.75, .65);
    private blinkDelay = 5000;
    private themeTransitionQueued = false;
    private themeTransitionInProgress = false;
    private snapVFXParticleScale = .08;
    private snapVFXDuration = .25;
    private isDocumentVisible = true;
    private deltaTimeNormalizationRequired = false;

    // Debugging
    private debugObject: {[k: string]: any} = {};

    constructor(experience: Experience, page: number, leftMargin: number, topMargin: number, zPosition: number) {
        super(experience, page, leftMargin, topMargin, zPosition);

        // Initialization
        this.mapResources();
        this.addToScene();
        this.addRaycastPlane();
        this.addTrackingPoint();
        this.setThemeMaterials(ThemeService.getInstance().isDarkThemeEnabled());
        this.initializeSnapVFX();

        // Event listeners
        const themeService = ThemeService.getInstance();
        const scrollService = ScrollService.getInstance();
        themeService.themeChangeRequestEvent.subscribe(() => {
            if (page == scrollService.getSection()) this.themeTransitionQueued = true;
        });
        themeService.themeChangeEvent.subscribe(darkThemeEnabled => {
            this.setThemeMaterials(darkThemeEnabled);
        });
        scrollService.newSectionEvent.subscribe(newSection => {
            themeService.overrideThemeBehaviour(newSection == page);
        });

        document.addEventListener('visibilitychange', () => {
            const isVisible = document.visibilityState == 'visible' ? true : false;

            if (this.isDocumentVisible != isVisible) this.deltaTimeNormalizationRequired = true;

            this.isDocumentVisible = isVisible;
        });

        if (scrollService.getSection() == page) themeService.overrideThemeBehaviour(true);

        // Animations
        this.registerAnimationEvents();
        this.startSceneAnimations();
        this.startPeriodicAnimations();

        if (this.experience.getDebugManager().isDebugModeEnabled()) this.setDebugSettings();
    }

    // #region Initialization

    protected mapResources(): void {
        const characterResource = ResourceLoadingService.getInstance().gltfMap.get('character');
        const invertedTextureResource = ResourceLoadingService.getInstance().textureMap.get('characterTextureInverted');
        const snapVFXResource = ResourceLoadingService.getInstance().textureMap.get('snapVFX');

        if (characterResource == undefined ||
            characterResource.scene == undefined ||
            invertedTextureResource == undefined ||
            snapVFXResource == undefined) throw new Error('Could not load character resources');

        this.sceneGroup = characterResource.scene;

        this.animationMixer = new THREE.AnimationMixer(this.sceneGroup);
        this.animations = characterResource.animations;

        invertedTextureResource.colorSpace = THREE.SRGBColorSpace;
        this.invertedTexture = invertedTextureResource;

        snapVFXResource.colorSpace = THREE.SRGBColorSpace;
        this.snapVFXTexture = snapVFXResource;

        this.mapCharacterComponents();
        this.mapAnimations();
    }
    
    private mapCharacterComponents(): void {
        this.outlineMaterial = this.experience.getOutlineMaterial();
        
        this.sceneGroup.traverse(node => {
            if (node instanceof THREE.Object3D && node.name == 'Scene') {
                this.positionableObject = node;
            }
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
                    node.material = this.outlineMaterial;
                    node.material.toneMapped = false;
                }
            } else if (node instanceof THREE.Bone) {
                if (node.name == "DEF-spine006") {
                    this.headBone = node;

                    // Set head world position
                    node.getWorldPosition(this.headWorldPosition);
    
                    // Set default head rotation
                    this.defaultRotation = this.headBone.quaternion.clone();
    
                    // Add head rotation object
                    this.headRotationObject = new THREE.Mesh(
                        new THREE.SphereGeometry(.2, 6, 6),
                        this.experience.getDebugMaterialRed()
                    );

                    this.headRotationObject.name = 'Head_Rotation_Object'; // Add name for debugging purposes
    
                    this.headRotationObject.position.copy(this.headBone.position);
                    this.headBone.add(this.headRotationObject);
                } else if (node.name == "DEF-f_index03R") {
                    this.indexFingerBone = node;
                }
            }
        });
    }

    private initializeSnapVFX(): void {
        this.vfxMaterial = new THREE.SpriteMaterial({
            sizeAttenuation: true, depthWrite: false, map: this.snapVFXTexture, alphaMap: this.snapVFXTexture
        });

        this.snapVFXSprite = new THREE.Sprite(this.vfxMaterial);
        this.snapVFXSprite.visible = false;

        this.experience.getScene().add(this.snapVFXSprite);
    }

    protected override addToScene(): void {
        this.experience.getScene().add(this.sceneGroup);
        this.sceneGroup.scale.set(this.sceneScale, this.sceneScale, this.sceneScale);

        super.addToScene();
    }

    // #endregion

    // #region Lifecycle

    public tick() {
        let deltaTime = this.experience.getTimeUtils().getDeltaTime();

        if (this.deltaTimeNormalizationRequired) {
            deltaTime = .016; // Default to 60 fps for normalization
            this.deltaTimeNormalizationRequired = false;
        }

        const animationDeltaSpeed = deltaTime * this.animationSpeed;

        this.animationMixer.update(animationDeltaSpeed);
        this.handleHeadRotation(animationDeltaSpeed);
        this.cursorRaycast();

        // Handle queued actions
        this.handleAnimationQueue();
        this.handleThemeTransitionQueue();

    }

    private handleHeadRotation(animationDeltaSpeed: number): void {

        // Smooth headbone rotation towards mouse position or back to default position
        if (this.headRotationEnabled) this.headBone.quaternion.slerp(this.headRotationObject.quaternion, animationDeltaSpeed * this.headRotationSpeed);
        else this.headBone.quaternion.slerp(this.defaultRotation, animationDeltaSpeed * this.headRotationSpeed);
    }

    private handleAnimationQueue(): void {
        if (this.queuedAction && !this.isCurrentlyPlayingAction) {
            this.playAnimationAction(this.queuedAction);
            this.queuedAction = null;
        }
        if (this.queuedMTAction && !this.isCurrentlyPlayingMTAction) {
            this.playAnimationAction(this.queuedMTAction);
            this.queuedMTAction = null;
        }
    }

    private handleThemeTransitionQueue(): void {
        if (this.themeTransitionQueued && !this.isCurrentlyPlayingAction) {
            this.startThemeTransition();
        } else if (this.themeTransitionInProgress && this.fingerSnapAction.isRunning() && this.fingerSnapAction.time > 0.5) {
            // Fire off theme transition event
            ThemeService.getInstance().swapTheme();

            this.themeTransitionInProgress = false;
            this.themeTransitionQueued = false;

            // Instantiate vfx
            this.playSnapVFX(ThemeService.getInstance().isDarkThemeEnabled());
        }
    }

    private setThemeMaterials(darkThemeEnabled: boolean) {
        this.textureMaterial.map = darkThemeEnabled ? this.invertedTexture : this.defaultTexture;
    }

    // #endregion

    // #region Animation

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

    private startSceneAnimations(): void {
        const climbAction = this.getAnimationAction('Climb');
        const climbMTAction = this.getAnimationAction('Climb_SK');

        this.playAnimationAction(climbAction);
        this.playAnimationAction(climbMTAction);

        this.queuedAction = this.getAnimationAction('Wave');
        this.queuedMTAction = this.getAnimationAction('Wave_SK');
    }

    private registerAnimationEvents(): void {
        this.animationMixer.addEventListener('finished', finishedAnimation => {
            this.onAnimationFinish(finishedAnimation);
        });
    }

    private startPeriodicAnimations(): void {
        const blinkMTAction = this.getAnimationAction('Blink_SK');

        this.experience.getTimeUtils().registerTimedEvent(this.blinkDelay).subscribe(() => {
            if (!this.isCurrentlyPlayingMTAction) this.playAnimationAction(blinkMTAction);
        });

        // TODO play random idle animations
    }

    private getAnimationAction(actionName: string): THREE.AnimationAction {
        const action = this.animationActions.get(actionName);
        if (action == undefined) throw new Error(`Action ${actionName} could not be found`);

        return action;
    }

    private playAnimationAction(action: THREE.AnimationAction | undefined): void {
        if (!action) throw new Error('Animation action is undefined');
        
        const isMTAction = action.getClip().name.endsWith('_SK');

        if (isMTAction) {
            if (this.isCurrentlyPlayingMTAction) return;

            if (this.previousMTAction) this.previousMTAction.fadeOut(0);

            action.reset().play();

            this.isCurrentlyPlayingMTAction = true;
            this.previousMTAction = action;
        } else {
            if (this.isCurrentlyPlayingAction) return;

            if (this.previousAction) this.previousAction.fadeOut(0);

            action.reset().play();

            action.clampWhenFinished = true;

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
        }
        else {
            this.isCurrentlyPlayingAction = false;
        }
    }

    private startThemeTransition(): void {
        // Check if the theme switch animation is already running
        if (this.fingerSnapAction.isRunning()) return;

        this.themeTransitionInProgress = true;

        this.playAnimationAction(this.fingerSnapAction);
    }

    private playSnapVFX(darkThemeEnabled: boolean): void {
        let fingerPosition = new THREE.Vector3();
        this.indexFingerBone.getWorldPosition(fingerPosition);
        fingerPosition.x -= .25;
        fingerPosition.y += .025;

        if (!darkThemeEnabled) this.vfxMaterial.color = this.invertedVFXColor;
        else this.vfxMaterial.color = this.defaultVFXColor;

        this.snapVFXSprite.scale.set(this.snapVFXParticleScale, this.snapVFXParticleScale, this.snapVFXParticleScale);
        this.snapVFXSprite.position.copy(fingerPosition);

        this.vfxMaterial.opacity = 25;
        this.snapVFXSprite.visible = true;

        if (this.vfxTL['start']) {
            this.vfxTL.play('start');
        }
        
        else this.vfxTL
        .add('start')
        .to(this.snapVFXSprite.position, { duration: this.snapVFXDuration, x: fingerPosition.x -= .01 , y: fingerPosition.y += .01 , ease: 'power4.out'}, 'start')
        .to(this.vfxMaterial, { duration: this.snapVFXDuration, opacity: 0, ease: 'power4.out' }, 'start')
        .then(() => {
            this.snapVFXSprite.visible = false;
        });
    }

    // #endregion

    // #region Raycasting

    private addTrackingPoint(): void {
        this.headTrackingPointObject = new THREE.Mesh(
            new THREE.PlaneGeometry(.01, .01), 
            this.experience.getDebugMaterialCyan()
        );

        this.experience.getScene().add(this.headTrackingPointObject);
    }

    private addRaycastPlane(): void { // TODO turn raycast plane into separate Component3D object
        this.raycastPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(this.raycastPlaneRadius.x, this.raycastPlaneRadius.y),
            this.experience.getDebugMaterialRed()
        );

        this.raycastPlane.position.x = this.raycastPlaneOffset.x;
        this.raycastPlane.position.y = this.raycastPlaneOffset.y;
        this.raycastPlane.position.z = this.raycastPlaneOffset.z;

        this.positionableObject.add(this.raycastPlane);

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

            // Rotate head rotation object
            if (headTrackingPlaneIntersection) {
                const contactPoint = headTrackingPlaneIntersection.point;

                this.headTrackingPointObject.position.x = contactPoint.x;
                this.headTrackingPointObject.position.y = contactPoint.y;
                this.headTrackingPointObject.position.z = contactPoint.z;
            
                this.headRotationObject.lookAt(this.headTrackingPointObject.position);
                this.headRotationEnabled = true;
            }

            // Check for interactable objects being intersected
            // const headBoneIntersection = intersects.find(
            //     intersect => intersect.object == this.headRotationObject
            // );

            // if (headBoneIntersection) this.currentInteractionObject = headBoneIntersection;
            // else this.currentInteractionObject = null;

            return;
        }

        this.headRotationEnabled = false;
    }
    // #endregion

    // #region Debugging

    private setDebugSettings(): void {
        const gui = this.experience.getDebugManager().getGUI();

        const characterFolder = gui.addFolder('Character');
        characterFolder.close();

        const positionFolder = characterFolder.addFolder('Positioning');

        positionFolder.add(this.positionableObject.position, 'x', -2, 2, 0.01);
        positionFolder.add(this.positionableObject.position, 'y', -2, 2, 0.01);
        
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
    }

    // #endregion
}
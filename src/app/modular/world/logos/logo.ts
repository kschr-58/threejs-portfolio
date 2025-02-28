import { Mesh, ShaderMaterial, Raycaster, Texture, Vector3, BoxGeometry, MeshBasicMaterial, Color } from "three";
import { Experience } from "../../experience";
import PageComponent3D from "../abstract-classes/page-component-3d";
import gsap from 'gsap';
import RaycastObject from "src/models/raycast-object";
import vertexShader from "../../shaders/logos/vertex.glsl";
import fragmentShader from "../../shaders/logos/fragment.glsl";
import ResourceLoadingService from "src/app/services/resource-loading.service";
import SizesService from "src/app/services/sizes.service";
import ScrollService from "src/app/services/scroll.service";

export default class Logo extends PageComponent3D {
    // Resources
    private texture!: Texture;
    private material!: ShaderMaterial;

    // Scene objects
    private logoMesh!: Mesh;

    // Values
    private name: string;
    private logoZOffset = 0.5;
    private meshBaseScale = 0.085;
    private meshMaxScale = 0.09;
    private meshMinScale = 0.03;
    private currentMeshScale = 1;
    private transitionYOffset = 0.2;
    private transitionDuration = 0.5;
    private logoSpinDuration = 1.5;
    private textYOffset = -0.03;
    private currentlyHovered = false;
    private idleYRotationAmount = 0.35;
    private idleZRotationAmount = 0.05;
    private idleRotationDuration = 2;

    private transitionAnimationTL: gsap.core.Timeline;
    private idleAnimationTL: gsap.core.Timeline;

    constructor(
        experience: Experience,
        mesh: Mesh,
        logoMesh: Mesh, 
        page: number,
        leftMargin: number,
        topMargin: number,
        zPosition: number,) {

        super(experience, page, leftMargin, topMargin, zPosition);

        this.transitionAnimationTL = gsap.timeline({paused: true});
        this.idleAnimationTL = gsap.timeline();

        this.name = logoMesh.name.split('_')[0];

        this.mesh = mesh.clone();
        this.positionableObject = this.mesh;
        this.logoMesh = logoMesh;

        this.mapResources();
        this.addToScene();
        this.registerRaycastObject();
        this.registerAnimations();

        this.resize();

        // Subscribe to events
        SizesService.getInstance().resizeEvent.subscribe(() => {
            this.resize();
        });

        ScrollService.getInstance().scrollEvent.subscribe(() => {
            if (this.currentlyHovered) this.showTextElement();
        })
    }

    protected mapResources(): void {
        const textureResource = ResourceLoadingService.getInstance().textureMap.get('logosTexture');

        if (textureResource == undefined) throw new Error('Cannot load logos resources');

        this.texture = textureResource;
        
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

        this.logoMesh.material = this.material;
        this.logoMesh.position.set(0, 0, this.logoZOffset);
        this.mesh.add(this.logoMesh);
    }

    public getMesh(): Mesh {
        return this.mesh;
    }
    
    protected override addToScene(): void {
        this.experience.getScene().add(this.mesh);

        super.addToScene();
    }

    protected override positionComponent(): void {
        super.positionComponent();
    }

    private registerRaycastObject(): void {
        const onInitialHoverFunction = () => this.onInitialHover();
        const onExitFunction = () => this.onCursorExit();
        const raycastObject = new RaycastObject(this.mesh, undefined, onExitFunction, undefined, onInitialHoverFunction);

        this.experience.getRaycastUtils().addRaycastObject(raycastObject);
    }

    private registerAnimations(): void {
        // Idle rotation tweens
        const initialRotationTween = gsap.to(this.logoMesh.rotation, {
            y: -this.idleYRotationAmount,
            z: -this.idleZRotationAmount,
            duration: this.idleRotationDuration / 2,
            ease: 'power1.out'
        });

        const loopingRotationTween = gsap.to(this.logoMesh.rotation, {
            y: this.idleYRotationAmount,
            z: this.idleZRotationAmount,
            duration: this.idleRotationDuration,
            ease: 'power1.inOut',
            yoyo: true,
            repeat: -1
        });

        // On hover tweens
        const onHoverPositionTween = gsap.to(this.logoMesh.position, {
            y: this.transitionYOffset,
            duration: this.transitionDuration,
            ease: 'power2.out'
        });

        const onHoverRotationTween = gsap.to(this.logoMesh.rotation, {
            y: Math.PI * 2, // Rotate two full circles
            duration: this.logoSpinDuration,
        });

        // Add tweens to timelines
        this.idleAnimationTL.add(initialRotationTween).add(loopingRotationTween);
        this.transitionAnimationTL.addLabel('onHover')
        .add(onHoverPositionTween, 'onHover')
        .add(onHoverRotationTween, 'onHover');
    }

    private onInitialHover(): void {
        this.currentlyHovered = true;

        this.textureFill();
        this.showTextElement();

        // Pause idle animation timeline
        this.idleAnimationTL.pause();
        this.transitionAnimationTL.play();
    }

    private onCursorExit(): void {
        this.currentlyHovered = false;

        this.undoTextureFill();
        this.hideTextElement();

        this.transitionAnimationTL.reverse().then(() => {
            this.idleAnimationTL.restart();
        });
    }

    private textureFill(): void {
        gsap.to(this.material.uniforms['uTextureCoverage'], { value: 100.0, duration: this.transitionDuration, ease: 'power1.out'});

    }

    private undoTextureFill(): void {
        gsap.to(this.material.uniforms['uTextureCoverage'], { value: 0.0, duration: this.transitionDuration, ease: 'power1.out'});
    }

    private showTextElement(): void {
        const logoNameElement = document.getElementById('logo-name');
        if (logoNameElement == undefined) throw new Error('Cannot locate logo name element in document');
        
        const screenPosition = this.mesh.position.clone();
        screenPosition.y += this.textYOffset;

        screenPosition.project(this.experience.getCameraManager().getCamera());

        const translateX = screenPosition.x * SizesService.getInstance().getWidth() / 2;
        const translateY = -screenPosition.y * SizesService.getInstance().getHeight() / 2 - this.textYOffset * this.currentMeshScale;
        
        logoNameElement.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
        logoNameElement.innerHTML = this.name;
        logoNameElement.style.visibility = 'visible';
    }

    private hideTextElement(): void {
        const logoNameElement = document.getElementById('logo-name');
        if (logoNameElement == undefined) throw new Error('Cannot locate logo name element in document');

        logoNameElement.style.visibility = 'hidden';
    }

    private resize(): void {
        // Resize scale based on new screen width
        const sizeUtils = SizesService.getInstance();
        const defaultWidth = 1920; // Default full HD resolution used for scaling

        let newScale = (sizeUtils.getWidth() / defaultWidth) * this.meshBaseScale;
        newScale = Math.min(newScale, this.meshMaxScale);
        newScale = Math.max(newScale, this.meshMinScale);

        this.currentMeshScale = newScale;

        this.mesh.scale.set(newScale, newScale, newScale);
    }
}
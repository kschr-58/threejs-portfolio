import { Mesh, ShaderMaterial, Raycaster, Texture, Vector3, BoxGeometry, MeshBasicMaterial, Color, Material } from "three";
import PageComponent3D from "../abstract-classes/page-component-3d";
import gsap from 'gsap';
import RaycastObject from "src/models/raycast-object";
import vertexShader from "../../shaders/logos/vertex.glsl";
import fragmentShader from "../../shaders/logos/fragment.glsl";
import ResourceLoadingService from "src/app/services/resource-loading.service";
import SizesService from "src/app/services/sizes.service";
import { ThreeJSComponent } from "../../threejs.component";

export default class Logo extends PageComponent3D {
    // Resources
    private material!: Material;
    private textMaterial!: Material;
    private texture!: Texture;
    private logoMaterial!: ShaderMaterial;

    // Scene objects
    private logoMesh!: Mesh;
    private textMesh!: Mesh;

    // Values
    private name: string;
    private logoZOffset = 0.5;
    private meshBaseScale = 0.085;
    private meshMaxScale = 0.09;
    private meshMinScale = 0.03;
    private transitionYOffset = 0.2;
    private transitionDuration = 0.5;
    private logoSpinDuration = 1.5;
    private idleYRotationAmount = 0.35;
    private idleZRotationAmount = 0.05;
    private idleRotationDuration = 2;

    private movementTransitionTL: gsap.core.Timeline;
    private textureTransitionTL: gsap.core.Timeline;
    private idleAnimationTL: gsap.core.Timeline;

    constructor(
        threeComponent: ThreeJSComponent,
        mesh: Mesh,
        page: number,
        leftMargin: number,
        topMargin: number,
        zPosition: number,) {

        super(threeComponent, page, leftMargin, topMargin, zPosition);

        this.movementTransitionTL = gsap.timeline({paused: true});
        this.textureTransitionTL = gsap.timeline({paused: true});
        this.idleAnimationTL = gsap.timeline();

        this.name = mesh.name;

        this.mesh = mesh;

        this.mapResources();
        this.addToScene();
        this.registerRaycastObject();
        this.registerAnimations();

        this.resize();

        // Subscribe to events
        SizesService.getInstance().resizeEvent.subscribe(() => {
            this.resize();
        });
    }

    protected mapResources(): void {
        this.positionableObject = this.mesh;

        const logo = this.mesh.getObjectByName(`${this.name}_Logo`);
        const text = this.mesh.getObjectByName(`${this.name}_Text`);
        if (logo == undefined || !(logo instanceof Mesh)) throw new Error(`Cannot locate logo mesh for logo ${this.name}`);
        if (text == undefined || !(text instanceof Mesh)) throw new Error(`Cannot locate text mesh for logo ${this.name}`);

        this.logoMesh = logo;
        this.textMesh = text;

        const textureResource = ResourceLoadingService.getInstance().textureMap.get('logosTexture');

        if (textureResource == undefined) throw new Error('Cannot load logos resources');

        this.texture = textureResource;

        // Background mesh material
        this.material = new MeshBasicMaterial({ // TODO create once and pass to all logo instances
            toneMapped: false,
            map: this.texture,
            transparent: true,
            opacity: 0.1
        });

        this.mesh.material = this.material;

        // Background mesh material
        this.textMaterial = new MeshBasicMaterial({ // TODO create once and pass to all logo instances
            toneMapped: false,
            map: this.texture,
            transparent: true,
            opacity: 0
        });

        this.textMesh.material = this.textMaterial;

        // Logo material
        this.logoMaterial = new ShaderMaterial({
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

        this.logoMesh.material = this.logoMaterial;
        this.logoMesh.position.set(0, 0, this.logoZOffset);;
    }

    public getMesh(): Mesh {
        return this.mesh;
    }
    
    protected override addToScene(): void {
        this.threeComponent.getScene().add(this.mesh);

        super.addToScene();
    }

    protected override positionComponent(): void {
        super.positionComponent();
    }

    private registerRaycastObject(): void {
        const onInitialHoverFunction = () => this.onInitialHover();
        const onExitFunction = () => this.onCursorExit();
        const raycastObject = new RaycastObject(this.mesh, undefined, onExitFunction, undefined, onInitialHoverFunction);

        this.threeComponent.getRaycastUtils().addRaycastObject(raycastObject);
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

        // Texture transition tweens
        const textureFillTween = gsap.to(this.logoMaterial.uniforms['uTextureCoverage'], {
            value: 100.0, 
            duration: this.transitionDuration, 
            ease: 'power1.out'
        });

        const onHoverBackgroundOpacityTween = gsap.to(this.material, {
            opacity: 0.85,
            duration: this.transitionDuration,
            ease: 'power2.out'
        });

        const onHoverTextOpacityTween = gsap.to(this.textMaterial, {
            opacity: 1,
            duration: this.transitionDuration,
            ease: 'power2.out'
        });

        // Add tweens to timelines
        this.idleAnimationTL
        .add(initialRotationTween)
        .add(loopingRotationTween);
        
        this.movementTransitionTL
        .add(onHoverPositionTween, 0)
        .add(onHoverRotationTween, 0);

        this.textureTransitionTL
        .add(textureFillTween, 0)
        .add(onHoverBackgroundOpacityTween, 0)
        .add(onHoverTextOpacityTween, 0);
    }

    private onInitialHover(): void {
        this.textureFill();

        // Pause idle animation timeline before playing transition timeline
        this.idleAnimationTL.pause();

        this.movementTransitionTL.timeScale(1);
        this.movementTransitionTL.play();
    }

    private onCursorExit(): void {
        this.undoTextureFill();
        this.hideTextElement();

        this.movementTransitionTL.timeScale(1.25);
        this.movementTransitionTL.reverse()
        .then(() => {
            const progress = this.movementTransitionTL.progress();
            if (progress == 0) this.idleAnimationTL.restart();
        });
    }

    private textureFill(): void {
        // gsap.to(this.logoMaterial.uniforms['uTextureCoverage'], { value: 100.0, duration: this.transitionDuration, ease: 'power1.out'});
        this.textureTransitionTL.play();
    }

    private undoTextureFill(): void {
        // gsap.to(this.logoMaterial.uniforms['uTextureCoverage'], { value: 0.0, duration: this.transitionDuration, ease: 'power1.out'});
        this.textureTransitionTL.reverse();
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

        this.mesh.scale.set(newScale, newScale, newScale);
    }
}
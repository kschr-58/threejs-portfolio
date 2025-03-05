import { CineonToneMapping, LinearSRGBColorSpace, PCFShadowMap, WebGLRenderer } from "three";
import SizesService from "../../services/sizes.service";
import { ThreeJSComponent } from "../threejs.component";

export class RendererManager {
    private threeComponent: ThreeJSComponent;

    // ThreeJS objects
    private renderer!: WebGLRenderer;

    constructor(experience: ThreeJSComponent) {
        this.threeComponent = experience;

        this.initializeRendrerer();
    }

    public resize(): void {
        const sizes = SizesService.getInstance();

        this.renderer.setSize(sizes.getWidth(), sizes.getHeight());
        this.renderer.setPixelRatio(sizes.getPixelRatio());
    }

    public tick(): void {
        const scene = this.threeComponent.getScene();
        const camera = this.threeComponent.getCameraManager().getCamera();

        this.renderer.render(scene, camera);
    }

    public getRenderer(): WebGLRenderer {
        return this.renderer;
    }

    private initializeRendrerer(): void {
        const canvas = this.threeComponent.getCanvas();
        const sizes = SizesService.getInstance();

        this.renderer = new WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });

        this.renderer.toneMapping = CineonToneMapping;
        this.renderer.toneMappingExposure = 1.75;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFShadowMap;
        this.renderer.setSize(sizes.getWidth(), sizes.getHeight());
        this.renderer.setPixelRatio(sizes.getPixelRatio());
    }
}
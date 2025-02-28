import { CineonToneMapping, LinearSRGBColorSpace, PCFShadowMap, WebGLRenderer } from "three";
import { Experience } from "../experience";
import SizesService from "../../services/sizes.service";

export class RendererManager {
    private experience: Experience;

    // ThreeJS objects
    private renderer!: WebGLRenderer;

    constructor(experience: Experience) {
        this.experience = experience;

        this.initializeRendrerer();
    }

    public resize(): void {
        const sizes = SizesService.getInstance();

        this.renderer.setSize(sizes.getWidth(), sizes.getHeight());
        this.renderer.setPixelRatio(sizes.getPixelRatio());
    }

    public tick(): void {
        const scene = this.experience.getScene();
        const camera = this.experience.getCameraManager().getCamera();

        this.renderer.render(scene, camera);
    }

    public getRenderer(): WebGLRenderer {
        return this.renderer;
    }

    private initializeRendrerer(): void {
        const canvas = this.experience.getCanvas();
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
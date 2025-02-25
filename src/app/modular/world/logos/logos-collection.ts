import { Group, Mesh, ShaderMaterial, Texture, Vector3 } from "three";
import { Experience } from "../../experience";
import Logo from "./logo";
import { ScrollService } from "src/app/services/scroll.service";
import LogosForegroundPlane from "./logos-foreground-plane";
import ResourceLoadingService from "src/app/services/resource-loading.service";
import gsap from 'gsap';
import vertexShader from "../../shaders/logos/vertex.glsl";
import fragmentShader from "../../shaders/logos/fragment.glsl";
import { SizesService } from "src/app/services/sizes.service";

export default class LogosCollection {
    private logos = new Map<string, Logo>();

    // ThreeJS components
    private experience: Experience;
    private sceneGroup!: Group;
    private material!: ShaderMaterial;
    private logosTexture!: Texture;
    private foregroundPlane!: LogosForegroundPlane;
    private logoMeshes: Mesh[] = [];

    // Collection positioning
    private collectionPage: number;
    private collectionLeftMargin: number;
    private collectionTopMargin: number;
    private collectionZPosition: number;

    // Logo positioning
    private logoBaseAnimationDuration = 1.5;
    private logosPerRow: number;
    private logoHorizontalMargin: number; // Value represents a screen percentage
    private logoVerticalMargin: number;

    // Values
    private hasAnimationPlayed = false;
    private logoMaxScale = .1;
    private logoMinScale = .05;

    // Debugging
    private debugObject: {[k: string]: any} = {};

    constructor(
        experience: Experience, 
        page: number, 
        collectionLeftMargin: number, 
        collectionTopMargin: number, 
        collectionZPosition: number,
        logosPerRow: number,
        logoHorizontalMargin: number,
        logoVerticalMargin: number
    ) {
        this.experience = experience;
        this.collectionPage = page;
        this.collectionLeftMargin = collectionLeftMargin;
        this.collectionTopMargin = collectionTopMargin;
        this.collectionZPosition = collectionZPosition;
        this.logosPerRow = logosPerRow;
        this.logoHorizontalMargin = logoHorizontalMargin;
        this.logoVerticalMargin = logoVerticalMargin;

        this.mapResources();
        this.instantiateForegroundPlane();
        this.instantiateMeshes();

        // Subscribe to section event to play animation
        ScrollService.getInstance().newSectionEvent.subscribe(newSection => {
            if (newSection == page && !this.hasAnimationPlayed) {
                this.hasAnimationPlayed = true;
                this.enterAnimation();
            }
        });

        // Subscribe to resize event to scale logo spacing
        SizesService.getInstance().resizeEvent.subscribe(() => {
            this.resize();
        });
    }

    public tick(): void {
        const logoComponents = this.logos.values();

        for (const logo of logoComponents) {
            logo.tick();
        }
    }

    private mapResources(): void {
        const gltf = ResourceLoadingService.getInstance().gltfMap.get('logos');
        const textureResource = ResourceLoadingService.getInstance().textureMap.get('logosTexture');

        if (gltf == undefined || textureResource == undefined) throw new Error('Cannot load logos resources');

        this.logosTexture = textureResource;

        this.material = new ShaderMaterial({
            toneMapped: false,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                uMeshSize: { value: 1.1 },
                uTextureCoverage: { value: 0.0 },
                uRingSize: { value: 0.05 },
                uRingColor: { value: new Vector3(0.5, 0.0, 1.0) },
                uTexture: { value: this.logosTexture },
            }
        });

        this.sceneGroup = gltf.scene;
        this.sceneGroup.traverse(node => {
            if (node instanceof Mesh) {
                const mat = new ShaderMaterial({
                    toneMapped: false,
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                    uniforms: {
                        uMeshSize: { value: 1.1 },
                        uTextureCoverage: { value: 0.0 },
                        uRingSize: { value: 0.05 },
                        uRingColor: { value: new Vector3(0.5, 0.0, 1.0) },
                        uTexture: { value: this.logosTexture },
                    }
                });

                node.material = mat;
                this.logoMeshes.push(node);
                this.material.visible = false;
            }
        });
    }

    private instantiateForegroundPlane(): void {
        this.foregroundPlane = new LogosForegroundPlane(this.experience, 1, 50, 9, this.collectionZPosition + .3);
    }

    private instantiateMeshes(): void {
        let columnIndex = 0;
        let row = 0;

        const yMargin = this.collectionTopMargin + (this.logoVerticalMargin * row);

        for (const logoMesh of this.logoMeshes) {
            if (columnIndex % this.logosPerRow == 0 && columnIndex > 0) {
                columnIndex = 0;
                row++;
            }

            const xMargin = this.collectionLeftMargin + (this.logoHorizontalMargin * columnIndex);

            const newLogo = new Logo(this.experience, logoMesh, this.collectionPage, xMargin, yMargin, this.collectionZPosition);

            this.logos.set(logoMesh.name, newLogo);

            columnIndex++;
        }

        this.resize();
        
    }

    private enterAnimation(): void {
        const logoComponents = this.logos.values();

        this.material.visible = true;

        let index = 0;
        for (const logo of logoComponents) {
            const mesh = logo.getMesh();

            const startingYPos = this.collectionPage * -1 + .45;

            gsap.from(mesh.position, {y: startingYPos, duration: this.logoBaseAnimationDuration + index * .1, ease: 'circ.inOut', delay: index * .2});
            index++;
        }
    }

    private resize(): void {
        // Resize scale based on new screen width
        const sizeUtils = SizesService.getInstance();
        const defaultWidth = 1920; // Default full HD resolution used for scaling

        let newScale = (sizeUtils.getWidth() / defaultWidth) * this.logoMaxScale;
        // newScale = Math.min(newScale, this.logoMaxScale);
        newScale = Math.max(newScale, this.logoMinScale);

        for (const logoMesh of this.logoMeshes) {
            logoMesh.scale.set(newScale, newScale, newScale);
        }
    }
}
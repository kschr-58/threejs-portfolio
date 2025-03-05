import * as THREE from "three";
import PageComponent3D from "./abstract-classes/page-component-3d";
import SizesService from "src/app/services/sizes.service";
import IShaderComponent from "./interfaces/shader-component";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import vertexShader from "../shaders/theme-transition/vertex.glsl";
import fragmentShader from "../shaders/theme-transition/fragment.glsl";
import { ThemeService } from "src/app/services/theme.service";
import gsap from 'gsap';
import { ThreeJSComponent } from "../threejs.component";

export default class PagePlane extends PageComponent3D implements IShaderComponent {
    private geometry!: THREE.PlaneGeometry;
    private shaderMaterial!: CustomShaderMaterial;

    private lightColor!: THREE.Color;
    private darkColor!: THREE.Color;

    // Values
    private planeDimensions: THREE.Vector2;
    private textureFillDuration: number = 1;

    constructor(
        threeComponent: ThreeJSComponent,
        page: number,
        leftMargin: number,
        topMargin: number,
        zPosition: number,
        planeDimensions: THREE.Vector2,
        lightColor: THREE.Color,
        darkColor: THREE.Color) {
            
        super(threeComponent, page, leftMargin, topMargin, zPosition);

        this.planeDimensions = planeDimensions;
        this.lightColor = lightColor;
        this.darkColor = darkColor;

        this.mapResources();
        this.addToScene();
        this.resize();
        this.setTheme(ThemeService.getInstance().isDarkThemeEnabled());

        // Subscribe to events
        SizesService.getInstance().resizeEvent.subscribe(() => {
            this.resize();
        });

        ThemeService.getInstance().themeChangeEvent.subscribe(darkThemeEnabled => {
            this.swapTheme(darkThemeEnabled);
        });
    }

    public assignShaderMaterial(): void {
        this.shaderMaterial = new CustomShaderMaterial({
            baseMaterial: THREE.MeshBasicMaterial,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            toneMapped: false,
            uniforms: {
                uMeshSize: { value: this.planeDimensions.x * 1.1 },
                uTextureCoverage: { value: 0.0 },
                uRingSize: { value: 0.01 },
                uRingColor: { value: new THREE.Vector3(0.5, 0.0, 1.0) },
                uLightColor: { value: new THREE.Vector3(this.lightColor.r, this.lightColor.g, this.lightColor.b) },
                uDarkColor: { value: new THREE.Vector3(this.darkColor.r, this.darkColor.g, this.darkColor.b) },
                uTransitionPoint: { value: new THREE.Vector3(this.planeDimensions.x * 0.25, this.planeDimensions.y * -0.25, 0.0) },
                uToDarkTheme: { value: false },
                uUsingTextures: { value: false }
            }
        });
    }

    public setTheme(darkThemeEnabled: boolean): void {
        this.shaderMaterial.uniforms['uToDarkTheme'].value = darkThemeEnabled;
    }

    public swapTheme(darkThemeEnabled: boolean): void {
        darkThemeEnabled ? this.toLightThemeTransition() : this.toDarkThemeTransition();
    }

    public toDarkThemeTransition(): void {
        this.shaderMaterial.uniforms['uToDarkTheme'].value = true;
        gsap.fromTo(this.shaderMaterial.uniforms['uTextureCoverage'], {value: 0.0}, { value: 100.0, duration: this.textureFillDuration, ease: 'power4.out'});
    }

    public toLightThemeTransition(): void {
        this.shaderMaterial.uniforms['uToDarkTheme'].value = false;
        gsap.fromTo(this.shaderMaterial.uniforms['uTextureCoverage'], {value: 0.0}, { value: 100.0, duration: this.textureFillDuration, ease: 'power4.out'});
    }

    protected mapResources(): void {
        this.assignShaderMaterial();
        this.geometry = new THREE.PlaneGeometry(this.planeDimensions.x, this.planeDimensions.y);
        this.mesh = new THREE.Mesh(this.geometry, this.shaderMaterial);
        this.mesh.name = 'Foreground_Plane';

        this.positionableObject = this.mesh;
    }

    protected override addToScene(): void {
        this.threeComponent.getScene().add(this.mesh);

        super.addToScene();
    }

    private resize(): void {
        const aspect = SizesService.getInstance().getAspect();

        this.mesh.scale.x = aspect;
    }
}
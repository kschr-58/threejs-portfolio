import * as THREE from "three";
import { Experience } from "../experience";
import ResourceLoadingService from "src/app/services/resource-loading.service";
import PageComponent3D from "./abstract-classes/page-component-3d";
import DebugService from "src/app/services/debug.service";
import IShaderComponent from "./interfaces/shader-component";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import vertexShader from "../shaders/theme-transition/vertex.glsl";
import fragmentShader from "../shaders/theme-transition/fragment.glsl";
import { ThemeService } from "src/app/services/theme.service";
import gsap from 'gsap';

export default class StudyMono extends PageComponent3D implements IShaderComponent {
    // Resources
    private shaderMaterial!: CustomShaderMaterial;
    private outlineMaterial!: CustomShaderMaterial;
    private lightColor!: THREE.Color;
    private darkColor!: THREE.Color;

    // Scene objects
    private sceneGroup!: THREE.Group;
    private outlineMesh!: THREE.Mesh;

    // Rotations
    private defaultRotation = new THREE.Vector3(.5, -.75, 0);

    // Values
    private sceneScale = .17;
    private rotationAmount = .05;
    private textureFillDuration = 1;

    constructor(experience: Experience, page: number, leftMargin: number, topMargin: number, zPosition: number) {
        super(experience, page, leftMargin, topMargin, zPosition);

        this.mapResources();
        this.mapSceneComponents();
        this.assignShaderMaterial();
        this.addToScene();

        this.setTheme(ThemeService.getInstance().isDarkThemeEnabled());

        // Subscribe to events
        ThemeService.getInstance().themeChangeEvent.subscribe(darkThemeEnabled => {
            this.swapTheme(darkThemeEnabled);
        });

        if (DebugService.getInstance().isDebugModeEnabled()) this.setDebugOptions();
    }

    public tick(): void {
        const elapsedTime = this.experience.getTimeUtils().getElapsedTime();
        const rotationOffset = Math.sin(elapsedTime) * this.rotationAmount;

        this.positionableObject.rotation.y = this.defaultRotation.y + rotationOffset; // TODO rotate based on horizontal mouse movement
    }

    public assignShaderMaterial(): void {
        const boundingBox = this.mesh.geometry.boundingBox;
        if (!boundingBox) return;

        const meshLength = boundingBox.max.y - boundingBox.min.y;

        const lightOutlineColor = this.experience.getSharedMaterialsUtils().getOutlineColorLight();
        const darkOutlineColor = this.experience.getSharedMaterialsUtils().getOutlineColorDark();

        this.shaderMaterial = new CustomShaderMaterial({
            baseMaterial: THREE.MeshBasicMaterial,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            toneMapped: false,
            uniforms: {
                uMeshSize: { value: meshLength * 1.1 },
                uTextureCoverage: { value: 0.0 },
                uRingSize: { value: 0.05 },
                uRingColor: { value: new THREE.Vector3(0.5, 0.0, 1.0) },
                uLightColor: { value: new THREE.Vector3(this.lightColor.r, this.lightColor.g, this.lightColor.b) },
                uDarkColor: { value: new THREE.Vector3(this.darkColor.r, this.darkColor.g, this.darkColor.b) },
                uTransitionPoint: { value: new THREE.Vector3(0.0, 0.0, -0.5) },
                uToDarkTheme: { value: false },
                uUsingTextures: { value: false }
            }
        });

        this.outlineMaterial = new CustomShaderMaterial({ // TODO have factory method to create this shader material?
            baseMaterial: THREE.MeshBasicMaterial,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            toneMapped: false,
            uniforms: {
                uMeshSize: { value: meshLength * 1.1 },
                uTextureCoverage: { value: 0.0 },
                uRingSize: { value: 0.05 },
                uRingColor: { value: new THREE.Vector3(0.5, 0.0, 1.0) },
                uLightColor: { value: new THREE.Vector3(lightOutlineColor.r, lightOutlineColor.g, lightOutlineColor.b) },
                uDarkColor: { value: new THREE.Vector3(darkOutlineColor.r, darkOutlineColor.g, darkOutlineColor.b) },
                uTransitionPoint: { value: new THREE.Vector3(0.0, 0.0, -0.5) },
                uToDarkTheme: { value: false },
                uUsingTextures: { value: false }
            }
        });

        this.mesh.material = this.shaderMaterial;
        this.outlineMesh.material = this.outlineMaterial;
    }

    protected override mapResources(): void {
        const resource = ResourceLoadingService.getInstance().gltfMap.get('study-mono');
        if (resource == undefined || resource.scene == undefined) throw new Error('study-mono resource cannot be loaded');
        
        this.sceneGroup = resource.scene;

        this.lightColor = this.experience.getSharedMaterialsUtils().getPrimaryColorLight();
        this.darkColor = this.experience.getSharedMaterialsUtils().getPrimaryColorDark();
    }

    private mapSceneComponents(): void {
        const outlineMat = this.experience.getSharedMaterialsUtils().getOutlineMaterial();

        this.sceneGroup.traverse(node => {
            if (node instanceof THREE.Object3D && node.name == 'Scene') {
                this.positionableObject = node;
            }
            if (node instanceof THREE.Mesh) {
                if (node.material.name == 'Mono_White') {
                    this.mesh = node;
                }
                else if (node.material.name == 'Outline_Black') {
                    this.outlineMesh = node;
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

    // #region Shader
    public toLightThemeTransition(): void {
        this.shaderMaterial.uniforms['uToDarkTheme'].value = false;
        this.outlineMaterial.uniforms['uToDarkTheme'].value = false;
        gsap.fromTo(this.shaderMaterial.uniforms['uTextureCoverage'], {value: 0.0}, { value: 100.0, duration: this.textureFillDuration, ease: 'power2.out'});
        gsap.fromTo(this.outlineMaterial.uniforms['uTextureCoverage'], {value: 0.0}, { value: 100.0, duration: this.textureFillDuration, ease: 'power2.out'});
    }

    public toDarkThemeTransition(): void {
        this.shaderMaterial.uniforms['uToDarkTheme'].value = true;
        this.outlineMaterial.uniforms['uToDarkTheme'].value = true;
        gsap.fromTo(this.shaderMaterial.uniforms['uTextureCoverage'], {value: 0.0}, { value: 100.0, duration: this.textureFillDuration, ease: 'power2.out'});
        gsap.fromTo(this.outlineMaterial.uniforms['uTextureCoverage'], {value: 0.0}, { value: 100.0, duration: this.textureFillDuration, ease: 'power2.out'});
    }

    public setTheme(darkThemeEnabled: boolean): void {
        this.shaderMaterial.uniforms['uToDarkTheme'].value = darkThemeEnabled;
        this.outlineMaterial.uniforms['uToDarkTheme'].value = darkThemeEnabled;
    }

    public swapTheme(darkThemeEnabled: boolean): void {
        darkThemeEnabled ? this.toLightThemeTransition() : this.toDarkThemeTransition();
    }
    // #endregion

    // #region Debugging

    private setDebugOptions(): void {
        const gui = DebugService.getInstance().getGUI();

        const folder = gui.addFolder('StudyScene');
        folder.add(this.positionableObject.rotation, 'x', -2, 2);
        folder.add(this.positionableObject.rotation, 'y', -2, 2);
        folder.add(this.positionableObject.rotation, 'z', -2, 2);
    }
    // #endregion
}
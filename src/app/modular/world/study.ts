import * as THREE from "three";
import { Experience } from "../experience";

// Shader imports
import vertexShader from "../shaders/coffeeSmoke/vertex.glsl";
import fragmentShader from "../shaders/coffeeSmoke/fragment.glsl";
import ResourceLoadingService from "src/app/services/resource-loading.service";

export default class Study {
    private experience: Experience;
    private sceneGroup: THREE.Group;
    private perlinTexture!: THREE.Texture;
    private smokeMaterial!: THREE.ShaderMaterial;
    private smokeMesh!: THREE.Mesh;
    
    // Scene components
    private groundPlaneMesh!: THREE.Mesh;
    private coffeePosition = new THREE.Vector3();

    constructor(experience: Experience) {
        this.experience = experience;

        const resource = ResourceLoadingService.getInstance().gltfMap.get('study');
        if (resource == undefined || resource.scene == undefined) throw new Error('Study resource cannot be loaded');

        const perlin = ResourceLoadingService.getInstance().textureMap.get('perlin');
        if (perlin == undefined) throw new Error('Perlin texture cannot be loaded');
        
        this.sceneGroup = resource.scene;
        this.perlinTexture = perlin;
        this.perlinTexture.wrapS = this.perlinTexture.wrapT = THREE.RepeatWrapping;

        this.mapComponents();
        this.addToScene();
        this.setSmokePlane();
    }

    public tick(): void {
        const elapsedTime = this.experience.getTimeUtils().getElapsedTime();

        this.smokeMaterial.uniforms['uTime'].value = elapsedTime;
    }

    private addToScene(): void {
        this.experience.getScene().add(this.sceneGroup);
    }

    private mapComponents(): void {
        this.sceneGroup.traverse(node => {
            if (node instanceof THREE.Mesh) {
                if (node.name == 'Cappuccino') {
                    node.getWorldPosition(this.coffeePosition);
                    return;
                }
                if (node.name == 'Ground_Plane') {
                    this.groundPlaneMesh = node;
                }
            }
        })
    }

    private setSmokePlane(): void {
        const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64);
        smokeGeometry.translate(0, .5, 0);
        smokeGeometry.scale(.3, 1.5, .3);

        this.smokeMaterial = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                uTime: new THREE.Uniform(0),
                uPerlinTexture: new THREE.Uniform(this.perlinTexture),
                uSmokeSpeed: new THREE.Uniform(0.05)
            }
        });

        this.smokeMesh = new THREE.Mesh(smokeGeometry, this.smokeMaterial);
        this.smokeMesh.position.copy(this.coffeePosition);
        this.smokeMesh.position.y += .1;

        this.experience.getScene().add(this.smokeMesh);
    }
}
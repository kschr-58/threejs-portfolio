import { Mesh, PlaneGeometry, ShaderMaterial } from "three";
import vertexShader from "../shaders/overlay/vertex.glsl";
import fragmentShader from "../shaders/overlay/fragment.glsl";
import { ThreeJSComponent } from "../threejs.component";

export default class LoadingOverlay { //TODO remove
    private threeComponent: ThreeJSComponent;

    private geometry!: PlaneGeometry;
    private overlayMaterial!: ShaderMaterial;

    constructor(experience: ThreeJSComponent) {
        this.threeComponent = experience;

        this.setGeometry();
    }

    private setGeometry(): void {
        this.geometry = new PlaneGeometry(2, 2, 1, 1);
        this.overlayMaterial = new ShaderMaterial({
            transparent: true,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                uAlpha: { value: 0.5 }
            }
        });
        const overlayMesh = new Mesh(this.geometry, this.overlayMaterial);

        this.threeComponent.getScene().add(overlayMesh);
    }
}
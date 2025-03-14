import { Mesh, Object3D } from "three";
import SizesService from "src/app/services/sizes.service";
import { ThreeJSComponent } from "../../threejs.component";

export default abstract class PageComponent3D {
    protected threeComponent: ThreeJSComponent;
    protected positionableObject!: Object3D;
    protected mesh!: Mesh;

    // Positioning
    protected page: number;
    protected leftMargin: number;   // Value represents a percentage
    protected topMargin: number;    // Value represents a percentage
    protected zPosition: number;

    constructor(experience: ThreeJSComponent, page: number, leftMargin: number, topMargin: number, zPos: number) {
        this.threeComponent = experience;
        this.page = page;
        this.leftMargin = leftMargin;
        this.topMargin = topMargin;
        this.zPosition = zPos;

        SizesService.getInstance().resizeEvent.subscribe(() => this.positionComponent());
    }
    
    protected abstract mapResources(): void;

    protected addToScene(): void {
        this.positionComponent();
    }

    protected positionComponent(): void {
        const aspect = SizesService.getInstance().getAspect();
        const leftBorderPosition = -aspect / 2;
        const topBorderPosition = .5;

        const xOffset = this.leftMargin / 100 * aspect;
        const yOffset = this.topMargin / 100;

        const xPos = leftBorderPosition + xOffset;
        const yPos = topBorderPosition - this.page - yOffset;

        this.positionableObject.position.set(xPos, yPos, this.zPosition);
    }
}
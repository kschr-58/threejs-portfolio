import { Intersection, Object3D } from "three";

export default class RaycastObject {
    private object: Object3D;
    private onHover: ((intersect: Intersection) => void) | null = null;
    private onInitialHover: ((intersect: Intersection) => void) | null = null;
    private onCursorExit: (() => void) | null = null;
    private onClick: (() => void) | null = null;

    public isIntersected: boolean = false;

    constructor(
        object: Object3D, 
        onHover?: (intersection: Intersection) => void, 
        onCursorExit?: () => void, 
        onClick?: () => void,
        onInitialHover?: (intersection: Intersection) => void) {

        this.object = object;

        if (onHover != undefined) this.onHover = onHover;
        if (onInitialHover != undefined) this.onInitialHover = onInitialHover;
        if (onCursorExit != undefined) this.onCursorExit = onCursorExit;
        if (onClick != undefined) this.onClick = onClick;
    }

    public getObject(): Object3D {
        return this.object;
    }

    public triggerOnHover(intersect: Intersection): void {
        if (this.onHover) this.onHover(intersect);
    }

    public triggerOnInitialHover(intersect: Intersection): void {
        if (this.onInitialHover) this.onInitialHover(intersect);
    }

    public triggerOnCursorExit(): void {
        if (this.onCursorExit) this.onCursorExit();
    }

    public triggerOnClick(): void {
        if (this.onClick) this.onClick();
    }
}
import { EventEmitter } from "@angular/core";
import { Subject } from "rxjs";

export default class SizeUtils {
    private width!: number;
    private height!: number;
    private pixelRatio!: number;

    // Events
    public resizeEvent = new Subject<void>();

    constructor() {
        this.recalculateSizes();
        
        window.addEventListener('resize', () => {
            this.recalculateSizes();

            // Fire resize event
            this.resizeEvent.next();
        });
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public getPixelRatio(): number {
        return this.pixelRatio;
    }

    private recalculateSizes(): void {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.pixelRatio = Math.min(window.devicePixelRatio, 2); // Limit pixel ratio to maximum of 2

    }
}

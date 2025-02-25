import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SizesService {
    private static INSTANCE: SizesService;

    private width!: number;
    private height!: number;
    private pixelRatio!: number;

    // Events
    public resizeEvent = new Subject<void>();

    constructor() {
        if (!SizesService.INSTANCE) SizesService.INSTANCE = this;
        else Error('Trying to re-instantiate sizes service');

        window.addEventListener('resize', () => {
            this.recalculateSizes();

            // Fire resize event
            this.resizeEvent.next();
        });

        this.recalculateSizes();
    }

    public static getInstance(): SizesService {
        return this.INSTANCE;
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public getAspect(): number {
        return this.width / this.height;
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

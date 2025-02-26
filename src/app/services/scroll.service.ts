import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export default class ScrollService {
    private static INSTANCE: ScrollService;
    private scrollTop = 0;
    private currentSection: number = 0;

    // Events
    public scrollEvent = new Subject<number>();
    public newSectionEvent = new Subject<number>();

    constructor() {
        if (!ScrollService.INSTANCE) ScrollService.INSTANCE = this;
        else throw Error('Trying to re-instantiate scroll service');

        // Scroll to top of page
        window.onbeforeunload = () => {
            window.scrollTo(0, 0);
        }

        window.addEventListener('scroll', () => {
            this.recalculateScrollTop();
        });

        window.addEventListener('resize', () => {
            this.onResize();
        });
    }

    public static getInstance(): ScrollService {
        return this.INSTANCE;
    }

    public getScrollTop(): number {
        return this.scrollTop;
    }

    public getSection(): number {
        return this.currentSection;
    }

    private recalculateScrollTop(): void {
        const newScrollTop = document.documentElement.scrollTop || document.body.scrollTop;

        this.scrollTop = newScrollTop;
        this.scrollEvent.next(this.scrollTop);

        const newSection = Math.round(this.scrollTop / innerHeight);

        if (this.currentSection != newSection) {
            this.currentSection = newSection;
            this.newSectionEvent.next(newSection);
        }
    }

    private onResize(): void {
        // Scroll to currently active section to prevent 3d element positioning issues
        const sectionPosition = innerHeight * this.currentSection;
        window.scrollTo(0, sectionPosition);
    }
}
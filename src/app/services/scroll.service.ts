import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ScrollService {
    private static INSTANCE: ScrollService;
    private scrollTop = 0;
    private isScrollInProgress = false;
    private scrollTimeout!: ReturnType<typeof setTimeout>;

    // Events
    public scrollEvent = new Subject<number>();

    constructor() {
        if (!ScrollService.INSTANCE) ScrollService.INSTANCE = this;
        else throw Error('Trying to re-instantiate scroll service');

        window.addEventListener('scroll', () => {
            clearTimeout(this.scrollTimeout);

            this.scrollTimeout = setTimeout(() => {
                this.isScrollInProgress = false;
            }, 100);

            const newScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const downwardScroll = newScrollTop > this.scrollTop;

            this.updateScrollTop(newScrollTop);

            if (this.isScrollInProgress) return;
            
            this.isScrollInProgress = true;

            if (!downwardScroll) {
                this.smoothScrollUp();
            } else if (downwardScroll) {
                this.smoothScrollDown();
            }
          });
    }

    public static getInstance(): ScrollService {
        return this.INSTANCE;
    }

    public getScrollTop(): number {
        return this.scrollTop;
    }

    private updateScrollTop(newScrollTop: number) {
        this.scrollTop = newScrollTop;
        this.scrollEvent.next(this.scrollTop);
    }

    private smoothScrollUp() {
        // FIXME current component dependent
        document.querySelector('app-home')?.scrollIntoView({behavior: 'smooth'});
    }

    private smoothScrollDown() {
        // FIXME current component dependent
        document.querySelector('app-skills')?.scrollIntoView({behavior: 'smooth'});
    }
}
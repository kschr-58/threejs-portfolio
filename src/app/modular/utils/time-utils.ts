import { Subject } from "rxjs";
import { Clock } from "three";

export default class TimeUtils {
    private startTime: number;
    private currentTime: number;
    private elapsedTime: number = 0;
    private deltaTime: number = 16; // Default deltatime for 60hz, setting to 0 causes issues with first frame
    private clock: Clock;

    // Events
    public tickEvent = new Subject<void>();

    constructor() {
        this.clock = new Clock();
        this.startTime = Date.now();
        this.currentTime = this.startTime;

        window.requestAnimationFrame(() => {
            this.tick();
        })
    }

    public getStartTime(): number {
        return this.startTime;
    }

    public getCurrentTime(): number {
        return this.currentTime;
    }

    public getElapsedTime(): number {
        return this.elapsedTime;
    }

    public getDeltaTime(): number {
        return this.deltaTime;
    }

    public registerTimedEvent(delay: number, repetitions?: number): Subject<void> {
        const timedEvent = new Subject<void>();
        this.waitForTimedEvent(timedEvent, delay, repetitions);
        return timedEvent;
    }

    private waitForTimedEvent(event: Subject<void>, delay: number, repetitions?: number): void {
        if (repetitions != undefined) {
            if (repetitions == 0) return;
            repetitions--;
        }

        setTimeout(() => {
            event.next();
            return this.waitForTimedEvent(event, delay, repetitions);
        }, delay);
    }

    private tick(): void {
        const newTime = Date.now();
        this.deltaTime = newTime - this.currentTime;
        this.currentTime = newTime;
        this.elapsedTime = this.clock.getElapsedTime();

        window.requestAnimationFrame(() => {
            this.tick();
        });

        this.tickEvent.next();
    }
}
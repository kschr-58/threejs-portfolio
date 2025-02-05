import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private static INSTANCE: ThemeService;
    private darkThemeEnabled = false;

    // Events
    public themeChangeRequestEvent = new Subject<void>();
    public themeChangeEvent = new Subject<boolean>();

    constructor() {
        if (!ThemeService.INSTANCE) ThemeService.INSTANCE = this;
        else Error('Trying to re-instantiate theme service');

        // Check if user has dark mode enabled
        const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.darkThemeEnabled = themeQuery.matches;

        // Listen for theme changes
        themeQuery.addEventListener('change', event => {
            if (this.darkThemeEnabled != themeQuery.matches) this.themeChangeRequestEvent.next();
        });
    }

    public static getInstance(): ThemeService {
        return this.INSTANCE;
    }

    public isDarkThemeEnabled(): boolean {
        return this.darkThemeEnabled;
    }

    public setTheme(isDarkTheme: boolean): void {
        this.darkThemeEnabled = isDarkTheme;
    }

    public swapTheme(): void {
        this.darkThemeEnabled = !this.darkThemeEnabled;

        this.themeChangeEvent.next(this.darkThemeEnabled);
    }
}
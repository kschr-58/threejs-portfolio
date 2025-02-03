import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private darkThemeEnabled = false;

    // Events
    public themeChangeRequestEvent = new Subject<void>();
    public themeChangeEvent = new Subject<boolean>();

    constructor() {
        // Check if user has dark mode enabled
        const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.darkThemeEnabled = themeQuery.matches;

        // Listen for theme changes
        themeQuery.addEventListener('change', event => {
            if (this.darkThemeEnabled != themeQuery.matches) this.themeChangeRequestEvent.next();
        });
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
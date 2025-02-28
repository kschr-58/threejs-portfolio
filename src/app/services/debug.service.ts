import { Injectable } from "@angular/core";
import GUI from "three/examples/jsm/libs/lil-gui.module.min";
import Stats from 'three/examples/jsm/libs/stats.module';

@Injectable({
    providedIn: 'root'
})
export default class DebugService {
    private static INSTANCE: DebugService;

    private gui!: GUI;
    private fpsStats!: Stats;
    private memoryStats!: Stats;

    private isActive: boolean;

    constructor() {
        if (!DebugService.INSTANCE) DebugService.INSTANCE = this;
        else throw new Error('Trying to reinstantiate debug servce');

        this.isActive = window.location.hash == '#debug';

        if (!this.isActive) return;

        this.gui = new GUI();
    }

    public static getInstance(): DebugService {
        return this.INSTANCE;
    }

    public isDebugModeEnabled(): boolean {
        return this.isActive;
    }

    public getGUI(): GUI {
        return this.gui;
    }
}
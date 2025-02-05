import { Experience } from "../experience";
import Character from "./character";
import ForegroundPlane from "./foreground-plane";
import Logos from "./logos/logos";
import MonoboyTest from "./monoboy-test";
import Study from "./study";

export default class World {
    private experience: Experience;
    private study!: Study;
    private monoboy!: MonoboyTest;
    private character!: Character;
    private foregroundPlane!: ForegroundPlane;
    private logos!: Logos;

    constructor(experience: Experience) {
        this.experience = experience;

        // Subscribe to resources loading event
        this.experience.getResourceManager().resourcesLoadedEvent.subscribe((success: boolean) => {
            if (!success) {
                return console.error('Failed to load resources');
            }

            this.onResourcesLoad();
        });
    }

    public tick(): void {
        if (!this.experience.getResourceManager().resourcesReady()) return;
        if (this.study != undefined) this.study.tick();
        if (this.monoboy != undefined) this.monoboy.tick();
        if (this.character != undefined) this.character.tick();
        if (this.logos != undefined) this.logos.tick();
    }

    private onResourcesLoad(): void {
        // this.study = new Study(this.experience);
        // this.monoboy = new MonoboyTest(this.experience);

        this.character = new Character(this.experience);
        this.foregroundPlane = new ForegroundPlane(this.experience);
        this.logos = new Logos(this.experience);
    }
}
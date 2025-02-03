import { ThemeService } from "src/app/services/theme.service";
import { Experience } from "../experience";
import Character from "./character";
import MonoboyTest from "./monoboyTest";
import Study from "./study";

export default class World {
    private experience: Experience;
    private study!: Study;
    private monoboy!: MonoboyTest;
    private character!: Character;

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
    }

    private onResourcesLoad(): void {
        // Study
        // this.study = new Study(this.experience);

        // Monoboy test
        // this.monoboy = new MonoboyTest(this.experience);

        // Character
        this.character = new Character(this.experience);
    }
}
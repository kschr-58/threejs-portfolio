import ResourceLoadingService from "src/app/services/resource-loading.service";
import { Experience } from "../experience";
import Character from "./character";
import ForegroundPlane from "./foreground-plane";
import LogosCollection from "./logos/logos-collection";
import MonoboyTest from "./monoboy-test";
import Study from "./study";
import StudyMono from "./study-mono";

export default class World {
    private experience: Experience;
    private study!: Study;
    private monoboy!: MonoboyTest;
    private character!: Character;
    private foregroundPlane!: ForegroundPlane;
    private logos!: LogosCollection;
    private studyMono!: StudyMono;

    constructor(experience: Experience) {
        this.experience = experience;

        // Subscribe to resources loading event
        ResourceLoadingService.getInstance().loadingFinishedEvent.subscribe((success: boolean) => {
            if (!success) {
                return console.error('Failed to load resources');
            }

            this.onResourcesLoad();
        });
    }

    public tick(): void {
        if (!ResourceLoadingService.getInstance().resourcesReady()) return;
        if (this.study != undefined) this.study.tick();
        if (this.monoboy != undefined) this.monoboy.tick();
        if (this.character != undefined) this.character.tick();
        if (this.logos != undefined) this.logos.tick();
        if (this.studyMono != undefined) this.studyMono.tick();
    }

    private onResourcesLoad(): void {
        this.character = new Character(this.experience, 0, 75, 100.5, -.5);
        this.foregroundPlane = new ForegroundPlane(this.experience, 1, 50, 50, 0.07);
        this.logos = new LogosCollection(this.experience, 1, 7.5, 25, .15, 9, 7, 10);
        this.studyMono = new StudyMono(this.experience, 2, 75, 75, -.5);
    }
}
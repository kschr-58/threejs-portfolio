import ResourceLoadingService from "src/app/services/resource-loading.service";
import { Experience } from "../experience";
import Character from "./character";
import PagePlane from "./page-plane";
import LogosCollection from "./logos/logos-collection";
import MonoboyTest from "./monoboy-test";
import Study from "./study";
import StudyMono from "./study-mono";
import { Vector2 } from "three";

export default class World {
    private experience: Experience;
    private study!: Study;
    private monoboy!: MonoboyTest;
    private character!: Character;
    private backgroundPlane!: PagePlane;
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
        if (this.studyMono != undefined) this.studyMono.tick();
    }

    private onResourcesLoad(): void {
        const primaryColorLight = this.experience.getSharedMaterialsUtils().getPrimaryColorLight();
        const primaryColorDark = this.experience.getSharedMaterialsUtils().getPrimaryColorDark();
        const secondaryColorLight = this.experience.getSharedMaterialsUtils().getSecondaryColorLight();
        const secondaryColorDark = this.experience.getSharedMaterialsUtils().getSecondaryColorDark();

        // First page
        this.character = new Character(this.experience, 0, 75, 100.5, -0.5);
        this.backgroundPlane = new PagePlane(this.experience, 0, 50, 50, -1, new Vector2(1, 1), primaryColorLight, primaryColorDark);

        // Second page
        this.backgroundPlane = new PagePlane(this.experience, 1, 50, 50, 0.07, new Vector2(1, 1), secondaryColorLight, secondaryColorDark);
        this.logos = new LogosCollection(this.experience, 1, 7.5, 25, 0.1, 10, 9, 10);

        // Third page
        this.studyMono = new StudyMono(this.experience, 2, 75, 75, -0.5);   
        this.backgroundPlane = new PagePlane(this.experience, 2, 50, 50, -1, new Vector2(1, 1), primaryColorLight, primaryColorDark);
    }
}
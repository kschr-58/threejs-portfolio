import ResourceLoadingService from "src/app/services/resource-loading.service";
import Character from "./character";
import PagePlane from "./page-plane";
import LogosCollection from "./logos/logos-collection";
import MonoboyTest from "./monoboy-test";
import Study from "./study";
import StudyMono from "./study-mono";
import { Vector2 } from "three";
import { ThreeJSComponent } from "../threejs.component";

export default class World {
    private threeComponent: ThreeJSComponent;
    private study!: Study;
    private monoboy!: MonoboyTest;
    private character!: Character;
    private backgroundPlane!: PagePlane;
    private logos!: LogosCollection;
    private studyMono!: StudyMono;

    constructor(experience: ThreeJSComponent) {
        this.threeComponent = experience;

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
        const primaryColorLight = this.threeComponent.getSharedMaterialsUtils().getPrimaryColorLight();
        const primaryColorDark = this.threeComponent.getSharedMaterialsUtils().getPrimaryColorDark();
        const secondaryColorLight = this.threeComponent.getSharedMaterialsUtils().getSecondaryColorLight();
        const secondaryColorDark = this.threeComponent.getSharedMaterialsUtils().getSecondaryColorDark();

        // First page
        this.character = new Character(this.threeComponent, 0, 75, 100.5, -0.5);
        this.backgroundPlane = new PagePlane(this.threeComponent, 0, 50, 50, -1, new Vector2(1, 1), primaryColorLight, primaryColorDark);

        // Second page
        this.backgroundPlane = new PagePlane(this.threeComponent, 1, 50, 50, 0.07, new Vector2(1, 1), secondaryColorLight, secondaryColorDark);
        this.logos = new LogosCollection(this.threeComponent, 1, 7.5, 25, 0.1, 10, 9, 10);

        // Third page
        this.studyMono = new StudyMono(this.threeComponent, 2, 75, 75, -0.5);   
        this.backgroundPlane = new PagePlane(this.threeComponent, 2, 50, 50, -1, new Vector2(1, 1), primaryColorLight, primaryColorDark);
    }
}
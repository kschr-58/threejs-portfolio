import SizesService from "src/app/services/sizes.service";
import { Vector2, Raycaster, Object3D } from "three";
import CameraManager from "../managers/camera-manager";
import RaycastObject from "src/models/raycast-object";

export default class RaycastUtils {
    private cursorPosition = new Vector2(0, 0);
    private raycaster: Raycaster = new Raycaster();
    private raycastObjectMap: Map<Object3D, RaycastObject> = new Map<Object3D, RaycastObject>();

    constructor(private cameraManager: CameraManager) {
        window.addEventListener('mousemove', event => {
            this.cursorPosition.x = event.clientX;
            this.cursorPosition.y = event.clientY;
        })
    }

    public tick(): void {
        this.cursorRaycast();
    }

    public getCursorPosition(): Vector2 {
        return this.cursorPosition;
    }

    public addRaycastObject(raycastObject: RaycastObject): void {
        this.raycastObjectMap.set(raycastObject.getObject(), raycastObject);
    }

    private cursorRaycast(): void {
        // Get mouseposition
        const windowWidth = SizesService.getInstance().getWidth();
        const windowHeight = SizesService.getInstance().getHeight();

        const relativeCursorPos = new Vector2(this.cursorPosition.x, this.cursorPosition.y);

        relativeCursorPos.x = this.cursorPosition.x / windowWidth * 2 - 1;
        relativeCursorPos.y = (this.cursorPosition.y / windowHeight * 2 - 1) * - 1;

        this.raycaster.setFromCamera(relativeCursorPos, this.cameraManager.getCamera());

        const intersects = this.raycaster.intersectObjects(Array.from(this.raycastObjectMap.keys()));

        if (intersects.length == 0) {
            for (const raycastObject of this.raycastObjectMap.values()) {
                if (raycastObject.isIntersected) {
                    raycastObject.triggerOnCursorExit();
                    raycastObject.isIntersected = false;
                }
            }

            return;
        }
        
        // Check for objects currently being intersected
        this.raycastObjectMap.forEach((raycastObject, object) => {
            const intersection = intersects.find(intersect => intersect.object == object);

            if (intersection != undefined) {
                raycastObject.triggerOnHover(intersection);
                if (!raycastObject.isIntersected) {
                    raycastObject.triggerOnInitialHover(intersection);
                    raycastObject.isIntersected = true;
                }
            } else if (raycastObject.isIntersected) {
                raycastObject.triggerOnCursorExit();
                raycastObject.isIntersected = false;
            }
        });
    }
}
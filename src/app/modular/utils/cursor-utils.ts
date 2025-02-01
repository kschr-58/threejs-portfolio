import { Subject } from "rxjs";
import { Vector2 } from "three";

export default class CursorUtils {
    private cursorPosition = new Vector2(0, 0);

    constructor() {
        window.addEventListener('mousemove', event => {
            this.cursorPosition.x = event.clientX;
            this.cursorPosition.y = event.clientY;
        })
    }

    public getCursorPosition(): Vector2 {
        return this.cursorPosition;
    }
}
import { Camera, CameraHelper, Group, OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import ScrollService from "../../services/scroll.service";
import SizesService from "../../services/sizes.service";
import DebugService from "src/app/services/debug.service";
import { ThreeJSComponent } from "../threejs.component";

export default class CameraManager {
    private threeComponent: ThreeJSComponent;
    private cameraGroup = new Group();

    // ThreeJS objects
    private camera!: OrthographicCamera;
    private debugCamera!: PerspectiveCamera;
    private controls!: OrbitControls;

    // Positions
    private defaultCameraPosition = new Vector3(0, 0, 3);
    private orthoCamStartingPosition = new Vector3(0, 0, 3);

    // Values
    private frustrumSize = 1;
    private fieldOfView: number = 35;
    private near = 2.5;
    private far = 4;
    private cameraScroll = 0;

    // Debugging
    private debugObject: {[k: string]: any} = {};
    private cameraHelper!: CameraHelper;
    private orthographicEnabled = true;

    constructor(threeComponent: ThreeJSComponent) {
        this.threeComponent = threeComponent;

        this.initializeCamera();

        // Subscribe to scroll event
        ScrollService.getInstance().scrollEvent.subscribe(scrollY => {
            this.scrollCamera(scrollY);
        });

        if (DebugService.getInstance().isDebugModeEnabled()) this.setDebugOptions();
    }

    public getCamera(): Camera {
        return this.orthographicEnabled ? this.camera : this.debugCamera;
    }

    public getControls(): OrbitControls {
        return this.controls;
    }

    public resize(): void {
        const sizes = SizesService.getInstance();
        const aspect = sizes.getAspect();

        this.camera.left = (this.frustrumSize * aspect) / -2;
        this.camera.right = (this.frustrumSize * aspect) / 2;
        // this.camera.top = this.frustrumSize / 2,
        // this.camera.bottom = this.frustrumSize / -2,

        this.camera.updateProjectionMatrix();

        // Debug camera resize
        if (this.debugCamera) {
            this.debugCamera.aspect = aspect;
            this.debugCamera.updateProjectionMatrix();
            this.cameraHelper.update();
        }
    }

    public tick(): void {
        if (this.controls) this.controls.update();
    }

    private initializeCamera(): void {
        const sizes = SizesService.getInstance();
        const aspect = sizes.getAspect();

        this.camera = new OrthographicCamera(
            (this.frustrumSize * aspect) / -2,
            (this.frustrumSize * aspect) / 2,
            this.frustrumSize / 2,
            this.frustrumSize / -2,
            this.near,
            this.far
        );

        this.camera.position.copy(this.orthoCamStartingPosition);

        this.threeComponent.getScene().add(this.camera);
    }

    private scrollCamera(scrollY: number): void {
        const sizes = SizesService.getInstance();
        this.cameraScroll = -scrollY / sizes.getHeight();

        this.camera.position.y = this.cameraScroll;
    }

    // #region Debugging

    private setDebugOptions(): void {
        // Add perspective camera and orbit controls
        this.initializeDebugCamera();
        this.initializeOrbitControls();

        // Add camera helper
        this.cameraHelper = new CameraHelper(this.camera);

        this.threeComponent.getScene().add(this.cameraHelper);

        const gui = DebugService.getInstance().getGUI();

        const cameraFolder = gui.addFolder('Camera adjustment');

        this.debugObject['size'] = this.frustrumSize;

        this.debugObject['updateProjectionMatrix'] = () => {
            this.camera.updateProjectionMatrix();
            this.cameraHelper.update();
        };

        this.debugObject['resizeCamera'] = (newSize: number) => {
            const sizes = SizesService.getInstance();
            const aspect = sizes.getAspect();

            console.log(`New size: ${newSize}`);
            this.camera.left = (newSize * aspect) / -2;
            this.camera.right = (newSize * aspect) / 2;
            this.camera.top = newSize / 2;
            this.camera.bottom = newSize / -2;

            this.camera.updateProjectionMatrix();
            this.cameraHelper.update();
        };

        this.debugObject['switchCamera'] = () => {
            this.orthographicEnabled = !this.orthographicEnabled;
        }

        cameraFolder.add(this.camera.position, 'z', 0, 10);
        cameraFolder.add(this.camera, 'near', -10, 10, 0.1).onChange(this.debugObject['updateProjectionMatrix']);
        cameraFolder.add(this.camera, 'far', 10, 100, 1).onChange(this.debugObject['updateProjectionMatrix']);
        cameraFolder.add(this.debugObject, 'size', 0.1, 5, 0.1).onChange(this.debugObject['resizeCamera']);
        cameraFolder.add(this.debugObject, 'switchCamera').name('Switch to debug camera');
    }

    private initializeDebugCamera(): void {
        const sizes = SizesService.getInstance();
        const aspect = sizes.getAspect();
        const scene = this.threeComponent.getScene();

        this.debugCamera = new PerspectiveCamera(
            this.fieldOfView,
            aspect,
            0.1,
            20
        );

        this.debugCamera.position.copy(this.defaultCameraPosition);
        // Camera is added to a group to move this group independently of the camera position
        this.cameraGroup.add(this.debugCamera);

        scene.add(this.cameraGroup);
    }

    private initializeOrbitControls(): void {
        const canvas = this.threeComponent.getCanvas();
        const scene = this.threeComponent.getScene();

        this.controls = new OrbitControls(this.debugCamera, canvas);
        this.controls.enableDamping = true;
    }

    // #endregion
}
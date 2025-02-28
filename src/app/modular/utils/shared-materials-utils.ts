import DebugService from "src/app/services/debug.service";
import { ThemeService } from "src/app/services/theme.service";
import { Color, MeshBasicMaterial, Vector3 } from "three";

export default class SharedMaterialsUtils {
    // Colors
    private primaryColorLight = new Color(0xffffff);
    private primaryColorDark = new Color(0x292929);
    private secondaryColorLight = new Color(0xF1F2F4);
    private secondaryColorDark = new Color(0x1c1c1c);
    private outlineColorLight = new Color(0x000000);
    private outlineColorDark = new Color(0xffffff);

    // Materials
    private secondaryThemeMaterial!: MeshBasicMaterial;
    private primaryThemeMaterial = new MeshBasicMaterial({color: 'white', toneMapped: false});
    private outlineMaterial = new MeshBasicMaterial({color: 'black', toneMapped: false});
    private debugMaterialRed = new MeshBasicMaterial({color: 'red', wireframe: true, visible: false});
    private debugMaterialCyan = new MeshBasicMaterial({color: 'cyan', wireframe: true, visible: false});

    constructor() {
        // Set theme material
        const darkThemeEnabled = ThemeService.getInstance().isDarkThemeEnabled();
        this.secondaryThemeMaterial = new MeshBasicMaterial({color: darkThemeEnabled ? this.secondaryColorDark : this.secondaryColorLight});
        this.secondaryThemeMaterial.toneMapped = false;

        ThemeService.getInstance().themeChangeEvent.subscribe(darkThemeEnabled => {
            this.setThemeMaterials(darkThemeEnabled);
        });

        this.setThemeMaterials(ThemeService.getInstance().isDarkThemeEnabled());

        // Debug options
        if (DebugService.getInstance().isDebugModeEnabled()) this.setDebugOptions();
    }

    public getSecondaryThemeMaterial(): MeshBasicMaterial {
        return this.secondaryThemeMaterial;
    }
    
    public getDebugMaterialRed(): MeshBasicMaterial {
        return this.debugMaterialRed;
    }

    public getDebugMaterialCyan(): MeshBasicMaterial {
        return this.debugMaterialCyan;
    }

    public getOutlineMaterial(): MeshBasicMaterial {
        return this.outlineMaterial;
    }
    
    public getPrimaryThemeMaterial(): MeshBasicMaterial {
        return this.primaryThemeMaterial;
    }

    public getPrimaryColorLight(): Color {
        return this.primaryColorLight;
    }

    public getPrimaryColorDark(): Color {
        return this.primaryColorDark;
    }

    public getSecondaryColorLight(): Color {
        return this.secondaryColorLight;
    }

    public getSecondaryColorDark(): Color {
        return this.secondaryColorDark;
    }

    public getOutlineColorLight(): Color {
        return this.outlineColorLight;
    }

    public getOutlineColorDark(): Color {
        return this.outlineColorDark;
    }

    private setThemeMaterials(darkThemeEnabled: boolean): void {
        this.secondaryThemeMaterial.color = darkThemeEnabled ? this.secondaryColorDark : this.secondaryColorLight;
        this.primaryThemeMaterial.color = darkThemeEnabled ? this.primaryColorDark : this.primaryColorLight;
        this.outlineMaterial.color = darkThemeEnabled ? this.outlineColorDark : this.outlineColorLight;
    }

    private setDebugOptions(): void {
        this.debugMaterialCyan.visible = this.debugMaterialRed.visible = true;
    }
}
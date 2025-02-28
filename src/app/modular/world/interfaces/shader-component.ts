export default interface IShaderComponent { // TODO turn into abstract class?
    assignShaderMaterial(): void;

    setTheme(darkThemeEnabled: boolean): void;

    swapTheme(darkThemeEnabled: boolean): void;

    toDarkThemeTransition(): void;

    toLightThemeTransition(): void;
}
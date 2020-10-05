
export enum CompositionTypes {
    GRID,
    RANDOM
}

export enum CompositionStrategies {
    DEFAULT,
    FULL_RANDOM,
    GOLDEN_CUT,
    LEFT_RIGHT,
    MAX_AREA,
    DONT_RESIZE
}

export enum TShirtTypes {
    TSHIRT,
    LONGSLEEVE
}

export enum TShirtColors {
    LIGHT,
    DARK
}

export enum PrintColors {
    BW,
    COLORFULL
}

export interface UserSettingsModel {
    // mandatory
    composition: CompositionTypes;
    tShirtType: TShirtTypes;
    tShirtColor: TShirtColors;
    printColor: PrintColors;
    canvasWidth: number;
    canvasHeight: number;


    // debug parameters
    drawAreaVisible: boolean;
    lotNumbers: boolean;
    picturesCount: number;
    wordsCount: number;
    qrCode: boolean;
}

export const DefaultUserSettingsModel: UserSettingsModel = {
    composition: CompositionTypes.RANDOM,
    tShirtType: TShirtTypes.LONGSLEEVE,
    tShirtColor: TShirtColors.LIGHT,
    printColor: PrintColors.COLORFULL,
    canvasWidth: 420,
    canvasHeight: 297,

    drawAreaVisible: true,
    lotNumbers: false,
    picturesCount: 5,
    wordsCount: 2,
    qrCode: false,
}

export type ThemeStyleType = "typography" | "colors" | "fonts";

export interface ThemeStyleValue {
    styleId: string;
    type: ThemeStyleType;
}

export interface TextNodeThemeStyles {
    getThemeStyles: () => ThemeStyleValue[];
    setThemeStyles: (styles: ThemeStyleValue[]) => void;
}

/*
 * Indicates that the node is implementing the typography styles
 */
export interface TypographyStylesNode {
    setTypography: (typographyStyleId: string) => void;
    getTypographyStyleId: () => string | undefined;
    clearTypographyStyle: () => void;
    hasTypographyStyle: () => boolean;
}

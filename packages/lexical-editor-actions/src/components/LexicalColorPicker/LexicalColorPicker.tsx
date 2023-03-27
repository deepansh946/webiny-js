import React, { useCallback, useState } from "react";
import styled from "@emotion/styled";
import { css } from "emotion";
import { usePageBuilder } from "@webiny/app-page-builder/hooks/usePageBuilder";
import { usePageElements } from "@webiny/app-page-builder-elements/hooks/usePageElements";
import { PbTheme } from "@webiny/app-page-builder/types";
import { isLegacyRenderingEngine } from "@webiny/app-page-builder/utils";
import classnames from "classnames";
import { ChromePicker } from "react-color";

// Icons
import { ReactComponent as IconPalette } from "./round-color_lens-24px.svg";
import * as url from "url";

const ColorPickerStyle = styled("div")({
    position: "relative",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    columnGap: 20,
    rowGap: 20,
    width: 225,
    padding: 20,
    backgroundColor: "#fff"
});

const Color = styled("button")({
    cursor: "pointer",
    width: 40,
    height: 40,
    borderRadius: 5,
    border: "1px solid var(--mdc-theme-on-background)",
    transition: "transform 0.2s, scale 0.2s",
    display: "flex",
    alignItems: "center",
    "&::after": {
        boxShadow: "0 0.25rem 0.125rem 0 rgba(0,0,0,0.05)",
        transition: "opacity 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)",
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        opacity: 0
    },
    "&:hover": {
        transform: "scale(1.1)",
        boxShadow: "var(--color-picker-active-color) 0 0 2px",
        "&::after": {
            opacity: 1
        }
    }
});

const ClearColor = styled("div")({
    display: "flex",
    width: "100%",
    height: 14,
    alignItems: "center",
    ".icon": {
        marginRight: 0
    }
});

const transparent = css({
    backgroundSize: "10px 10px",
    backgroundImage:
        "linear-gradient( 45deg, #555 25%, transparent 25%, transparent)," +
        "linear-gradient(-45deg, #555 25%, transparent 25%, transparent)," +
        "linear-gradient( 45deg, transparent 75%, #555 75%)," +
        "linear-gradient(-45deg, transparent 75%, #555 75%)"
});

const iconPaletteStyle = css({
    height: 20,
    width: "100%",
    marginTop: 1,
    color: "var(--mdc-theme-secondary)"
});

const COLORS = {
    lightGray: "hsla(0, 0%, 97%, 1)",
    gray: "hsla(300, 2%, 92%, 1)",
    darkGray: "hsla(0, 0%, 70%, 1)",
    darkestGray: "hsla(0, 0%, 20%, 1)",
    black: "hsla(208, 100%, 5%, 1)"
};

const styles = {
    selectedColor: css({
        boxShadow: "0px 0px 0px 2px var(--mdc-theme-secondary)"
    }),
    button: css({
        cursor: "pointer",
        height: 30,
        boxSizing: "border-box",
        "&:hover:not(:disabled)": { backgroundColor: COLORS.gray },
        "&:focus:not(:disabled)": {
            outline: "none"
        },
        "&:disabled": {
            opacity: 0.5,
            cursor: "not-allowed"
        },
        "& svg": {
            width: 16,
            height: 16
        }
    }),
    color: css({
        width: "40px",
        height: "100%"
    })
};

interface LexicalColorPickerProps {
    value: string;
    onChange?: Function;
    onChangeComplete: Function;
    handlerClassName?: string;
}

export const LexicalColorPicker: React.FC<LexicalColorPickerProps> = ({
    value,
    onChange,
    onChangeComplete
}) => {
    const [showPicker, setShowPicker] = useState(false);
    // Either a custom color or a color coming from the theme object.
    const [actualSelectedColor, setActualSelectedColor] = useState(value || "#fff");
    let themeColor = false;

    const getColorValue = useCallback(rgb => {
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
    }, []);

    const onColorChange = useCallback(
        (color, event) => {
            event.preventDefault();
            // controls of the picker are updated as user moves the mouse
            const customColor = getColorValue(color.rgb);
            setActualSelectedColor(customColor);
            if (typeof onChange === "function") {
                onChange(customColor);
            }
        },
        [onChange]
    );

    const onColorChangeComplete = useCallback(
        ({ rgb }, event) => {
            setActualSelectedColor(value);
            onChangeComplete(getColorValue(rgb));
            event.preventDefault();
        },
        [onChangeComplete]
    );

    const togglePicker = useCallback(e => {
        e.stopPropagation();
        setShowPicker(!showPicker);
    }, []);

    const { theme } = usePageBuilder();

    const pageElements = usePageElements();

    let themeColors: Record<string, any> = {};

    if (isLegacyRenderingEngine) {
        const legacyTheme = theme as PbTheme;
        themeColors = legacyTheme?.colors || {};
    } else {
        const colors = pageElements.theme?.styles?.colors;
        if (colors) {
            for (const key in colors) {
                if (colors[key]) {
                    themeColors[key] = colors[key];
                }
            }
        }
    }

    return (
        <ColorPickerStyle>
            <ClearColor>
                <i className={"icon x"} /><a href="javascript:void(0)">Clear</a>
            </ClearColor>
            {Object.keys(themeColors).map((key, index) => {
                const color = themeColors[key];

                if (color === value || value === "transparent") {
                    themeColor = true;
                }
                return (
                    <Color
                        key={index}
                        className={key === value ? styles.selectedColor : ""}
                        style={
                            {
                                backgroundColor: color,
                                "--color-picker-active-color": color
                            } as React.CSSProperties
                        }
                        onClick={() => {
                            // With page elements implementation, we want to store the color key and
                            // then the actual color will be retrieved from the theme object.
                            let value = color;
                            let themeColorName;
                            if (!isLegacyRenderingEngine) {
                                const colors = pageElements.theme?.styles?.colors;
                                themeColorName = key;
                                value = colors[key];
                            }

                            onChangeComplete(value, themeColorName);
                        }}
                    />
                );
            })}

            <Color
                className={classnames(transparent, {
                    [styles.selectedColor]: value === "transparent"
                })}
                onClick={() => {
                    onChangeComplete("transparent");
                }}
            />

            <Color
                className={value && !themeColor ? styles.selectedColor : ""}
                style={{ backgroundColor: themeColor ? "#fff" : value }}
                onClick={togglePicker}
            >
                <IconPalette className={iconPaletteStyle} />
            </Color>

            {showPicker && (
                <ChromePicker
                    color={actualSelectedColor}
                    onChange={onColorChange}
                    onChangeComplete={onColorChangeComplete}
                />
            )}
        </ColorPickerStyle>
    );
};

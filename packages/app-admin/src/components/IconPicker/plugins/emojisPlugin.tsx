import React from "react";
import { observer } from "mobx-react-lite";
import styled from "@emotion/styled";

import { Menu } from "@webiny/ui/Menu";

import { useIcon } from "..";
import { IconPickerTab } from "../IconPickerTab";
import { IconProvider } from "../IconRenderer";
import { useIconPicker } from "../IconPickerPresenterProvider";
import { IconPickerConfig } from "../config";
import { Icon } from "../types";

const SKIN_TONES = ["", "\u{1f3fb}", "\u{1f3fc}", "\u{1f3fd}", "\u{1f3fe}", "\u{1f3ff}"];

const EmojiStyled = styled.div<{ size: number }>`
    display: inline-block;
    width: ${({ size }) => `${size}px`};
    height: ${({ size }) => `${size}px`};
    font-size: ${({ size }) => `${(size * 4) / 5}px`};
    line-height: ${({ size }) => `${size}px`};
    color: black;
`;

const SkinToneSelectWrapper = styled.div`
    padding: 4px;
    width: 32px;
    flex-shrink: 0;
    background: #fff;
    border-radius: 1px;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
    display: inline-block;
    cursor: pointer;
`;

const SkinTonesGrid = styled.div`
    display: grid;
    gap: 4px;
    padding: 4px;
`;

const SkinTone = styled.div`
    cursor: pointer;
`;

interface Emoji extends Icon {
    skinTone: string;
    skinToneSupport: boolean;
}

const Emoji = () => {
    const { icon, size } = useIcon<Emoji>();

    return (
        <EmojiStyled size={size}>
            {icon.skinTone ? icon.value + icon.skinTone : icon.value}
        </EmojiStyled>
    );
};

interface SkinToneSelectProps {
    icon: Icon | null;
    hasSkinToneSupport: boolean;
    onChange: (skinTone: string) => void;
}

const SkinToneSelect = ({ icon, hasSkinToneSupport, onChange }: SkinToneSelectProps) => {
    if (!icon || !isEmoji(icon)) {
        return <SkinToneSelectWrapper />;
    }

    if (!hasSkinToneSupport) {
        return (
            <SkinToneSelectWrapper>
                <IconProvider icon={icon}>
                    <Emoji />
                </IconProvider>
            </SkinToneSelectWrapper>
        );
    }

    return (
        <Menu
            handle={
                <SkinToneSelectWrapper>
                    <IconProvider icon={icon}>
                        <Emoji />
                    </IconProvider>
                </SkinToneSelectWrapper>
            }
        >
            {({ closeMenu }) => (
                <SkinTonesGrid>
                    {SKIN_TONES.map((skinTone, index) => (
                        <SkinTone
                            key={index}
                            onClick={() => {
                                onChange(skinTone);
                                closeMenu();
                            }}
                        >
                            <IconProvider icon={{ ...icon, skinTone }}>
                                <Emoji />
                            </IconProvider>
                        </SkinTone>
                    ))}
                </SkinTonesGrid>
            )}
        </Menu>
    );
};

/**
 * @see https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 */
const isEmoji = (icon: Icon | null): icon is Emoji => {
    if (!icon) {
        return false;
    }
    return icon.type === "emoji";
};

const EmojiTab = observer(() => {
    const presenter = useIconPicker();
    const { selectedIcon } = presenter.vm;

    const onSkinToneChange = (skinTone: string) => {
        if (isEmoji(selectedIcon)) {
            presenter.setIcon({ ...selectedIcon, skinTone });
            presenter.closeMenu();
        } else {
            presenter.closeMenu();
        }
    };

    const onIconSelect = (icon: Icon) => {
        presenter.setIcon(icon);
        presenter.closeMenu();
    };

    const hasSkinToneSupport = isEmoji(selectedIcon) ? selectedIcon.skinToneSupport : false;

    return (
        <IconPickerTab
            label={"Emojis"}
            onChange={onIconSelect}
            actions={
                <SkinToneSelect
                    icon={selectedIcon}
                    hasSkinToneSupport={hasSkinToneSupport}
                    onChange={onSkinToneChange}
                />
            }
        />
    );
});

export const EmojiPlugin = () => {
    return (
        <IconPickerConfig>
            <IconPickerConfig.IconType name={"emoji"}>
                <IconPickerConfig.IconType.Icon element={<Emoji />} />
                <IconPickerConfig.IconType.Tab element={<EmojiTab />} />
            </IconPickerConfig.IconType>
        </IconPickerConfig>
    );
};

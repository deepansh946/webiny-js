import React, { useCallback, useMemo } from "react";

import { createConfigurableComponent } from "@webiny/react-properties";

import { IconPackProvider, IconProps } from "./IconPackProvider";

const { icons: fa6RegularIcons, categories: fa6RegularCategories } = require("./fa6-regular.json");
const { icons: fa6SolidIcons, categories: fa6SolidCategories } = require("./fa6-solid.json");
const emojis = require("./emojis.json");

const base = createConfigurableComponent<IconPickerConfig>("IconPicker");

export const IconPickerConfig = Object.assign(base.Config, { IconPackProvider });
export const IconPickerWithConfig = base.WithConfig;

interface IconPickerConfig {
    iconPackProviders: {
        icons: IconProps[];
        initialize: () => Promise<void> | void;
        isLoading: boolean;
        isInitialized: boolean;
    }[];
}

export function useIconPickerConfig() {
    const config = base.useConfig();

    const iconPackProviders = config.iconPackProviders || [];
    const isLoading = iconPackProviders.some(iconProvider => iconProvider.isLoading);

    const initialize = useCallback(async () => {
        await Promise.all(
            iconPackProviders.map(async provider => {
                if (!provider.isInitialized && !provider.isLoading) {
                    await provider.initialize();
                }
            })
        );
    }, [iconPackProviders]);

    return useMemo(
        () => ({
            icons: iconPackProviders.map(provider => provider.icons || []).flat(),
            initialize,
            isLoading
        }),
        [config]
    );
}

export const DefaultIcons = () => {
    return (
        <IconPickerConfig>
            {/* Default Emojis Provider */}
            <IconPickerConfig.IconPackProvider
                name="default_emojis"
                provider={() =>
                    Object.keys(emojis).map(key => {
                        const emoji = emojis[key];
                        return {
                            type: "emoji",
                            name: emoji.slug,
                            value: key,
                            category: emoji.group,
                            skinToneSupport: emoji.skin_tone_support
                        };
                    })
                }
            />
            {/* Default Icons Providers */}
            <IconPickerConfig.IconPackProvider
                name="fa6_regular"
                provider={() =>
                    Object.keys(fa6RegularIcons).map(key => {
                        const icon = fa6RegularIcons[key];
                        return {
                            type: "icon",
                            name: `regular_${key}`,
                            value: icon.body,
                            category: Object.keys(fa6RegularCategories).find(categoryKey =>
                                fa6RegularCategories[categoryKey].includes(key)
                            ),
                            width: icon.width
                        };
                    })
                }
            />
            <IconPickerConfig.IconPackProvider
                name="fa6_solid"
                provider={() =>
                    Object.keys(fa6SolidIcons).map(key => {
                        const icon = fa6SolidIcons[key];
                        return {
                            type: "icon",
                            name: `solid_${key}`,
                            value: icon.body,
                            category: Object.keys(fa6SolidCategories).find(categoryKey =>
                                fa6SolidCategories[categoryKey].includes(key)
                            ),
                            width: icon.width
                        };
                    })
                }
            />

            {/* Examples of custom icons/emojis providers and async provider */}
            <IconPickerConfig.IconPackProvider
                name="test_custom_emojis"
                provider={() => [{ type: "emoji", name: "testing_face", value: "😀" }]}
            />
            <IconPickerConfig.IconPackProvider
                name="test_custom_icons"
                provider={() => [
                    {
                        type: "icon",
                        name: "testing_book",
                        value: '<path fill="currentColor" d="M272 288h-64c-44.2 0-80 35.8-80 80c0 8.8 7.2 16 16 16h192c8.836 0 16-7.164 16-16c0-44.2-35.8-80-80-80zm-32-32c35.35 0 64-28.65 64-64s-28.65-64-64-64c-35.34 0-64 28.65-64 64s28.7 64 64 64zm256 64h-16v96h16c8.836 0 16-7.164 16-16v-64c0-8.8-7.2-16-16-16zm0-256h-16v96h16c8.8 0 16-7.2 16-16V80c0-8.84-7.2-16-16-16zm0 128h-16v96h16c8.8 0 16-7.2 16-16v-64c0-8.8-7.2-16-16-16zM384 0H96C60.65 0 32 28.65 32 64v384c0 35.35 28.65 64 64 64h288c35.35 0 64-28.65 64-64V64c0-35.35-28.7-64-64-64zm16 448c0 8.836-7.164 16-16 16H96c-8.836 0-16-7.164-16-16V64c0-8.838 7.164-16 16-16h288c8.836 0 16 7.162 16 16v384z"/>'
                    }
                ]}
            />
            <IconPickerConfig.IconPackProvider
                name="fa6_brands"
                provider={async () => {
                    const iconsData = await fetch(
                        "https://raw.githubusercontent.com/iconify/icon-sets/master/json/fa6-brands.json"
                    )
                        .then(res => res.json())
                        .catch(() => null);

                    if (!iconsData) {
                        return [];
                    }

                    const { icons, categories } = iconsData;

                    return Object.keys(icons).map(key => {
                        const icon = icons[key];
                        return {
                            type: "icon",
                            name: `brands_${key}`,
                            value: icon.body,
                            category: Object.keys(categories).find(categoryKey =>
                                categories[categoryKey].includes(key)
                            ),
                            width: icon.width
                        };
                    });
                }}
            />
        </IconPickerConfig>
    );
};

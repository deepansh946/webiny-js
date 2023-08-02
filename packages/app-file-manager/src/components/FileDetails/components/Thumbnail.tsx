import React from "react";
import { makeComposable } from "@webiny/app-admin";
import getFileTypePlugin from "~/getFileTypePlugin";
import { useFile } from "~/hooks/useFile";

/**
 * This component is used in the File Details preview.
 */
export const Thumbnail = makeComposable("FileDetailsThumbnail", () => {
    const { file } = useFile();
    const filePlugin = getFileTypePlugin(file);

    return filePlugin ? (
        <>{filePlugin.render({ file, width: 600 })}</>
    ) : (
        <span>No Preview Available.</span>
    );
});

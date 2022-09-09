import React, { useCallback, useMemo } from "react";
import CloneContentModelDialog from "./CloneContentModelDialog";
import NewContentModelDialog from "./NewContentModelDialog";
import ContentModelsDataList from "./ContentModelsDataList";
import { css } from "emotion";
import { useSecurity } from "@webiny/app-security";
import { Cell, Grid } from "@webiny/ui/Grid";
import { CmsModel, CmsSecurityPermission } from "~/types";

const grid = css`
    &.mdc-layout-grid {
        padding: 0;
        background-color: var(--mdc-theme-background);
        > .mdc-layout-grid__inner {
            grid-gap: 0;
        }
    }
`;

const centeredContent = css`
    background-color: var(--mdc-theme-surface);
    > .webiny-data-list {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 70px);
        .mdc-list {
            overflow: auto;
        }
    }
    > .mdc-list {
        display: flex;
        flex-direction: column;
        max-height: calc(100vh - 70px);
        overflow: auto;
    }
`;

const ContentModels: React.FC = () => {
    const [newContentModelDialogOpened, openNewContentModelDialog] = React.useState(false);

    const [cloneContentModel, setCloneContentModel] = React.useState<CmsModel | null>(null);

    const { identity, getPermission } = useSecurity();

    const canCreate = useMemo((): boolean => {
        const permission = getPermission<CmsSecurityPermission>("cms.contentModel");
        if (!permission) {
            return false;
        }

        if (typeof permission.rwd !== "string") {
            return true;
        }

        return permission.rwd.includes("w");
    }, [identity]);

    const closeModal = useCallback(() => {
        setCloneContentModel(null);
    }, []);

    const onCreate = useCallback(() => openNewContentModelDialog(true), []);
    const onClose = useCallback(() => openNewContentModelDialog(false), []);
    const onClone = useCallback((contentModel: CmsModel) => setCloneContentModel(contentModel), []);
    const onCloneClose = useCallback((): void => setCloneContentModel(null), []);

    return (
        <>
            <NewContentModelDialog open={newContentModelDialogOpened} onClose={onClose} />
            {cloneContentModel && (
                <CloneContentModelDialog
                    open={!!cloneContentModel}
                    contentModel={cloneContentModel}
                    onClose={onCloneClose}
                    closeModal={closeModal}
                />
            )}
            <Grid className={grid}>
                <Cell span={3} />
                <Cell span={6} className={centeredContent}>
                    <ContentModelsDataList
                        canCreate={canCreate}
                        onCreate={onCreate}
                        onClone={onClone}
                    />
                </Cell>
                <Cell span={3} />
            </Grid>
        </>
    );
};

export default ContentModels;

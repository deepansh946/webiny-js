import { CmsModelPlugin } from "@webiny/api-headless-cms";
import { AppPermissions } from "@webiny/api-security/utils/AppPermissions";
import WebinyError from "@webiny/error";

import { createFormBuilder } from "~/index";
import { createFormBuilderPlugins } from "./createFormBuilderPlugins";
import { CmsFormsStorage } from "./CmsFormsStorage";
import { CmsSubmissionsStorage } from "./CmsSubmissionsStorage";
import { FormBuilderContext, FbFormPermission, FormBuilderStorageOperations } from "~/types";

class FormsPermissions extends AppPermissions<FbFormPermission> {}

export class FormBuilderContextSetup {
    private readonly context: FormBuilderContext;

    constructor(context: FormBuilderContext) {
        this.context = context;
    }

    async setupContext(storageOperations: FormBuilderStorageOperations) {
        // This registers code plugins (model group, models)
        const { groupPlugin, formModelDefinition, submissionModelDefinition } =
            createFormBuilderPlugins();

        // Finally, register all plugins
        this.context.plugins.register([
            groupPlugin,
            new CmsModelPlugin(formModelDefinition),
            new CmsModelPlugin(submissionModelDefinition)
        ]);

        const formsStorageOps = await this.context.security.withoutAuthorization(() => {
            return this.setupFormsCmsStorageOperations();
        });
        const submissionsStorageOps = await this.context.security.withoutAuthorization(() => {
            return this.setupSubmissionsCmsStorageOperations();
        });

        storageOperations = {
            ...storageOperations,
            forms: formsStorageOps,
            submissions: submissionsStorageOps
        };

        const formsPermissions = new FormsPermissions({
            getIdentity: this.getIdentity.bind(this),
            getPermissions: () => this.context.security.getPermissions("fb.form"),
            fullAccessPermissionName: "fb.*"
        });

        return createFormBuilder({
            storageOperations,
            formsPermissions,
            context: this.context
        });
    }

    private getIdentity() {
        return this.context.security.getIdentity();
    }

    private async setupFormsCmsStorageOperations() {
        const model = await this.getModel("fbForm");

        return await CmsFormsStorage.create({
            model,
            cms: this.context.cms,
            security: this.context.security
        });
    }

    private async setupSubmissionsCmsStorageOperations() {
        const model = await this.getModel("fbSubmission");

        return await CmsSubmissionsStorage.create({
            model,
            cms: this.context.cms,
            security: this.context.security
        });
    }

    private async getModel(modelId: string) {
        const model = await this.context.cms.getModel(modelId);
        if (!model) {
            throw new WebinyError({
                code: "MODEL_NOT_FOUND",
                message: `Content model "${modelId}" was not found!`
            });
        }

        return model;
    }
}

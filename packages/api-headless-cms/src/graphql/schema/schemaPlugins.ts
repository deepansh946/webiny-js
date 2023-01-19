import { CmsModelFieldToGraphQLPlugin, CmsFieldTypePlugins, CmsContext } from "~/types";
import { createManageSDL } from "./createManageSDL";
import { createReadSDL } from "./createReadSDL";
import { createManageResolvers } from "./createManageResolvers";
import { createReadResolvers } from "./createReadResolvers";
import { createPreviewResolvers } from "./createPreviewResolvers";
import { getSchemaFromFieldPlugins } from "~/utils/getSchemaFromFieldPlugins";
import { filterModelsDeletedFields } from "~/utils/filterModelFields";
import { CmsGraphQLSchemaPlugin } from "~/plugins";

export const generateSchemaPlugins = async (
    context: CmsContext
): Promise<CmsGraphQLSchemaPlugin[]> => {
    const { plugins, cms } = context;

    /**
     * If type does not exist, we are not generating schema plugins for models.
     * It should not come to this point, but we check it anyways.
     */
    const { type } = cms;
    if (!type) {
        return [];
    }

    // Structure plugins for faster access
    const fieldTypePlugins: CmsFieldTypePlugins = plugins
        .byType<CmsModelFieldToGraphQLPlugin>("cms-model-field-to-graphql")
        .reduce((acc, pl) => {
            acc[pl.fieldType] = pl;
            return acc;
        }, {} as Record<string, CmsModelFieldToGraphQLPlugin>);

    // Load model data
    context.security.disableAuthorization();
    const initialModels = (await cms.listModels()).filter(model => model.isPrivate !== true);
    context.security.enableAuthorization();

    const models = filterModelsDeletedFields({
        models: initialModels,
        type
    });

    const schemas = getSchemaFromFieldPlugins({
        models,
        fieldTypePlugins,
        type
    });

    const newPlugins: CmsGraphQLSchemaPlugin[] = [];
    for (const schema of schemas) {
        newPlugins.push(new CmsGraphQLSchemaPlugin(schema));
    }

    models
        .filter(model => model.fields.length > 0)
        .forEach(model => {
            switch (type) {
                case "manage":
                    newPlugins.push(
                        new CmsGraphQLSchemaPlugin({
                            typeDefs: createManageSDL({ model, fieldTypePlugins }),
                            resolvers: createManageResolvers({
                                models,
                                model,
                                fieldTypePlugins,
                                context
                            })
                        })
                    );

                    break;
                case "preview":
                case "read":
                    newPlugins.push(
                        new CmsGraphQLSchemaPlugin({
                            typeDefs: createReadSDL({ model, fieldTypePlugins }),
                            resolvers: cms.READ
                                ? createReadResolvers({
                                      models,
                                      model,
                                      fieldTypePlugins,
                                      context
                                  })
                                : createPreviewResolvers({
                                      models,
                                      model,
                                      fieldTypePlugins,
                                      context
                                  })
                        })
                    );
                    break;
                default:
                    return;
            }
        });

    return newPlugins.filter(pl => !!pl.schema.typeDefs);
};

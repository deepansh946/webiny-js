import {
    BlockCategoryStorageOperations as BaseBlockCategoryStorageOperations,
    CategoryStorageOperations as BaseCategoryStorageOperations,
    PageBlockStorageOperations as BasePageBlockStorageOperations,
    PageBuilderStorageOperations as BasePageBuilderStorageOperations,
    PageTemplateStorageOperations as BasePageTemplateStorageOperations
} from "@webiny/api-page-builder/types";
import { Entity, Table } from "dynamodb-toolbox";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Client } from "@elastic/elasticsearch";
import { PluginCollection } from "@webiny/plugins/types";
import { DynamoDBTypes, TableConstructor } from "dynamodb-toolbox/dist/classes/Table";
import {
    EntityAttributeConfig,
    EntityCompositeAttributes
} from "dynamodb-toolbox/dist/classes/Entity";

export type AttributeDefinition = DynamoDBTypes | EntityAttributeConfig | EntityCompositeAttributes;

export type Attributes = Record<string, AttributeDefinition>;

export enum ENTITIES {
    SYSTEM = "PbSystem",
    SETTINGS = "PbSettings",
    CATEGORIES = "PbCategories",
    MENUS = "PbMenus",
    PAGE_ELEMENTS = "PbPageElements",
    PAGES = "PbPages",
    PAGES_ES = "PbPagesEs",
    BLOCK_CATEGORIES = "PbBlockCategories",
    PAGE_BLOCKS = "PbPageBlocks",
    PAGE_TEMPLATES = "PbPageTemplates"
}

export interface TableModifier {
    (table: TableConstructor): TableConstructor;
}

export interface PageBuilderStorageOperations extends BasePageBuilderStorageOperations {
    getTable: () => Table;
    getEsTable: () => Table;
    getEntities: () => Record<
        | "system"
        | "settings"
        | "categories"
        | "menus"
        | "pageElements"
        | "pages"
        | "pagesEs"
        | "blockCategories"
        | "pageBlocks"
        | "pageTemplates",
        Entity<any>
    >;
}

export interface StorageOperationsFactoryParams {
    documentClient: DocumentClient;
    elasticsearch: Client;
    table?: TableModifier;
    esTable?: TableModifier;
    attributes?: Record<ENTITIES, Attributes>;
    plugins?: PluginCollection;
}

export interface StorageOperationsFactory {
    (params: StorageOperationsFactoryParams): PageBuilderStorageOperations;
}

export interface DataContainer<T> {
    PK: string;
    SK: string;
    TYPE: string;
    data: T;
}

export interface DataLoaderInterface {
    clear: () => void;
}

export interface PageTemplateStorageOperations extends BasePageTemplateStorageOperations {
    dataLoader: DataLoaderInterface;
}

export interface BlockCategoryStorageOperations extends BaseBlockCategoryStorageOperations {
    dataLoader: DataLoaderInterface;
}

export interface CategoryStorageOperations extends BaseCategoryStorageOperations {
    dataLoader: DataLoaderInterface;
}

export interface PageBlockStorageOperations extends BasePageBlockStorageOperations {
    dataLoader: DataLoaderInterface;
}

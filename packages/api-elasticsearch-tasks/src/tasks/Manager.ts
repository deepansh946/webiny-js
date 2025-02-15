import { DynamoDBDocument, getDocumentClient } from "@webiny/aws-sdk/client-dynamodb";
import { Client, createElasticsearchClient } from "@webiny/api-elasticsearch";
import { createTable } from "~/definitions";
import { Context, IElasticsearchIndexingTaskValues, IManager } from "~/types";
import { createEntry } from "~/definitions/entry";
import { Entity } from "@webiny/db-dynamodb/toolbox";
import { ITaskResponse } from "@webiny/tasks/response/abstractions";
import { ITaskManagerStore } from "@webiny/tasks/runner/abstractions";
import {
    batchReadAll,
    BatchReadItem,
    batchWriteAll,
    BatchWriteItem,
    BatchWriteResult
} from "@webiny/db-dynamodb";

export interface ManagerParams {
    context: Context;
    documentClient?: DynamoDBDocument;
    elasticsearchClient?: Client;
    isCloseToTimeout: () => boolean;
    isAborted: () => boolean;
    response: ITaskResponse;
    store: ITaskManagerStore<IElasticsearchIndexingTaskValues>;
}

export class Manager implements IManager {
    public readonly documentClient: DynamoDBDocument;
    public readonly elasticsearch: Client;
    public readonly context: Context;
    public readonly table: ReturnType<typeof createTable>;
    public readonly isCloseToTimeout: () => boolean;
    public readonly isAborted: () => boolean;
    public readonly response: ITaskResponse;
    public readonly store: ITaskManagerStore<IElasticsearchIndexingTaskValues>;

    private readonly entities: Record<string, Entity<any>> = {};

    public constructor(params: ManagerParams) {
        this.context = params.context;
        this.documentClient = params?.documentClient || getDocumentClient();

        this.elasticsearch =
            params?.elasticsearchClient ||
            params.context.elasticsearch ||
            createElasticsearchClient({
                endpoint: `https://${process.env.ELASTIC_SEARCH_ENDPOINT}`
            });

        this.table = createTable({
            documentClient: this.documentClient
        });
        this.isCloseToTimeout = params.isCloseToTimeout;
        this.isAborted = params.isAborted;
        this.response = params.response;
        this.store = params.store;
    }

    public getEntity(name: string): Entity<any> {
        if (this.entities[name]) {
            return this.entities[name];
        }

        return (this.entities[name] = createEntry({
            table: this.table,
            entityName: name
        }));
    }

    public async read<T>(items: BatchReadItem[]) {
        return await batchReadAll<T>({
            table: this.table,
            items
        });
    }

    public async write(items: BatchWriteItem[]): Promise<BatchWriteResult> {
        return await batchWriteAll({
            table: this.table,
            items
        });
    }
}

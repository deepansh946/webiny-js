export interface ISocketsConnectionRegistryData {
    connectionId: string;
    identity: string;
    tenant: string;
    locale: string;
    connectedOn: string;
    domainName: string;
    stage: string;
}

export interface ISocketsConnectionRegistryRegisterParams {
    connectionId: string;
    tenant: string;
    locale: string;
    identity: string;
    domainName: string;
    stage: string;
}

export interface ISocketsConnectionRegistryUnregisterParams {
    connectionId: string;
}

export interface ISocketsConnectionRegistry {
    register(
        event: ISocketsConnectionRegistryRegisterParams
    ): Promise<ISocketsConnectionRegistryData>;
    unregister(event: ISocketsConnectionRegistryUnregisterParams): Promise<void>;

    listViaIdentity(identity: string): Promise<ISocketsConnectionRegistryData[]>;
    listViaTenant(tenant: string, locale?: string): Promise<ISocketsConnectionRegistryData[]>;
}

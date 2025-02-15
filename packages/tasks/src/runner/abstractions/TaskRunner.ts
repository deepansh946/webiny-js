import { Context as LambdaContext } from "aws-lambda/handler";
import { Context } from "~/types";
import { Reply, Request } from "@webiny/handler/types";
import { ITaskEvent } from "~/handler/types";
import { IResponseResult } from "~/response/abstractions";

export interface ITaskRunner<C extends Context = Context> {
    request: Request;
    reply: Reply;
    context: C;
    lambdaContext: Pick<LambdaContext, "getRemainingTimeInMillis">;
    isCloseToTimeout: (seconds?: number) => boolean;
    getRemainingTime: () => number;

    run(event: ITaskEvent): Promise<IResponseResult>;
}

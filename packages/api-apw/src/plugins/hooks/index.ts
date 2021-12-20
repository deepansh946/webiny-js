import { ContextPlugin } from "@webiny/handler/plugins/ContextPlugin";
import { ApwContext } from "~/types";

import linkWorkflowToPage from "./linkWorkflowToPage";
import { deleteCommentsAfterChangeRequest } from "./deleteCommentsAfterChangeRequest";
import { deleteChangeRequestsWithContentReview } from "./deleteChangeRequestsAfterContentReview";
import { createReviewerFromIdentity } from "./createReviewerFromIdentity";
import { initializeContentReviewSteps } from "./initializeContentReviewSteps";
import { updatePendingChangeRequestsCount } from "./updatePendingChangeRequests";

export default () => [
    linkWorkflowToPage(),
    /**
     * Hook into CMS events and execute business logic.
     */
    new ContextPlugin<ApwContext>(async context => {
        createReviewerFromIdentity(context);

        initializeContentReviewSteps(context);

        updatePendingChangeRequestsCount(context);

        deleteCommentsAfterChangeRequest(context);

        deleteChangeRequestsWithContentReview(context);
    })
];

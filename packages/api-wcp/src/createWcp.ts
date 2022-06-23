import { getWcpProjectLicense, getWcpAppUrl, WCP_FEATURE_LABEL } from "@webiny/wcp";
import WError from "@webiny/error";
import { WcpContextObject, CachedWcpProjectLicense } from "./types";
import { getWcpProjectLicenseCacheKey, getWcpProjectEnvironment } from "./utils";

const wcpProjectEnvironment = getWcpProjectEnvironment();

const cachedWcpProjectLicense: CachedWcpProjectLicense = {
    cacheKey: null,
    license: null
};

export const createWcp = async (): Promise<WcpContextObject> => {
    if (wcpProjectEnvironment) {
        const currentCacheKey = getWcpProjectLicenseCacheKey();
        if (cachedWcpProjectLicense.cacheKey !== currentCacheKey) {
            cachedWcpProjectLicense.cacheKey = currentCacheKey;
            // Will pull the project license from the WCP API.
            cachedWcpProjectLicense.license = await getWcpProjectLicense({
                orgId: wcpProjectEnvironment.org.id,
                projectId: wcpProjectEnvironment.project.id,
                projectEnvironmentApiKey: wcpProjectEnvironment.apiKey
            });
        }
    }

    return {
        getProjectEnvironment: () => {
            return wcpProjectEnvironment;
        },
        getProjectLicense: () => {
            return cachedWcpProjectLicense.license;
        },
        canUseFeature(wcpFeatureId: keyof typeof WCP_FEATURE_LABEL) {
            const projectLicense = this.getProjectLicense();

            // For backwards compatibility, we need to check the legacy ENV variable `WEBINY_MULTI_TENANCY`.
            if (!projectLicense && wcpFeatureId === "multiTenancy") {
                return process.env.WEBINY_MULTI_TENANCY === "true";
            }
            return projectLicense?.package?.features?.[wcpFeatureId]?.enabled === true;
        },
        ensureCanUseFeature(wcpFeatureId: keyof typeof WCP_FEATURE_LABEL) {
            if (this.canUseFeature(wcpFeatureId)) {
                return;
            }

            let message = `The ${wcpFeatureId} Webiny Control Panel feature cannot be used because your project license does not permit it.`;
            if (wcpProjectEnvironment) {
                const { org, project } = wcpProjectEnvironment;
                const upgradeProjectLicenseLink = getWcpAppUrl(`/${org.id}/${project.id}/settings`);
                message += `To upgrade your project license, please use the following link: ${upgradeProjectLicenseLink}.`;
            }

            throw new WError(message, "WCP_CANNOT_USE_FEATURE", { wcpFeatureId });
        }
    } as WcpContextObject;
};

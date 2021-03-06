"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const azure_arm_resource_1 = require("azure-arm-resource");
const util = require("./util");
class NotSignedInError extends Error {
}
exports.NotSignedInError = NotSignedInError;
class CredentialError extends Error {
}
exports.CredentialError = CredentialError;
class AzureAccountWrapper {
    constructor(extensionConext) {
        this.extensionConext = extensionConext;
        this.accountApi = vscode_1.extensions.getExtension('ms-vscode.azure-account').exports;
    }
    getAzureSessions() {
        const status = this.signInStatus;
        if (status !== 'LoggedIn') {
            throw new NotSignedInError(status);
        }
        return this.accountApi.sessions;
    }
    getCredentialByTenantId(tenantId) {
        const session = this.getAzureSessions().find((s, i, array) => s.tenantId.toLowerCase() === tenantId.toLowerCase());
        if (session) {
            return session.credentials;
        }
        throw new CredentialError(`Failed to get credential, tenant ${tenantId} not found.`);
    }
    get signInStatus() {
        return this.accountApi.status;
    }
    getFilteredSubscriptions() {
        return this.accountApi.filters.map(filter => {
            return {
                id: filter.subscription.id,
                subscriptionId: filter.subscription.subscriptionId,
                tenantId: filter.session.tenantId,
                displayName: filter.subscription.displayName,
                state: filter.subscription.state,
                subscriptionPolicies: filter.subscription.subscriptionPolicies,
                authorizationSource: filter.subscription.authorizationSource
            };
        });
    }
    getAllSubscriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = new Array();
            this.getAzureSessions().forEach((s, i, array) => {
                const client = new azure_arm_resource_1.SubscriptionClient(s.credentials);
                const tenantId = s.tenantId;
                tasks.push(util.listAll(client.subscriptions, client.subscriptions.list()).then(result => {
                    return result.map((value) => {
                        // The list() API doesn't include tenantId information in the subscription object, 
                        // however many places that uses subscription objects will be needing it, so we just create 
                        // a copy of the subscription object with the tenantId value.
                        return {
                            id: value.id,
                            subscriptionId: value.subscriptionId,
                            tenantId: tenantId,
                            displayName: value.displayName,
                            state: value.state,
                            subscriptionPolicies: value.subscriptionPolicies,
                            authorizationSource: value.authorizationSource
                        };
                    });
                }));
            });
            const results = yield Promise.all(tasks);
            const subscriptions = new Array();
            results.forEach((result) => result.forEach((subscription) => subscriptions.push(subscription)));
            return subscriptions;
        });
    }
    getLocationsBySubscription(subscription) {
        return __awaiter(this, void 0, void 0, function* () {
            const credential = this.getCredentialByTenantId(subscription.tenantId);
            const client = new azure_arm_resource_1.SubscriptionClient(credential);
            const locations = (yield client.subscriptions.listLocations(subscription.subscriptionId));
            return locations;
        });
    }
    registerSessionsChangedListener(listener, thisArg) {
        return this.accountApi.onSessionsChanged(listener, thisArg, this.extensionConext.subscriptions);
    }
    registerFiltersChangedListener(listener, thisArg) {
        return this.accountApi.onFiltersChanged(listener, thisArg, this.extensionConext.subscriptions);
    }
}
exports.AzureAccountWrapper = AzureAccountWrapper;
//# sourceMappingURL=azureAccountWrapper.js.map
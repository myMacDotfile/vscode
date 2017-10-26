"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
var ShowOnlineHelpRequest;
(function (ShowOnlineHelpRequest) {
    ShowOnlineHelpRequest.type = new vscode_languageclient_1.RequestType('powerShell/showOnlineHelp');
})(ShowOnlineHelpRequest = exports.ShowOnlineHelpRequest || (exports.ShowOnlineHelpRequest = {}));
class ShowHelpFeature {
    constructor() {
        this.command = vscode.commands.registerCommand('PowerShell.OnlineHelp', () => {
            if (this.languageClient === undefined) {
                // TODO: Log error message
                return;
            }
            const editor = vscode.window.activeTextEditor;
            var selection = editor.selection;
            var doc = editor.document;
            var cwr = doc.getWordRangeAtPosition(selection.active);
            var text = doc.getText(cwr);
            this.languageClient.sendRequest(ShowOnlineHelpRequest.type, text);
        });
    }
    setLanguageClient(languageclient) {
        this.languageClient = languageclient;
    }
    dispose() {
        this.command.dispose();
    }
}
exports.ShowHelpFeature = ShowHelpFeature;
//# sourceMappingURL=ShowOnlineHelp.js.map
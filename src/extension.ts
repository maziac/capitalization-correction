import * as vscode from 'vscode';
import {Utility} from './utility';
import path = require('path');
//import {Preferences} from './preferences';


// To store the current preferences.
let preferences: vscode.WorkspaceConfiguration | undefined;

// To store the current workspace folder.
let workspaceFolderUri: vscode.Uri | undefined;

// Stroes if all include and exclude filters have been passed.
let passedFilters: boolean | undefined;

// The extension name
let extensionName: string;


// Extension is activated.
export function activate(context: vscode.ExtensionContext) {
    // Store name of extension
    extensionName = context.extension.packageJSON.name;

    // Called on configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration(extensionName)) {
            preferences = undefined; // Re-read next time
            passedFilters = undefined;
        }
    }));

    // Called everytime a document changes, e.g. on text input.
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        correctInput(event);
    }));

    // Called everytime a document changes, e.g. on text input.
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            passedFilters = undefined;
            // Get the workspace folder path
            const textWorkspaceFolderUri = vscode.workspace.getWorkspaceFolder(editor.document.uri)?.uri;
            // Check for change
            if (textWorkspaceFolderUri !== workspaceFolderUri) {
                workspaceFolderUri = textWorkspaceFolderUri;
                preferences = undefined;
            }
        }
    }));
}


/** Correct capitalization of word.
 * I.e. "CApitalization" will be corrected to "Capitalization".
 * Exits immediately if a letter is the last character.
 * I.e. the word is corrected not before the user e.g. entered a space.
 */
function correctInput(event: vscode.TextDocumentChangeEvent) {
    // Check on change
    if (!event.contentChanges.length)
        return;

    // Check if no letter
    const inpLetter = event.contentChanges[0].text
    //console.log(inpLetter);
    if (Utility.isLetter(inpLetter))
        return;

    // Safety check for active editor
    const editor = vscode.window.activeTextEditor;
    const doc = event.document;
    if (!editor || editor.document != doc)
        return;

    // Get workspace folder if necessary
if (!workspaceFolderUri) {
        workspaceFolderUri = vscode.workspace.getWorkspaceFolder(doc.uri)?.uri;
    }

    // Get preferences if necessary
    if (!preferences) {
        preferences = vscode.workspace.getConfiguration(extensionName, workspaceFolderUri);
    }

    // Check include/exclude lists:
    if (passedFilters === undefined) {
        const includeFiles = preferences.get<string>('includeFiles');
        // Check includes:
        const fileExtension = path.extname(editor.document.fileName);
        passedFilters = Utility.contains(doc.languageId, fileExtension, includeFiles);
        // Check excludes:
        if (passedFilters) {    // Only if not already failed
            const excludeFiles = preferences.get<string>('excludeFiles');
            passedFilters = Utility.contains(doc.languageId, fileExtension, excludeFiles);
        }
    }
    //console.log("doc languageId: " + doc.languageId);

    // Return if filtered out.
    if (!passedFilters)
        return;

    // Get line up to current "cursor" position
    const start = editor.selection.start;
    const selectionClmn = start.character;
    const line = start.line;
    const text = doc.getText(
        new vscode.Range(line, 0, line, selectionClmn)
    );
    //console.log(":" + text);

    // Get corrected word
    let correctedWord = Utility.getCorrectlyCapitalizedWord(text);
    if (!correctedWord)
        return; // No word was corrected

    // Replace
    const startClmn = selectionClmn - correctedWord.length;
    let endClmn = selectionClmn;
    if (inpLetter !== '\n') {
        correctedWord += inpLetter;   // For correct behavior of UNDO
        endClmn++;
    }
    editor.edit(
        editBuilder => {
            editBuilder.delete(new vscode.Range(line, startClmn, line, endClmn));
            editBuilder.insert(new vscode.Position(line, startClmn), correctedWord!);
        },
        {
            undoStopAfter: false,
            undoStopBefore: true,
        }
    );
}

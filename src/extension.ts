import * as vscode from 'vscode';
import {Utility} from './utility';
import path = require('path');


// To store the current preferences.
let preferences: vscode.WorkspaceConfiguration | undefined;

// To store the current workspace folder.
let workspaceFolderUri: vscode.Uri | undefined;

// Stores if all include and exclude filters have been passed.
let isIncluded: boolean | undefined;

// Stores whether the correction should only be applied to text
let inCStyleComment: boolean;

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
            isIncluded = undefined;
        }
    }));

    // Called every time a document changes, e.g. on text input.
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        correctInput(event);
    }));

    // Called everytime a document changes, e.g. on text input.
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            isIncluded = undefined;
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
    if (isIncluded === undefined) {
        const includeFiles = preferences.get<string>('includeFiles');
        // Check includes:
        const fileExtension = path.extname(editor.document.fileName)?.slice(1)
        isIncluded = Utility.contains(fileExtension, includeFiles);
        // Check if it is a programming language (to check for text only in comments):
        const cStyleCommentsFiles = preferences.get<string>("cStyleCommentsFiles");
        inCStyleComment = Utility.contains(fileExtension, cStyleCommentsFiles);
    }
    //console.log("doc languageId: " + doc.languageId);

    // Return if filtered out.
    if (!isIncluded && !inCStyleComment)
        return;

    // Get current cursor column and line
    const start = editor.selection.start;
    const selectionClmn = start.character;
    const line = start.line;

    // Check for comment area
    if (inCStyleComment) {
        // Do extra check if current cursor position is inside a comment
        const prevText = doc.getText(new vscode.Range(0, 0, line, selectionClmn));  // All text from line 0 to current cursor position
        if (!Utility.isComment(prevText, '//', '/\\*', '\\*/')) {
            // Stop if not in a comment
            return;
        }
    }

    // Get line up to current "cursor" position
    const text = doc.getText(new vscode.Range(line, 0, line, selectionClmn));
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

import * as vscode from 'vscode';
import {Utility} from './utility';

export function activate(context: vscode.ExtensionContext) {

    // Called everytime a document changes, e.g. on text input.
    vscode.workspace.onDidChangeTextDocument(event => {
        correctInput(event);
    });
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
    if (!editor || editor.document != event.document)
        return;

    const {selection} = editor;
    const selectionClmn = selection.start.character;
    const line = selection.start.line;
    const text = editor.document.getText(
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

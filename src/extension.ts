import * as vscode from 'vscode';

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
    if (!event.contentChanges.length) {
        return;
    }

    console.log(event.contentChanges[0].text);
    // Check if no letter
    const inpLetter = event.contentChanges[0].text
    if (inpLetter.length !== 1 || inpLetter.match(/[\p{Lu}\p{Ll}]/u)) {
        return;
    }

    // Safety check for active editor
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document != event.document) {
        return;
    }

    const {selection} = editor;
    const selectionClmn = selection.start.character;
    const line = selection.start.line;
    const text = editor.document.getText(
        new vscode.Range(line, 0, line, selectionClmn)
    );
    console.log(":" + text);

    // Get characters in front of selection
    const match = /(?:^|[^\p{Lu}\p{Ll}])(\p{Lu}\p{Lu}\p{Ll}+)$/u.exec(text);
    if (!match)
        return; // Nothing found
    const foundWord = match[1];
    console.log("::" + foundWord);

    // Replace
    let correctedWord = foundWord.replace(/^(\p{Lu})(\p{Lu}+)(\p{Ll})/gu, (match, g1, g2, g3) => g1 + g2.toLowerCase() + g3);

    if (correctedWord !== foundWord) {
        const startClmn = selectionClmn - correctedWord.length;
        let endClmn = selectionClmn;
        if (inpLetter !== '\n') {
            correctedWord += inpLetter;   // For correct behavior of UNDO
            endClmn++;
        }
        editor.edit(
            editBuilder => {
                editBuilder.delete(new vscode.Range(line, startClmn, line, endClmn));
                editBuilder.insert(new vscode.Position(line, startClmn), correctedWord);
            },
            {
                undoStopAfter: false,
                undoStopBefore: true,
            }
        );
    }
}

import * as micromatch from 'micromatch';


export class Utility {
	// Regex to find the space after the word.
	// (To start the correction of the word)
	static regexLetter = RegExp(/\p{L}/u);

	// Regex to find a combination of 2 upper case followed by lowercase
	// letters at the start of the string.
	static regexWrongCapitalizedWord = RegExp(/(?:^|\P{L})(\p{Lu})(\p{Lu})(\p{Ll}+)$/u);


	/** Checks if text is a letter. Upper or lower case.
	 * @returns true if it is and text length is exactly 1.
	 */
	public static isLetter(text: string): boolean {
		if (text.length !== 1) return false;
		const found = this.regexLetter.test(text);
		return found;
	}

	/** Returns the end of the string. If it ends with uppercase letters followed by lower case letters.
	 * If no word is found that can be corrected, null is returned.
	 */
	public static getCorrectlyCapitalizedWord(text: string): string | null {
		const match = this.regexWrongCapitalizedWord.exec(text);
		if (!match)
			return null; // Nothing found
		// Otherwise fix capitalization
		const correctedWord = match[1] + match[2].toLowerCase() + match[3];
		return correctedWord;
	}


	/** The function checks if a given file path is matching a glob pattern.
	 * Comparisons are case sensitive.
	 * @param docFilepath The full file path.
	 * @param globPattern E.g. "** /*.{md,txt}". A comma separated list of file extensions. Or 'undefined'.
	 * @returns a boolean value indicating whether the docFilepath is matching
	 * with globPattern.
	 */
	public static contains(docFilepath: string, globPattern: string | undefined): boolean {
		let found = false;
		if (globPattern) {
			// Check the pattern
			found = micromatch.isMatch(docFilepath, globPattern);
		}
		return found;
	}

	/**
	 * Checks if a given text contains a comment, either a block comment or a
	 * single line comment.
	 * The tokens need to be passed as an escaped string. I.e. ti should be
	 * directly usable in a regex.
	 * @param text The text that you want to check for comments.
	 * @param singleLineToken The token used for single line comments, e.g. "//".
	 * @param blockStartToken The token used for the start of a block comment, e.g. "/*".
	 * @param blockEndToken The token used for the end of a block comment, e.g. "/*".
	 * @returns 'undefined' if text ends inside a comment. Otherwise the text
	 * since the last comment termination is returned (or all text if there was
	 * no block comment at all).
	 */
	public static getSinceLastBlockComments(text: string, blockStartToken: string, blockEndToken: string): string | undefined {
		// First check for block comments.
		//const match = RegExp('(/\\*|\\*/)', 'gm').exec(text);
		let inComment = false;
		let index = 0;
		let match;
		const regex = new RegExp(`(?:${blockStartToken}|${blockEndToken})`, 'g');
		while ((match = regex.exec(text))) {
			// Check match and check toggling of start/end token.
			if (inComment) {
				// Search for comment-block end token
				if (match[0] === '*/') {
					inComment = false;
					// Calculate index after the comment end token
					index = match.index + match[0].length;
				}
			}
			else {
				// Search for comment-block start token
				if (match[0] === '/*') {	// NOSONAR
					inComment = true;
				}
			}
		}
		// Return undefined if inside a block comment
		if (inComment)
			return undefined;
		// Other wise return whole text or text starting at the last block comment termination.
		if (index !== 0)
			text = text.substring(index);
		return text;
	}
}
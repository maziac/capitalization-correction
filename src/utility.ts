
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


	/** The function checks if a given language ID or file extension is included
	 * in a comma-separated string.
	 * @param docLangId E.g. "javascript"
	 * @param docFileExtension E.g. ".txt"
	 * @param commaSepString E.g. "markdown,.txt". A mix of language Ids and
	 * file extensions, separated by a comma. Or 'undefined'.
	 * @returns a boolean value indicating whether the given `docLangId` or
	 * `docFileExtension` are found in the `commaSepString`.
	 */
	public static contains(docLangId: string, docFileExtension: string, commaSepString: string | undefined): boolean {
		let found = false;
		if (commaSepString) {
			// Check includes:
			const wrappedString = `,${commaSepString},`;
			// Check for language ids and file extensions
			if (/,\*,/.test(wrappedString)
				|| RegExp(`,${docLangId},`).test(wrappedString)
				|| (docFileExtension && RegExp(`,\\${docFileExtension},`).test(wrappedString))) {
				found = true;
			}
		}
		return found;
	}
}
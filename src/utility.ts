
export class Regexes {
	static regexLetter = /[\p{Lu}\p{Ll}]/u;

	/** Checks if text is no letter. Upper or lower case.
	 * @returns true if not. Also returns true if length of text is not 1.
	 */
	public static isNoLetter(text: string): boolean {
		if (text.length !== 1) return true;
		const match = text.match(/[\p{Lu}\p{Ll}]/u);
		return (match === null);
	}
}
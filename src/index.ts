import * as readline from 'readline';
import * as fs from 'fs';

export class Trie {
    /**
     * The value of this particular node
     */
    private _value: string;

    /**
     * This node's children
     */
    private _children: Map<string, Trie>;

    /**
     * The parent node - used when we traverse back to the root node to calculate the string that this node represents
     */
    private _parent: Trie;

    /**
     * Whether or not the string represented by this node forms a valid word
     */
    private _isEndOfWord: boolean;

    /**
     * Create a new trie, optionally specifying a value for the root node, as well as the parent to which this belongs
     * @param value
     */
    constructor(value = '', parent?: Trie) {
        this._value = value;
        this._children = new Map();
        this._parent = parent || null;
        this._isEndOfWord = false;
    }

    /**
     * Add a word to this trie
     * @param value
     */
    public addValue(value: string): Trie {
        // Traverse down the trie from the root, adding entries for each letter in the word if it does not already exist
        let currentNode: Trie = this;
        for (const letter of value.split('')) {
            if (!currentNode.children.has(letter)) {
                const newChildNode = new Trie(letter, currentNode);
                currentNode.children.set(letter, newChildNode);
            }

            currentNode = currentNode.children.get(letter);
        }

        currentNode.isEndOfWord = true;

        return this;
    }

    /**
     * Traverse the trie back to the root to find out which word this node represents
     */
    public pathFromRoot(): string {
        // If we are at the root node, return its value
        if (!this.parent) {
            return this.value;
        }

        return this.parent.pathFromRoot() + this.value;
    }

    /**
     * Find all words that can be made with the given letters
     * @param letters
     */
    private searchWithoutWildcards(letters: string): string[] {
        const results = [];

        if (this.isEndOfWord) {
            results.push(this.pathFromRoot());
        }

        // If the same letter is present in the search term multiple times, there is no need to traverse the associated child element again
        const lettersAlreadyVisited = new Set();

        // For each letter available, we visited the associated child node (if it exists) and recursively search that, with that letter removed from the search term
        for (const letter of letters) {
            if (lettersAlreadyVisited.has(letter)) {
                continue;
            }

            if (this.children.has(letter)) {
                results.push(...this.children.get(letter).search(letters.replace(letter, '')));
            }

            lettersAlreadyVisited.add(letter);
        }

        return results;
    }

    /**
     * Find all words that can be made with the given letters and a certain number of wildcards
     * @param letters
     * @param numWildcards
     */
    public search(letters: string, numWildcards?: number): string[] {
        // The case of no wildcards can be handled more efficiently so we offload that to its own function
        if (!numWildcards) {
            return this.searchWithoutWildcards(letters);
        }

        const results = [];

        if (this.isEndOfWord) {
            results.push(this.pathFromRoot());
        }

        // We traverse each child of this node, and recursively search each. If we're searching in a node that
        // represents one of the letters in the search term, we use that letter (as there's no point in "wasting" a wildcard
        // to represent a letter we do have), otherwise we use one of the available wildcards
        for (const [letter, child] of this.children) {
            if (letters.includes(letter)) {
                results.push(...child.search(letters.replace(letter, ''), numWildcards));
            }
            else {
                results.push(...child.search(letters, numWildcards - 1));
            }
        }

        return results;
    }

    get value(): string {
        return this._value;
    }
    get children(): Map<string, Trie> {
        return this._children;
    }
    get parent(): Trie {
        return this._parent;
    }
    get isEndOfWord(): boolean {
        return this._isEndOfWord;
    }
    set parent(parent: Trie) {
        this._parent = parent;
    }
    set isEndOfWord(isEndOfWord: boolean) {
        this._isEndOfWord = isEndOfWord;
    }

    /**
     * Create a trie from an array of words
     * @param words
     */
    static fromWordList(words: string[]): Trie {
        const trie = new Trie();
        for (const word of words) {
            trie.addValue(word);
        }

        return trie;
    }

    /**
     * Create a trie from a file, each word separated by a newline
     * @param filePath
     */
    static async fromFile(filePath: string): Promise<Trie> {
        const trie = new Trie();

        const readInterface = readline.createInterface({
            input: fs.createReadStream(filePath)
        });
        for await (const line of readInterface) {
            trie.addValue(line);
        }

        return trie;
    }
}
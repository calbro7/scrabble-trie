# scrabble-trie
A word list storage and searching mechanism for Scrabble-like games, using the trie data structure. Provides easy searching of a dictionary to find words which can be made from certain letters, with any number of wildcard (or "blank") letters.

## About tries
[The Wikipedia article on tries](https://en.wikipedia.org/wiki/Trie) is a good place to start if one is unfamiliar with the trie data structure.

## Creating a trie
There are three ways to create a trie object.

By calling the constructor manually, and then populating the values:

    const trie = new Trie();
    trie.addValue('foo');
    trie.addValue('bar');

alternatively, by calling the static fromWordList method:

    const trie = Trie.fromWordList(['foo', 'bar']);

finally, if there is a list of words stored in a file, separated by newlines, the (async) static fromFile method may be used:

    const trie = await Trie.fromFile('/path/to/file.txt');

## Searching a trie
### Basic searching

    const trie = Trie.fromWordList(['foo', 'food', 'foods', 'bar']);
    trie.search('food'); // ['foo', food']

### Searching with wildcards

    const trie = Trie.fromWordList(['foo', 'food', 'foods', 'bar']);

    // search with the letters "food", plus one wildcard
    trie.search('food', 1); // ['foo', 'food', 'foods']
    
    // search with no letters, but three wildcards
    trie.search('', 3); // ['foo', 'bar']
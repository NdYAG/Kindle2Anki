# Export Kindle Vocabulary Builder to Anki APKG

ATTENTION!!!
If you encounter trouble running the script, try using nodejs v10.0 version, then remove node_modules folder and try again. It worked for me, hope it will work for you as well.
Also if dict.db file is empty (weights around 8KB), or despite taking some more space Anki flashcards are deprived of definitions from the dictionary of your choice, then open the .rawml file and createDictDatabase.js, find what separates definitions (for me it was opening h2 tag), and also look what is after the word, for me it was (no surprise) closing h2 tag. Then change the values in createDictDatabase.js file for those which suits your needs.

![](./kindle_anki.png)

[Vocabulary Builder](https://www.amazon.com/gp/help/customer/display.html?nodeId=201733850) is one of my favorite features on Kindle. With a tap on the word, it pops up a window displaying definitions and at the same time creates a flashcard in the background. What's more, it saves the sentences where the word appreares, which makes it easier to remember words. However, E-Ink is not ideal for frequent paging, and it seems that Vocabulary Builder doesn't have an algorithm on tracking forgeting curve.

This script helps to export Vocabulary Builder word list into an Anki apkg file.

```shell
npm install
node Kindle2Anki.js --vocab vocab.db --dict dict.rawml
```

1.  Find `vocab.db` located in `/[Kindle Volumn]/system/vocabulary/vocab.db`
2.  Find the dictionary file in Kindle, for example `/[Kindle Volumn]/documents/现代汉英词典_B00771V9HS.azw`
3.  Use [libmobi](https://github.com/bfabiszewski/libmobi) to export dictionary into a `rawml` format file (usually the dictionary file has DRM by Amazon, and keep in mind that libmobi and DeDRM is only for personal usages under such condition)
4.  Run the command above.

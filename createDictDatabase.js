const path = require('path')
const Database = require('better-sqlite3')
const cheerio = require('cheerio')
const { createReadStream } = require('fs')
const { Separator } = require('./separator')

const doubleQuote = str => str.replace(/'/g, "''")

function createDictDatabase({ input: rawml, output: database }) {
  return new Promise((resolve, reject) => {
    const db = new Database(database)
    db.exec('CREATE TABLE dictionary(word text, meaning text)')

    const src = createReadStream(rawml)
    src
      .pipe(new Separator({ separator: '<hr/>' }))
      .on('data', chunk => {
        let html = chunk.toString().trim()
        let $ = cheerio.load(html)
        let $word = $('word')
        if (!$word.length) {
          return
        }

        let words = $word
          .map((_, word) => {
            word = $(word)
            word.find('sup').remove()
            return word.text().replace(/,?\s*$/, '')
          })
          .get()

        const sql = `INSERT INTO dictionary (word, meaning) VALUES (
          '${doubleQuote(words.join('|'))}',
          '${doubleQuote(html)}')`
        db.exec(sql)
      })
      .on('end', () => {
        console.log('Dictionary saved in dict.db.')
        db.close()
        resolve()
      })
  })
}

module.exports = {
  createDictDatabase
}

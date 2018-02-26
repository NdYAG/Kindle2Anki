const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const cheerio = require('cheerio')
const { createReadStream } = require('fs')
const { Separator } = require('./separator')

function createDictDatabase({ input: rawml, output: database }) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(database, (err) => {
      if (err) {
        return reject(`CREATING DATABASE ERROR: ${err.message}`)
      }
      console.log('Database for dictionary dict.db created.')
    })


    db.run('CREATE TABLE dictionary(word text, meaning text)', (err) => {
      if (err) {
        return reject(`CREATE TABLE ERROR: ${err.message}`)
      }

      const src = createReadStream(rawml)

      src.pipe(new Separator({ separator: '<hr/>' })).on('data', (chunk) => {
        let html = chunk.toString().trim()
        let $ = cheerio.load(html)
        let $word = $('word')
        if (!$word.length) { return }

        let words = $word.map((_, word) => {
          word = $(word)
          word.find('sup').remove()
          return word.text().replace(/,?\s*$/, '')
        }).get()

        const sql = `INSERT INTO dictionary (word, meaning) VALUES (?, ?)`

        db.run(sql, words.join('|'), html, (err) => {
          if (err) {
            return reject(`INSERT ERROR: ${err.message}`)
          }
        })
      }).on('end', () => {
        console.log('Dictionary saved in dict.db.')
        db.close()
        resolve()
      })
    })
  })
}

module.exports = {
  createDictDatabase
}

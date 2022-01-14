const readline = require('readline')
const Database = require('better-sqlite3')
const ProgressBar = require('progress')
const { APKG } = require('anki-apkg')

const query = (dictdb, word) => {
  const entries = dictdb
    .prepare(
      `SELECT meaning FROM dictionary WHERE word = (?) OR word LIKE (?) OR word LIKE (?)`
    )
    .all(word, `${word}|%`, `%|${word}`)
  return entries
    .map(entry => {
      return `<div class="meaning">${entry.meaning}</div>`
    })
    .join('')
}

const createAPKG = ({ vocab, dict }) => {
  const SQL_LOOKUPS = `
    select WORDS.stem, WORDS.word, LOOKUPS.usage, LOOKUPS.timestamp
    from LOOKUPS left join WORDS
    on WORDS.id = LOOKUPS.word_key
    left join BOOK_INFO
    on BOOK_INFO.id = LOOKUPS.book_key
    where BOOK_INFO.title = (?)
    `

  const db = new Database(vocab)
  const rows = db.prepare('SELECT title from BOOK_INFO').all()
  rows.forEach((row, i) => {
    console.log(`[${i + 1}]`, row.title)
  })
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question(
    "Select the book you'd like to export (input number):",
    answer => {
      answer = Number(answer)
      if (answer < 0 || answer > rows.length) {
        return
      }

      const title = rows[answer - 1].title
      const dictdb = new Database(dict)
      const lookups = db.prepare(SQL_LOOKUPS).all(title)
      const apkg = new APKG({
        name: title,
        card: {
          fields: ['word', 'meaning', 'usage'],
          template: {
            question: '<h2>{{word}}</h2><p><i>{{usage}}</i></p>',
            answer: `
              <div class="word"><h2>{{word}}</h2></div>
              <div class="meaning">{{meaning}}</div>
              <div class="usage">{{usage}}</div>
              <style>
              .meaning{
                text-align:left;
              }
              </style>
            `
          }
        }
      })

      const progress = new ProgressBar(':bar :percent', {
        total: lookups.length
      })

      lookups.forEach(lookup => {
        let { stem, word, usage, timestamp } = lookup
        let meaning = query(dictdb, stem)
        usage = usage.replace(word, `<strong>${word}</strong>`)
        apkg.addCard({
          timestamp,
          content: [stem, meaning, usage]
        })
        progress.tick()
      })

      apkg.save(__dirname)
      rl.close()
      console.log(`${title}.apkg created.`)
    }
  )
}

module.exports = {
  createAPKG
}

export const INSERT = 'INSERT INTO ARTICLES VALUES(?, ?, ?, ?, ?)'
export const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS articles (
  _id TEXT PRIMARY KEY,
  category TEXT,
  title TEXT,
  desc TEXT,
  pubdate DATE
)`
export const SELECT_NEWEST = 'SELECT _id FROM articles ORDER BY pubdate LIMIT 1'

import { parseString } from 'xml2js'

export default function<T>(text: string): Promise<T> {
  return new Promise((res, rej) => {
    parseString(text, (err, obj: T) => {
      if (err) rej(err)
      res(obj)
    })
  })
}

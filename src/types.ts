export interface IArticleType {
  author: string[]
  category: string[]
  title: string[]
  link: string[]
  guid: string[]
  description: string[]
  pubDate: string[]
}

export interface IRSSType {
  rss: {
    channel: Array<{
      item: IArticleType[]
    }>
  }
}

import Axios from 'axios'
import Sqlite from 'better-sqlite3'
import Moment from 'moment'
import Xml2Js from './Xml2Obj'
import * as Queries from './queries'
import { IRSSType, IArticleType } from './types'
import TgBot from './tgbot'

class App {
  private db: Sqlite.Database
  private tgBot: TgBot
  private blogId: string
  private processedArticles: string[] = []
  constructor(blogId: string) {
    this.blogId = blogId
    this.db = Sqlite('rss.db')
    this.tgBot = new TgBot()
  }

  private parseTimeFromString(s: string): Moment.Moment {
    return Moment(s, '%a, %d %b %Y %H:%M:%S %z')
  }

  private articleIdFromArticle(article: IArticleType): string {
    return article.link[0].split('/').pop()!
  }

  private articleIdsFromArticles(articles: IArticleType[]): string[] {
    return articles.map(
      ((item: IArticleType) => this.articleIdFromArticle(item)).bind(this)
    )
  }

  private createMessageString(article: IArticleType): string {
    return `${article.link}\n${article.title}\n${article.description}`
  }

  private addArticleToDB(article: IArticleType) {
    const params = [
      this.articleIdFromArticle(article),
      article.title,
      article.category,
      article.description,
      this.parseTimeFromString(article.pubDate[0]).format(
        'YYYY-MM-DD HH:mm:ss'
      ),
    ]
    const stmt = this.db.prepare(Queries.INSERT)
    stmt.run(...params)
  }

  private async publishArticle(article: IArticleType) {
    console.log(this.articleIdFromArticle(article) + ':' + article.description)
    if (article.category[0] === '나의 포토이야기') return
    await this.tgBot.sendMessage(this.createMessageString(article))
    this.addArticleToDB(article)
    this.processedArticles.push(this.articleIdFromArticle(article))
  }

  private async fetchArticles(): Promise<IArticleType[]> {
    const xmlRequest = await Axios.get(
      `https://rss.blog.naver.com/${this.blogId}.xml`
    )
    const xmlObj = await Xml2Js<IRSSType>(xmlRequest.data)
    return xmlObj.rss.channel[0].item
  }

  private async fetchNewestFirst() {
    const articles = await this.fetchArticles()
    const articleIds = this.articleIdsFromArticles(articles)
    const stmt = this.db.prepare(Queries.SELECT_NEWEST)
    const row: { _id: string } | undefined | null = stmt.get()
    console.log(row)
    if (row && articleIds[0] === row._id) {
      this.processedArticles.push(articleIds[0])
    } else {
      await this.publishArticle(articles[0])
    }
  }

  private async periodicallyFetch() {
    const articles = await this.fetchArticles()
    const articleIds = this.articleIdsFromArticles(articles)

    const latestProcessedArticleId = this.processedArticles[0]
    if (articleIds[0] !== latestProcessedArticleId) {
      articles
        .slice(articleIds.indexOf(latestProcessedArticleId) + 1)
        .forEach(async (item: IArticleType) => {
          await this.publishArticle(item)
        })
    }
  }

  public async run() {
    const stmt = this.db.prepare(Queries.CREATE_TABLE)
    stmt.run()

    await this.fetchNewestFirst()
    setInterval(this.periodicallyFetch.bind(this), 10 * 1000)
  }
}

export default App

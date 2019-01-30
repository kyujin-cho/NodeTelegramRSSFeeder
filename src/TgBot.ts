import TelegramBot from 'node-telegram-bot-api'
import * as Secrets from './secrets'

class TgBot {
  private bot: TelegramBot
  constructor() {
    this.bot = new TelegramBot(Secrets.TOKEN, { polling: true })
    this.bot.on('message', this.onMessage)
  }

  private onMessage(msg: TelegramBot.Message) {
    console.log(
      `${msg.text || '[Object]'} from ${msg.from!.last_name || ''} ${msg.from!
        .first_name || ''} (${msg.from!.username || ''}) # ${msg.from!.id}`
    )
  }

  public async sendMessage(msg: string): Promise<TelegramBot.Message> {
    return this.bot.sendMessage(Secrets.CHAT_ID, msg)
  }
}

export default TgBot

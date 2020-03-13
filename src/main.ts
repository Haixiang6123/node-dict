import * as https from 'https'
import * as querystring from 'querystring'
import md5 = require('md5')
import {appId, secret} from './key'

export const translate = (word) => {
  const salt = Math.random()
  const sign = md5(appId + word + salt + secret)

  const query: string = querystring.stringify({
    q: word,
    from: 'en',
    to: 'zh',
    appid: appId,
    salt,
    sign
  })

  const options = {
    hostname: 'api.fanyi.baidu.com',
    port: 443,
    path: '/api/trans/vip/translate?' + query,
    method: 'GET'
  }

  const request = https.request(options, (response) => {
    let chunks = []
    response.on('data', (chunk) => {
      chunks.push(chunk)
    })
    response.on('end', () => {
      const string = Buffer.concat(chunks).toString()
      type BaiduResult = {
        error_code?: string
        error_msg?: string
        from: string
        to: string
        trans_result: { src: string; dst: string }[]
      }
      const object: BaiduResult = JSON.parse(string)

      // 报错
      if (object.error_code) {
        console.error(object.error_msg)
        process.exit(2)
      } else {
        console.log(object.trans_result[0].dst)
        process.exit(0)
      }
    })
  })

  request.on('error', (e) => {
    console.error(e)
  })
  request.end()
}

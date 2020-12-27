const fetch = require('isomorphic-fetch')
const baseUrl = 'http://localhost:3000/api/todos'

//asyncはグローバルでは実行できないので、いったん関数化してから実行する。即時実行の書き方もあるけど可読性は低め。

//正常URL、POST
// async function main() {
//   for (const title of ['ネーム','下書き']) {
//     const res = await fetch(baseUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({title})
//     })
//     const result = await res.json() //isomorphic-fetchは、json()も非同期関数
//     console.log(res.status, 'result', result)
//   }
// }

//titleなし
async function main() {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: '{}'
  })
  const result = await res.json() //isomorphic-fetchは、json()も非同期関数
  console.log(res.status, 'result',result)
}

main()
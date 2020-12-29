const fetch = require('isomorphic-fetch')
const baseUrl = 'http://localhost:3000/api/todos'

//asyncはグローバルでは実行できないので、いったん関数化してから実行する。即時実行の書き方もあるけど可読性は低め。

//正常URL、GET
async function main() {
  const res = await fetch('http://localhost:3000/api/todos?completed=false')//クエリあり
  // const res = await fetch(baseUrl)
  const result = await res.json() //isomorphic-fetchは、json()も非同期関数
  console.log(res.status, 'result', result)
}

main()


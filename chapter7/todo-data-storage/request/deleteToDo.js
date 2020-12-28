const fetch = require('isomorphic-fetch')
const baseUrl = 'http://localhost:3000/api/todos'

//asyncはグローバルでは実行できないので、いったん関数化してから実行する。即時実行の書き方もあるけど可読性は低め。

//IDを指定して、ToDoをDELETE
async function main() {
  // const res = await fetch(`${baseUrl}/4`,{method: 'DELETE'}).then(res => res.status)
  await fetch(`${baseUrl}/2354c7d0-937f-4739-a56b-2dcfbcfc5120`,{method: 'DELETE'}).then(res => console.log(res.status))  
}


main()
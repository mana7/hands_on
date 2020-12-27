const fetch = require('isomorphic-fetch')
const baseUrl = 'http://localhost:3000/api/todos'

//asyncはグローバルでは実行できないので、いったん関数化してから実行する。即時実行の書き方もあるけど可読性は低め。

//ID指定で、ToDoを完了(completedの値を変更する)
// PUTで、completedをtrueに変更
async function main() {
  // console.log('hoge',`${baseUrl}/${_[0].id}/completed`)
  const res = await fetch(`${baseUrl}/5f575b11-ed23-4007-a03f-760c2eab52dc/completed`,{method: 'PUT'})
  const result = await res.json() //isomorphic-fetchは、json()も非同期関数
  console.log(res.status, 'result', result)
}

//DELETEで、completedをfalseに変更
// async function main() {
//   const res = await fetch(`${baseUrl}/1/completed`,{method: 'DELETE'})
//   const result = await res.json() //isomorphic-fetchは、json()も非同期関数
//   console.log(res.status, 'result', result)
// }


main()
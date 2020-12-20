const fetch = require('node-fetch')
const baseUrl = 'http://localhost:3000/api/todos'

//asyncはグローバルでは実行できないので、いったん関数化してから実行する。即時実行の書き方もあるけど可読性は低め。

//正常URL、GET
// async function main() {
//   // const res = await fetch('http://localhost:3000/api/todos?completed=true')//クエリあり
//   const res = await fetch(baseUrl)
//   const result = await res.json() //isomorphic-fetchは、json()も非同期関数
//   console.log(res.status, 'result', result)
// }

//正常URL、POST
// async function main() {
//   const res = await fetch('http://localhost:3000/api/todos', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({title: "出版"})
//   })
//   const result = await res.json() //isomorphic-fetchは、json()も非同期関数
//   console.log(res.status, 'result', result)
// }

//ID指定で、ToDoを完了(completedの値を変更する)
// PUTで、completedをtrueに変更
// async function main() {
//   const res = await fetch(`${baseUrl}/2/completed`,{method: 'PUT'})
//   const result = await res.json() //isomorphic-fetchは、json()も非同期関数
//   console.log(res.status, 'result', result)
// }

//DELETEで、completedをfalseに変更
// async function main() {
//   const res = await fetch(`${baseUrl}/1/completed`,{method: 'DELETE'})
//   const result = await res.json() //isomorphic-fetchは、json()も非同期関数
//   console.log(res.status, 'result', result)
// }

//IDを指定して、ToDoをDELETE
async function main() {
  // const res = await fetch(`${baseUrl}/4`,{method: 'DELETE'}).then(res => res.status)
  await fetch(`${baseUrl}/6`,{method: 'DELETE'}).then(res => console.log(res.status))  
}


//URL間違い
// async function main() {
//   const res = await fetch('http://localhost:3000/api/foo')
//   const result = await res.text() //isomorphic-fetchは、text()も非同期関数
//   console.log(res.status, 'result', result)
// }


//bodyなしPOST
// async function main() {
//   const res = await fetch('http://localhost:3000/api/todos', {
//     method: 'POST',
//   })
//   const result = await res.json() //isomorphic-fetchは、json()も非同期関数
//   console.log(res.status, 'result', result)
// }

main()


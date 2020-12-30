const fs = require('fs')

function writeTodosToCsv (file, todos) {
  return fs.promises.writeFile(file, `id,title,completed\n${todos.map(
    ({id, title, completed}) => `${id},${title},${completed}`
  ).join('\n')}`)
}

async function main() {
  const todos = [
    {id: '1', title: 'ネーム', completed: false},
    {id: '2', title: '下書き', completed: false}
  ]
  await writeTodosToCsv('todos.csv', todos)
  console.log(await fs.promises.readFile('todos.csv', 'utf8'))
} 

main()
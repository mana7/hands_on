const fs = require('fs')

async function parseTodosFromCsv (file) {
  const content = await fs.promises.readFile(file, 'utf8')
  const [propsLine, ...todoLines] = content.split(/\n/) //一つ目の改行で、先頭行とそれ以降に分けて配列化
  const props = propsLine.split(',') //キー名に当たる行をカンマ区切りで配列化

  return todoLines.map(line => { //todoの行(配列要素1つずつ)それぞれ、key:value のオブジェクト化する
    const values = line.split(',')
    const todo = {}　//todoオブジェクトを空でいったん用意する
    for (let i = 0; i < props.length; i++){
      todo[props[i]] = props[i] === 'completed'
        ? values[i] === 'true' //completedの値については、trueかどうかの判定結果(true / false)を設定する
        : values[i] //completed以外は、valuesの値をそのまま設定する
    }
    return todo
  })
}

async function main() {
  const result = await parseTodosFromCsv('todos.csv')
  console.log('result',result)
} 

main()
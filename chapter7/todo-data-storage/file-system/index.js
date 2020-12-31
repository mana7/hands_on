const { extname } = require('path') //拡張子を取得する
const { readdir, readFile, writeFile, unlink } = require('fs').promises //unlinkは、ファイルの削除

exports.fetchAll = async() => {
  //同一ディレクトリ内に存在するファイルをすべて取得
  const files = (await readdir(__dirname))
    .filter(file => extname(file) === '.json')
  return Promise.all(
    files.map(file => 
      readFile(`${__dirname}/${file}`, 'utf8').then(JSON.parse))
  )
}

exports.fetchByCompleted = (completed) => {
  return exports.fetchAll()
  .then(all => all.filter(todo => todo.completed === completed))
}

exports.create = (todo) => {
  return writeFile(`${__dirname}/${todo.id}.json`, JSON.stringify(todo))
}

exports.update = async (id, update) => {
  const fileName = `${__dirname}/${id}.json`
  return readFile(fileName, 'utf8').then(
    content => {
      const todo = JSON.parse(content)
      if(update.title) {
        todo.title = update.title }
      else {todo.completed = update.completed}
      console.log('update',update)
      console.log('todo',todo)
      return writeFile(fileName, JSON.stringify(todo)).then(() => todo)
    },
    //ファイルが存在しない場合にはnullを返し、それ以外はそのままエラーにする
    err => err.code === 'ENOENT' ? null : Promise.reject(err)
  )
}

exports.remove = (id) => {
  return unlink(`${__dirname}/${id}.json`) //todoの削除実装のため、todoのファイルを削除する
  .then(
    () => id,
    //ファイルが存在しない場合はnullを返し、それ以外はそのままエラーにする
    err => err.code === 'ENOENT' ? null : Promise.reject(err)
  )
}
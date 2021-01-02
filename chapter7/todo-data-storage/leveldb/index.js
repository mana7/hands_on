const level = require('level')
const { join } = require('path')
//同じディレクトリ内のleveldbディレクトリにデータベースの状態を保存
const db = level(join(__dirname, 'leveldb'))

exports.fetchAll = async () => {
  const result = []
  for await (const v of db.createValueStream({ gt: 'todo:', lt: 'todo;' })) {
    result.push(JSON.parse(v))
  }
  return result
}
// db.createReadStream / createValueStreamは全てのデータを取得するので、todo: より後、todo;より前のキー範囲を指定する

exports.fetchByCompleted = async completed => {
  const promises = []
  for await (const id of db.createValueStream({
    //セカンダリインデックスの検索 
    //completedの真偽によって検索するため、todo-completed-true / false がキー、idが値のデータを登録しておく
    gt: `todo-completed-${completed}:`,
    lt: `todo-completed-${completed};`
  })) {
    promises.push(
      db.get(`todo:${id}`).then(value => JSON.parse(value))
    )
  }
  return Promise.all(promises)
}


//DBの処理実行が全て成功しないと整合性を保てないため、バッチ実行を利用する

// exports.create = todo => db.batch() //バッチ更新で、複数の処理を実行できる
//   //todoの保存
//   .put(`todo:${todo.id}` , JSON.stringify(todo))
//   //セカンダリインデックスの保存
//   .put(`todo-completed-${todo.completed}:${todo.id}`, todo.id)
//   .write() //バッチ更新の実行

exports.create = todo => db.batch()
  // ToDoの保存
  .put(`todo:${todo.id}`, JSON.stringify(todo))
  // 二次インデックスの保存
  .put(`todo-completed-${todo.completed}:${todo.id}`, todo.id)
  .write()

exports.update = (id, update) => 
  db.get(`todo:${id}`).then(
    content => {
      const oldTodo = JSON.parse(content) //JSONを読み込む。オブジェクトに変換
      const newTodo = {
        ...oldTodo,
        ...update //updateする部分をoldTodoに対し上書き
      }
      let batch = db.batch().put(`todo:${id}`, JSON.stringify(newTodo)) //JSONに変換
      //completedの値が変化したときは、セカンダリインデックスも操作する
      if(oldTodo.completed !== newTodo.completed) {
        batch = batch
          .del(`todo-completed-${oldTodo.completed}:${id}`)
          .put(`todo-completed-${newTodo.completed}:${id}`, id)
      }
      return batch.write().then(() => newTodo)
    },
    //ToDoが存在しない場合はnullを返し、それ以外はそのままエラーにする
    err => err.notFound ? null : Promise.reject(err)
  )


exports.remove = id =>
  db.get(`todo:${id}`).then(
    content => db.batch()
      .del(`todo:${id}`)
      .del(`todo-completed-true:${id}`) //処理中にcompletedの値が変化している可能性があるため、true
      .del(`todo-completed-false:${id}`) //falseどちらも対象にdelを実行する
      .write()
      .then(() => id),
    //ToDoが存在しない場合はnullを返し、それ以外はそのままエラーにする
    err => err.notFound ? null : Promise.reject(err)
  )
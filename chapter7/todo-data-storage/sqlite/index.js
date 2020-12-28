const {promisify} = require('util')
const {join} = require('path')
const sqlite3 = process.env.NODE_ENV === 'production'
  ? require('sqlite3')
  //production環境以外は冗長モードを利用
  : require('sqlite3').verbose()

//todo-data-storage/sqlite/sqliteというファイルにデータベースの状態を保存
const db = new sqlite3.Database(join(__dirname, 'sqlite'))

//コールバックパターンのメソッドをPromise化
const dbGet = promisify(db.get.bind(db))
const dbRun = function(){
  return new Promise((resolve,reject) =>
    db.run.apply(db, [
      ...arguments,
      function(err){
        err ? reject(err) : resolve(this)
      }
    ])
  )
}

const dbAll = promisify(db.all.bind(db))

//作成済みでなければテーブルを作成するcreate table文を記述
dbRun(`CREATE TABLE IF NOT EXISTS  todo (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL
)`).catch(err => {
  //テーブル作成に失敗した場合はアプリケーションを終了
  console.error(err)
  process.exit(1)
})

//app.jsから実行される各メソッドを実装する

//データベースのデータをToDoオブジェクトに変換する関数を作成
function rowToToDo(row) {
  return {...row, completed: !!row.completed}　//!を2つで、booleanにする
}


exports.fetchAll = () =>
  dbAll('SELECT * FROM todo').then(rows => rows.map(rowToToDo))


//completedの値で絞り込み
exports.fetchByCompleted = completed =>
  dbAll('SELECT * FROM todo WHERE completed = ?',completed)
    .then(rows => rows.map(rowToToDo))

//INSERT文の実行
//async関数の中でreturnを付けずにawait dbRun()を実行することでdbRunの結果が返却されないようにする
exports.create = async todo => {
  await dbRun(
    'INSERT INTO todo VALUES (?,?,?)',
    todo.id,
    todo.title,
    todo.completed
  )
}

//updateの実装
exports.update = (id,update) => {
  const setColumns = []
  const values = []
  for(const column of ['title', 'completed']) {
    if(column in update) {
      setColumns.push(`${column} = ?`)
      values.push(update[column])
    }
  }
  values.push(id)

  return dbRun(`UPDATE todo SET ${setColumns.join()} WHERE id = ?`, values)
    .then(({changes}) => changes === 1
      ? dbGet('SELECT * FROM todo WHERE id = ?', id).then(rowToToDo)
      : null
    )
}

//deleteの実装
exports.remove = id => dbRun('DELETE FROM todo WHERE id = ?', id)
  .then(({changes}) => changes === 1 ? id : null)

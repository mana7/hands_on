const {promisify} = require('util') //Promiseインスタンスを返却するようにするメソッド
const {join} = require('path') //パスを連結するメソッド
const User = require('../models/user')

const sqlite3 = process.env.NODE_ENV === 'production'
  ? require('sqlite3')
  //production環境以外は冗長モードを利用(デバッグ用の情報も出力される)
  : require('sqlite3').verbose()

const db = new sqlite3.Database(join(__dirname, 'sqlite'))

//sqlite3の非同期処理がコールバックなので、扱いやすいようにPromiseインスタンス返すよう変換
//await dbAll('SELECT ...')のように、SQL文を中で実行して使う
const dbGet = promisify(db.get.bind(db)) //SELECT文で使う
const dbAll = promisify(db.all.bind(db)) //SELECT文で使う
const dbRun = function(){ //SELECT文以外で使う
  return new Promise((resolve,reject) => {
    db.run.apply(db, [
      ...arguments,
      function(err){
        err ? reject(err) : resolve(this)
      }
    ])
  })
}

//usersというテーブルを作る
dbRun(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  familyName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  job TEXT NOT NULL,
  manager BOOLEAN NOT NULL
)`).catch(err => {
  //テーブル作成に失敗した場合はアプリケーションを終了
  console.error(err)
  process.exit(1)
})

//ここでもモデルを使用し、userを返すことがわかりやすいようにする
function rowToUserdata(row){
  return new User({...row, manager: !!row.manager})
}

//dbAll(db.all)は、実行結果が配列で返ってくるので、mapが使える
//dbGet(db.get)は、配列ではなくオブジェクト単体で返ってくる
exports.fetchAll = () => {
  return dbAll('SELECT * FROM users').then(rows => rows.map(rowToUserdata))
}

//idでuserdataを抽出。
//dbGetであれば1データしかヒットしないが、
//他の関数と構成を揃えた方がわかりやすいので、idでの抽出でも、あえてdbAllを利用する。

exports.fetchById = id => {
  // console.log('id',id)
  return dbAll('SELECT * FROM users WHERE id = ?',id)
    .then(rows => {
      return rows.map(row => rowToUserdata(row)) //map処理対象の要素がなければ、そのまま空配列が返る
    })
}

//job名で絞り込み
exports.fetchByJob = job => {
  return dbAll('SELECT * FROM users WHERE job = ?',job)
    .then(rows => rows.map(rowToUserdata))
}

exports.create = async userdata => {
  await dbRun( //insert成功時に、生成したuserdataが返却されるわけではないので、returnは付けず結果が返らないようにする
    'INSERT INTO users VALUES (?,?,?,?,?)',
    userdata.id,
    userdata.familyName,
    userdata.lastName,
    userdata.job,
    userdata.manager
  )
}

module.exports.update = (id,update) => {
  const setColumns = []
  const values = []

  for(const column of ['familyName', 'lastName', 'job', 'manager']) {
    if(column in update) {
      setColumns.push(`${column} = ?`)
      values.push(update[column])
    }
  }
  values.push(id) //where句で利用するため最後にidもpushしておく

  // console.log('setColumns',setColumns,'values',values)
  // console.log('req',`UPDATE users SET ${setColumns.join()} WHERE id = ?`, values)

  return dbRun(`UPDATE users SET ${setColumns.join()} WHERE id = ?`, values)
    .then(({changes}) => changes === 1
      ? dbAll('SELECT * FROM users WHERE id = ?', id).then(rows => rows.map(rowToUserdata))
      : null
    )
}

module.exports.remove = id => dbRun('DELETE FROM users WHERE id = ?', id)
.then(({changes}) => changes === 1 ? id : null)
const express = require('express')
const { v4: uuidv4 } = require('uuid')
//実行されたスクリプトの名前に応じてデータストレージの実装を使い分ける
//process.env.npm_lifecycle_eventには、
//プログラムがpackage.jsonに定義されたスクリプトから実行された場合にそのスクリプトが設定される
//スクリプト = requireするファイル名/ディレクトリ名となる
// const dataStorage = require(`./${process.env.npm_lifecycle_event}`)
const dataStorage = require(`./file-system`)

const app = express()

app.use(express.json())

//ToDo一覧の取得
app.get('/api/todos', (req,res,next) => {
  if(!req.query.completed){
    return dataStorage.fetchAll().then(todos => res.json(todos),next)
  }
  //completedクエリパラメータを指定された場合は、ToDoをフィルタリング
  const completed = req.query.completed === 'true'　//クエリパラメータがtrueならtrue,falseならfalseがcompletedにセットされる
  dataStorage.fetchByCompleted(completed).then(todos => res.json(todos),next)
})

//ToDoの新規登録
app.post('/api/todos', (req,res,next) => {
  const {title} = req.body
  // console.log('title',title)
  if(typeof title !== 'string' || !title) {
    //titleがリクエストに含まれない場合はステータスコード400(Bad Request)
    const err = new Error('title is required')
    err.statusCode = 400
    return next(err)
  }

  //ToDoの作成
  const todo = {id: uuidv4(), title, completed: false}
  // console.log('todo',todo)
  //ステータスコード201(Created)で結果を返す
  dataStorage.create(todo).then(() => res.status(201).json(todo), next)
})

//Completedの設定、解除の共通処理
function completedHandler(completed) {
  return(req,res,next) => {
    dataStorage.update(req.params.id, {completed})　//{completed: 変数completedの値}として生成される
    .then(todo => {
      if(todo){
        return res.json(todo)
      }
      const err = new Error('ToDo not found')
      err.statusCode = 404
      next(err)
    }, next)
  }
}

//ToDoのCompletedの設定、解除
app.route('/api/todos/:id/completed')
  .put(completedHandler(true))
  .delete(completedHandler(false))

//ToDoの削除
app.delete('/api/todos/:id', (req,res,next) => {
  dataStorage.remove(req.params.id).then(id => {
    if(id !== null){
      return res.status(204).end()
    }
    const err = new Error('ToDo not found')
    err.statusCode = 404
    next(err)
  }, next)
})

//エラーハンドリングミドルウェア
app.use((err,req,res,next) => {
  console.error(err)
  res.status(err.statusCode || 500).json({error: err.message})
})

module.exports = app.listen(3000)

//Next.jsによるルーティングのため追記↓
// const next = require('next')
// const dev = process.env.NODE_ENV !== 'production'
// const nextApp = next({dev})

// nextApp.prepare().then(
//   //pagesディレクトリ内の各Reactコンポーネントに対するサーバサイドルーティング
//   () => app.get('*', nextApp.getRequestHandler()),
//   err => {
//     console.log(err)
//     process.exit(1)
//   }
// )
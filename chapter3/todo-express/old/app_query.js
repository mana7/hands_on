const express = require('express')
let todos = [
  {id: 1, title: 'ネーム', completed: false},
  {id: 2, title: '下書き', completed: true}
]
const app = express()

//ToDo一覧の取得
app.get('/api/todos', (req,res) => {

  //true/false以外の値(想定しない値)のエラーハンドリングを実装するならば...

  // let input;
  // try {
  //   input = new Input(req.qeury)　//Inputというクラスを作っておき、constructorの中で、正当な値か判定する
  // } catch (e) {
  //   res.status(400) //エラーなら400を返す
  // }

  if(!req.query.completed){
    return res.json(todos)
  }
  //completedクエリパラメータを指定された場合は、ToDoをフィルタリング
  const completed = req.query.completed === 'true'　//クエリパラメータがtrueならtrue,falseならfalseがcompletedにセットされる
  res.json(todos.filter(todos => todos.completed === completed))
})
app.listen(3000)
const expresss = require('express')
const { v4: uuidv4 } = require('uuid')
const User = require('./models/user')

const dataStorage = require('./sqlite')
const app = expresss()
app.use(expresss.json()) //expressでJSONのリクエストを受付けるための記述(JSONをパースして受け取る)

//User一覧の取得
app.get('/api/user', (req,res,next) => {
  if(req.query.id){
    const id = req.query.id
    // console.log('id',id)
    return dataStorage.fetchById(id).then(users => {
      if (users.length === 0) {
        const err = new Error('user is not found');
        err.statusCode = 404;
        next(err);
      }
      res.json(users)
     } , next)
  }
  if(req.query.job){
    const job = req.query.job
    // console.log('job',job)
    return dataStorage.fetchByJob(job).then(users => res.json(users) , next)
  }
  dataStorage.fetchAll().then(users => res.json(users) , next)  
})

//User情報の新規登録
app.post('/api/user' , (req,res,next) => {
  const user = new User(req.body); //Userクラスのインスタンス生成
  try {
    //userに対する処理・バリデーションはtryの中に書く
    user.setId();
    user.validate();
  } catch(err) {
    err.statusCode = 400
    return next(err)     
  }
  dataStorage.create(user).then(() => res.status(201).json(user), next)
})

//User情報の更新
app.put('/api/user/:id', (req,res,next) => {
  const user = new User (Object.assign({},
    req.body,
    {
      id: req.params.id
    }
  )); //Userクラスのインスタンス生成
  try {
    user.validate();
  } catch(err) {
    err.statusCode = 400
    return next(err)     
  }

  dataStorage.update(req.params.id, user)
  .then(userdata => {
    if(userdata) {
      return res.status(200).json(user)
    }
    console.log('userdata',userdata)
    //updateの結果(changeがなく)nullが返ってきたらエラーを出力する
    const err = new Error('User not found')
    err.statusCode = 404
    next(err)
    } ,next)
})

//User情報の削除
app.delete('/api/user/:id', (req,res, next) => {
  dataStorage.remove(req.params.id).then(id => {
    if(id !== null){
      return res.status(204).end()
    }
    const err = new Error('User not found')
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
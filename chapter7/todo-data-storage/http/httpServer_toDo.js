const http = require("http")

const todos = [
  {id: 1, title: 'ネーム', completed: false},
  {id: 2, title: '下書き', completed: true}
]

//HTTPサーバの初期化
const server = http.createServer((req, res) => {
  //リクエストのURLやHTTPメソッドに応じて適切なレスポンスを返す
  if(req.url === '/api/todos'){
    if(req.method === 'GET'){
      //GETメソッドの場合、全todoをjson形式で返す
      res.setHeader('Context-Type', 'application/json')
      return res.end(JSON.stringify(todos))
    }
    //GET以外のHTTPメソッドはサポートしない為405(Method Not Allowed)
    res.statusCode = 405
  } else {
    //  api/todos以外のURLはないので404(Not Found)
    res.statusCode = 404
  }
  res.end()
}).listen(3000) //3000ポートでリクエストを待機。listen()の戻り値は、サーバインスタンスそのもの
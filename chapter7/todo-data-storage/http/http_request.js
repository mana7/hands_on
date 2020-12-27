const http = require("http")

//正常なリクエスト

// http.request('http://localhost:3000/api/todos',res => {
//   let responseData = '';
//   console.log('statusCode',res.statusCode);
//   res.on('data', chunk => responseData += chunk)
//   res.on('end', () => console.log('responseData',JSON.parse(responseData)))
// }).end()


//POSTでリクエスト

// http.request(
//   'http://localhost:3000/api/todos',
//   {method: 'POST'}, //指定しないと、デフォルトでGETになる
//   res => console.log('statusCode',res.statusCode)
// ).end()

//URLが適切でない
http.request(
  'http://localhost:3000/api/foo',
  res => console.log('statusCode',res.statusCode)
).end()
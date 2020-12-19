new Promise((resolve,reject)=>{
  resolve('foo')
  resolve('hoge')
  reject(new Error('エラー'))
}).then(
  result => console.log('OK',result),
  err => console.log('NG',err)
)
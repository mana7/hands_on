// Promise
//   .resolve('foo')
//   .finally(() => 
//     new Promise((resolve,reject) =>
//       setTimeout(() => {
//           console.log('finallyで1秒経過');
//           resolve()
//           //reject()
//         }, 1000
//       )
//     )
//   ).then(console.log)

Promise.resolve('foo').then(result => console.log('コールバック',result))
console.log('この行が先に実行される')
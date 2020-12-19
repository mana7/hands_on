function parseJSONAsync(json, callback) {
  setTimeout(() => {
    try {
      callback(null,JSON.parse(json))
   } catch (err) {
     callback(err)
   }
  } , 1000)
} 
// parseJSONAsync('不正なJSON', (err, result) =>
//   console.log('parse結果', err, result)
// )

module.exports.parseJSONAsync = parseJSONAsync;
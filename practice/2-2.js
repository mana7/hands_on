function parseJSONAsync(json){
  return new Promise((resolve,reject) => {
    setTimeout(() => {
      try {
        resolve(JSON.parse(json))
      } catch (err) {
        reject(err)
      }
    }, 1000)
  })
}

const parseJSONAsyncCache = {};
function parseJSONAsyncWithCache(json) {
  let cached = parseJSONAsyncCache[json];
  if(!cached) {
    cached = parseJSONAsync(json);
    parseJSONAsyncCache[json] = cached;
  }
  return cached;
}

parseJSONAsyncWithCache('{"message": "Hello", "to": "World"}')
  .then(result => console.log('1回目の結果',result))
  .then(() => {
    const promise = parseJSONAsyncWithCache('{"message": "Hello", "to": "World"}')
    console.log('2回目の呼び出し完了');
    return promise
  })
  .then(result => console.log('2回目の呼び出し結果', result))
console.log('1回目の呼び出し完了')
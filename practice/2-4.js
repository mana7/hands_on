async function asyncSum(promiseArr) {
  let sum = 0;
  console.log('promiseArr',promiseArr);
  const arr = await Promise.all(promiseArr.map(ele => ele.catch(() => 0)))
  console.log('arr',arr)
  for (const ele of arr) {
    sum += ele
  }
  return sum
}

asyncSum(
  [1,2,3,4].map(ele => ele % 2 === 0
    ? Promise.resolve(ele)
    : Promise.reject(new Error('エラー'))
    )
).then(console.log)
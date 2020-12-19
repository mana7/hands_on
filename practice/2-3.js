async function asyncSum(promiseArr) {
  let sum = 0;
  const arr = await Promise.allSettled(promiseArr)
  for(const ele of arr){
    if(ele.status === 'fulfilled') {
      sum += ele.value
    }
  }
  return sum;
}


asyncSum(
  [1,2,3,4].map(ele => ele % 2 === 0
    ? Promise.resolve(ele)
    : Promise.reject(new Error('エラー'))
    )
).then(console.log)
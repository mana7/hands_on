async function pauseAndResume(pausePeriod) {
  console.log('pauseAndResume開始');
  await new Promise(resolve => setTimeout(resolve, pausePeriod))
  console.log('pauseAndResume再開')
}

pauseAndResume(1000)
console.log('外なのでawaitの影響なし')
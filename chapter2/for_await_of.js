async function* asyncGenerator() {
  let i = 0;
  while(i <= 3) {
    await new Promise(resolve => setTimeout(resolve,100))
    yield i++
  }
}

async() => {
  for await (const ele of asyncGenerator()) {
    console.log(ele);
  }
};
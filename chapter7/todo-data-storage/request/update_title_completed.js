// const fetch = require('isomorphic-fetch')
const mod = require('../sqlite/index.js')

async function main() {
  const res = await mod.update('f6d8663c-8666-427c-8ded-f5368c290cc1',{title: 'foo', completed: true})
  console.log('res',res)
  // const result = await res.json()
  // console.log(res.status, 'result', result)
}

main()
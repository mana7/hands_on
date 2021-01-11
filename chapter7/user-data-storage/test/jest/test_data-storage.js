function sortUserById (users) {
  return users.sort((a,b) => a.id > b.id ? 1 : -1)
}

const dataStorageName = 'sqlite';
const {fetchAll, fetchById,fetchByJob, create, update, remove} = 
  require(`../../${dataStorageName}`)

describe(dataStorageName, () => {
  beforeEach(async () => {
    const allUsers = await fetchAll()
    await Promise.all(allUsers.map(user => remove(user.id)))
  })

  describe('test create(),fetchAll()', () => {
    test('create()で作成したUserをfetchAllで取得', async () => {
      //create()前の初期状態での挙動確認
      expect(await fetchAll()).toEqual([])

      //Userを登録
      const user1 = {id: 'a', familyName: 'Yamada', lastName: 'Taro',job: 'teacher1', manager: false}
      await create(user1)
      expect(await fetchAll()).toEqual([user1])

      //Userをさらに2件追加
      const user2 = {id: 'b', familyName: 'Yamada', lastName: 'Jiro',job: 'teacher2', manager: false}
      await create(user2)
      const user3 = {id: 'c', familyName: 'Yamada', lastName: 'Saburo',job: 'teacher3', manager: true}
      await create(user3)
      expect(sortUserById(await fetchAll())).toEqual([user1,user2,user3])
    })
  })

  describe('test fetchById(),fetchByJob()', () => {
    test('指定した条件に合うUserのみを取得', async () => {
      //初期状態での挙動確認
      expect(await fetchById('a')).toEqual([])
      expect(await fetchByJob('teacher')).toEqual([])      

      //Userを登録
      const user1 = {id: 'a', familyName: 'Yamada', lastName: 'Taro',job: 'teacher', manager: false}
      await create(user1)
      const user2 = {id: 'b', familyName: 'Yamada', lastName: 'Jiro',job: 'doctor', manager: false}
      await create(user2)
      const user3 = {id: 'c', familyName: 'Yamada', lastName: 'Saburo',job: 'teacher', manager: true}
      await create(user3)

      expect(await fetchById('a')).toEqual([user1])      
      expect(sortUserById(await fetchByJob('teacher'))).toEqual([user1,user3])
    })
  })

  describe('test update()', () => {
    const user1 = {id: 'a', familyName: 'Yamada', lastName: 'Taro',job: 'teacher', manager: false}
    const user2 = {id: 'b', familyName: 'Yamada', lastName: 'Jiro',job: 'doctor', manager: true} 

    beforeEach(async () => {
      await create(user1)
      await create(user2)
    })

    test('指定したIDのUserdataを更新し、更新後のUserを抽出する', async () => {
      //初期状態での挙動確認
      expect(await fetchByJob('teacher')).toEqual([user1])
      expect(await fetchByJob('doctor')).toEqual([user2])      

      //user1の情報を全て更新(iD以外)
      expect(await update('a', {familyName: 'NewYamada', lastName: 'NewTaro',job: 'doctor', manager: true})).toEqual([{id: 'a', familyName: 'NewYamada', lastName: 'NewTaro',job: 'doctor', manager: true}])   

      // let result = await update('a', {familyName: 'NewYamada', lastName: 'NewTaro',job: 'doctor', manager: true})
      // console.log('result',result)    

      //jobをdoctorに更新したので、doctor抽出で、user1/2どちらもヒットするはず
      expect(sortUserById(await fetchByJob('doctor'))).toEqual([{id: 'a', familyName: 'NewYamada', lastName: 'NewTaro',job: 'doctor', manager: true}, {id: 'b', familyName: 'Yamada', lastName: 'Jiro',job: 'doctor', manager: true}])
    })

    test('存在しないIDを指定するとnullを返す', async () => {  
      expect(await update('c', {familyName: 'NewYamada', lastName: 'NewTaro',job: 'doctor', manager: true})).toBeNull()
      //更新発生していないので、doctorでヒットするのはuser2のみ
      expect(await fetchByJob('doctor')).toEqual([user2])      
      expect(sortUserById(await fetchByJob('teacher'))).toEqual([user1])
    })


    test('リクエストするカラムが全て揃ってなくても、存在するカラムはそれぞれ更新されること', async () => {  
      expect(await update('a', {lastName: 'NewTaro',job: 'doctor', manager: true}))
        .toEqual([{id: 'a', familyName: 'Yamada', lastName: 'NewTaro',job: 'doctor', manager: true}])
    })   
    
    test('存在しないカラムがリクエストに混ざってる場合、存在するカラムのみそれぞれ更新されること', async () => {  
      expect(await update('a', {family: 'NewYamada',lastName: 'NewTaro',job: 'doctor', manager: true}))
        .toEqual([{id: 'a', familyName: 'Yamada', lastName: 'NewTaro',job: 'doctor', manager: true}])
    })   
  })  

  describe('test remove()', () => {
    const user1 = {id: 'a', familyName: 'Yamada', lastName: 'Taro',job: 'teacher', manager: false}
    const user2 = {id: 'b', familyName: 'Yamada', lastName: 'Jiro',job: 'doctor', manager: true} 

    beforeEach(async () => {
      await create(user1)
      await create(user2)
    })

    test('指定したIDのUserdataを削除する', async () => {  
      //user1の情報を削除し、idの返却を確認
      expect(await remove('a')).toBe('a')
      expect(await fetchAll()).toEqual([user2])
    })

    test('存在しないIDのUserdataを削除する', async () => {  
      expect(await remove('c')).toBeNull()   
      expect(await fetchAll()).toEqual([user1, user2])
    })
  })

})
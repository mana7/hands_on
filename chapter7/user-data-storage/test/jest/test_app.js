const database = require('../../sqlite')
const uuid = require('uuid')
const request = require('supertest')
const app = require('../../app')

jest.mock('../../sqlite')
jest.mock('uuid')

afterAll(() => app.close())

//mockのリストア(リセット)は、package.jsonのjest内に記述している

describe('app', () => {
  describe('GET /api/user', () => {
    describe('クエリパラメータがない場合', () => {
      test('fetchAll()で全Userの情報配列を返す', async () => {
        const users = [
          {id: 'a', familyName: 'Yamada', lastName: 'NewTaro', job: 'teacher', manager: false},
          {id: 'b', familyName: 'Yamada', lastName: 'Jiro', job: 'doctor', manager: true} 
        ]
        //モックが返す値の定義
        database.fetchAll.mockResolvedValue(users)

        //リクエスト送信
        const res = await request(app).get('/api/user')

        expect(res.status).toBe(200)
        expect(res.body).toEqual(users)
      })

      test('fetchAll()が失敗したらエラーを返す', async () => {
        //モックが返す値の定義
        database.fetchAll.mockRejectedValue(new Error('fetchAll()失敗'))

        //リクエスト送信
        const res = await request(app).get('/api/user')

        expect(res.status).toBe(500)
        expect(res.body).toEqual({error: 'fetchAll()失敗'})
      })      
    })

    describe('クエリパラメータがある場合', () => {
      test('fetchById(id)を実行しヒットしたuser配列を返す', async () => {
        const users = [
          {id: 'a', familyName: 'Yamada', lastName: 'NewTaro', job: 'teacher', manager: false},
          {id: 'a', familyName: 'Yamada', lastName: 'Jiro', job: 'doctor', manager: true} 
        ]        
        //モックが返す値の定義
        database.fetchById.mockResolvedValue(users)

        //リクエスト送信
        const res = await request(app)
          .get('/api/user')
          .query({id: 'a'})

        expect(res.status).toBe(200)
        expect(res.body).toEqual(users)
        expect(database.fetchById).toHaveBeenCalledWith('a') //クエリのvalue部分を引数にとる
      })

      test('fetchById(id)が失敗したらエラーを返す', async () => {
        //モックが返す値の定義
        database.fetchById.mockRejectedValue(new Error('fetchById()失敗'))

        //リクエスト送信
        const res = await request(app)
          .get('/api/user')
          .query({id: 'd'})

        expect(res.status).toBe(500)
        expect(res.body).toEqual({error: 'fetchById()失敗'})
      })      
    })

    test('fetchByJob(job)を実行しヒットしたuser配列を返す', async () => {
      const users = [
        {id: 'a', familyName: 'Yamada', lastName: 'NewTaro', job: 'teacher', manager: false},
        {id: 'b', familyName: 'Yamada', lastName: 'Jiro', job: 'teacher', manager: true} 
      ]        
      //モックが返す値の定義
      database.fetchByJob.mockResolvedValue(users)

      //リクエスト送信
      const res = await request(app)
        .get('/api/user')
        .query({job: 'teacher'})

      expect(res.status).toBe(200)
      expect(res.body).toEqual(users)
      expect(database.fetchByJob).toHaveBeenCalledWith('teacher') //クエリのvalue部分を引数にとる
    })

    test('fetchByJob(job)が失敗したらエラーを返す', async () => {
      //モックが返す値の定義
      database.fetchByJob.mockRejectedValue(new Error('fetchByJob()失敗'))

      //リクエスト送信
      const res = await request(app)
        .get('/api/user')
        .query({job: 'employee'})

      expect(res.status).toBe(500)
      expect(res.body).toEqual({error: 'fetchByJob()失敗'})
    })      
  })  
  
  describe('POST /api/user', () => {
    test('create()を実行し結果配列を返す', async () => {
      //uuid.v4()が返す値を指定
      uuid.v4.mockReturnValue('a')
      //モックで値のないPromiseを返すように定義
      database.create.mockResolvedValue()

      //リクエスト送信
      const res = await request(app)
        .post('/api/user')
        .send({id: 'a', familyName: 'Yamada', lastName: 'Taro',job: 'teacher1', manager: false})

      const expectedUser = {id: 'a', familyName: 'Yamada', lastName: 'Taro',job: 'teacher1', manager: false}
      expect(res.status).toBe(201)
      expect(res.body).toEqual(expectedUser)
      expect(database.create).toHaveBeenCalledWith(expectedUser)
    })

    describe('リクエスト情報に不足がある場合、404エラーを返す', () => {
      test('familyNameが不足', async () => {
        const res = await request(app)
          .post('/api/user')
          .send({lastName: 'Taro', job: 'teacher1', manager: false})

        expect(res.status).toBe(400)
        expect(res.body).toEqual({error: 'familyName is invalid.'})        
      })
      test('lastNameが不足', async () => {
        const res = await request(app)
          .post('/api/user')
          .send({familyName: 'Yamada',job: 'teacher1', manager: false})

        expect(res.status).toBe(400)
        expect(res.body).toEqual({error: 'lastName is invalid.'})
      })
      test('jobが不足', async () => {
        const res = await request(app)
          .post('/api/user')
          .send({familyName: 'Yamada', lastName: 'Taro', manager: false})

        expect(res.status).toBe(400)
        expect(res.body).toEqual({error: 'job is invalid.'})
      })        
        test('managerが不足', async () => {
        const res = await request(app)
          .post('/api/user')
          .send({familyName: 'Yamada', lastName: 'Taro', job: 'teacher1'})

        expect(res.status).toBe(400)
        expect(res.body).toEqual({error: 'manager is invalid.'})
      })        
    })

    test('create()が失敗した場合、エラーを返す', async () => {
      database.create.mockRejectedValue(new Error('create()失敗'))

      //リクエスト送信
      const res = await request(app)
        .post('/api/user')
        .send({id: 'a', familyName: 'Yamada', lastName: 'Taro',job: 'teacher1', manager: false})

      //バリデーションチェックは通ったがその先でエラーとなっている場合は、500エラーとなるはず
      expect(res.status).toBe(500)
      expect(res.body).toEqual({error: 'create()失敗'})
    })      
  })

  describe('PUT /api/user', () => {
    test('update()を実行し結果配列を返す', async () => {
      const updatedata = {familyName: 'Yamada', lastName: 'Taro',job: 'teacher1', manager: false}
      const expectedUser = {id: 'a', familyName: 'Yamada', lastName: 'Taro',job: 'teacher1', manager: false}
      database.update.mockResolvedValue(expectedUser)

      //リクエスト送信
      const res = await request(app)
        .put('/api/user/a')
        .send(updatedata)

      // console.log('res',res)

      expect(res.status).toBe(200)
      expect(res.body).toEqual(expectedUser)
      expect(database.update).toHaveBeenCalledWith('a',expectedUser)
    })

    test('存在しないid指定でupdate()がnullを返したら、404エラーを返す', async () => {
      database.update.mockResolvedValue(null)

      //リクエスト送信
      const res = await request(app)
        .put('/api/user/d')
        .send({familyName: 'Yamada', lastName: 'Taro',job: 'teacher1', manager: false})

      expect(res.status).toBe(404)
      expect(res.body).toEqual({error: 'User not found'})
    })

    test('update()が失敗した場合、エラーを返す', async () => {
      database.update.mockRejectedValue(new Error('update()失敗'))

      //リクエスト送信
      const res = await request(app)
        .put('/api/user/a')
        .send({familyName: 'Yamada', lastName: 'Taro', job: 'teacher1', manager: false})

      //バリデーションチェックは通ったがその先でエラーとなっている場合は、500エラーとなるはず
      expect(res.status).toBe(500)
      expect(res.body).toEqual({error: 'update()失敗'})
    })      
  })

  describe('DELETE /api/user', () => {
    test('パスで指定したiDのuserdataを削除する', async () => {
      const todo = {id: 'a', familyName: 'Yamada', lastName: 'Taro',job: 'teacher1', manager: false}
      //モックが返す値の指定
      database.remove.mockResolvedValue('a')

      //リクエストの送信
      const res = await request(app).delete('/api/user/a')
      
      //レスポンスのアサーション
      expect(res.status).toBe(204)
      expect(res.body).toEqual({})

      expect(database.remove).toHaveBeenCalledWith('a')
    })

    test('存在しないID指定でremove()がnullを返したら404エラーを返す', async () => {
      //モックが返す値の指定
      database.remove.mockResolvedValue(null)

      //リクエストの送信
      const res = await request(app).delete('/api/user/d')
      console.log('res',res.status,res.body)

      //レスポンスのアサーション
      expect(res.status).toBe(404)
      expect(res.body).toEqual({error: 'User not found'})
    })
    test('remove()が失敗したらエラーを返す', async () => {
      //モックが返す値の指定
      database.remove.mockRejectedValue(new Error('remove()失敗'))

      //リクエストの送信
      const res = await request(app).delete('/api/user/d')

      //レスポンスのアサーション
      expect(res.status).toBe(500)
      expect(res.body).toEqual({error: 'remove()失敗'})
    })    
  })
})

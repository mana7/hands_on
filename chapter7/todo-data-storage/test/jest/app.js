const fileSystem = require('../../file-system')
const uuid = require('uuid')
const request = require('supertest')

//ストレージとしてfile-systemの実装が使われるようにする
process.env.npm_lifecycle_event = 'file-system'
// const app = require('../../app.js')
const app = require('../../app')

//モジュールのモックを生成
jest.mock('../../file-system')
jest.mock('uuid')

//テスト完了後にHTTPサーバを終了
afterAll(() => app.close())

describe('app', () => {
  describe('GET /api/todos', () => {
    describe('completedが指定されていない場合' , () => {
      test('fetchAll()で取得したToDoの配列を返す', async () => {
        const todos = [
          { id: 'a', title: 'ネーム', completed: false},
          { id: 'b', title: '下書き', completed: true}
        ]
        //モックが返す値の指定
        fileSystem.fetchAll.mockResolvedValue(todos) // = mockReturnValue(Promise.resolve(todos))

        //リクエストの送信
        const res = await request(app).get('/api/todos')

        //レスポンスのアサーション
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual(todos)
      })
      test('fetchAll()が失敗したらエラーを返す', async () => {
        //モックが返す値の指定
        fileSystem.fetchAll.mockRejectedValue(new Error('fetchAll()失敗'))
        
        //リクエストの送信
        const res = await request(app).get('/api/todos')

        //レスポンスのアサーション
        expect(res.statusCode).toBe(500)
        expect(res.body).toEqual({error: 'fetchAll()失敗'})        
      })
    })

    describe('completedが指定されている場合' , () => {
      test('completedを引数にfetchByCompleted()を実行し取得したToDoの配列を返す', async () => {
        const todos = [
          { id: 'a', title: 'ネーム', completed: false },
          { id: 'b', title: '下書き', completed: true }
        ]
        //モックが返す値の指定
        fileSystem.fetchByCompleted.mockResolvedValue(todos) // = mockReturnValue(Promise.resolve(todos))

        for(const completed of [true, false]) { //モックにより、true/false関係なくtodosを返す想定。それぞれ指定でエラーとならないか検証
          //リクエストの送信
          const res = await request(app)
            .get('/api/todos')
            .query({completed})　//パラメータの追加は、.queryメソッドを使う

          //レスポンスのアサーション
          expect(res.statusCode).toBe(200)
          expect(res.body).toEqual(todos)
          //fetchByCompleted()の引数のアサーション
          expect(fileSystem.fetchByCompleted).toHaveBeenCalledWith(completed)
        }
      })
      test('fetchByCompleted()が失敗したらエラーを返す', async () => {
        //モックが返す値の指定
        fileSystem.fetchByCompleted.mockRejectedValue(new Error('fetchByCompleted()失敗'))
        
        //リクエストの送信
        const res = await request(app)
          .get('/api/todos')
          .query({completed: true})

        //レスポンスのアサーション
        expect(res.statusCode).toBe(500)
        expect(res.body).toEqual({error: 'fetchByCompleted()失敗'})        
      })
    })    
  })

  describe('POST /api/todos', () => {
    test('パラメータで指定したタイトルを引数にcreate()を実行し、結果を返す', async () => {
      //uuid.v4()が返す値を指定
      uuid.v4.mockReturnValue('a')
      //モックで値のないPromiseを返す
      fileSystem.create.mockResolvedValue()

      //リクエストの送信
      const res = await request(app)
        .post('/api/todos')
        .send({title: 'ネーム'})  //JSONの送信にはsendメソッドを使う。(リクエストbodyの中身を引数で指定)
      
      //レスポンスのアサーション
      const expectedToDo = { id: 'a', title: 'ネーム', completed: false}
      expect(res.statusCode).toBe(201)
      expect(res.body).toEqual(expectedToDo)
      //create()引数のアサーション
      expect(fileSystem.create).toHaveBeenCalledWith(expectedToDo)
    })
    test('パラメータにtitleが指定されていない場合、400エラーを返す', async () => {
      for(const title of ['', undefined]) {
        //リクエストの送信
        const res = await request(app)
          .post('/api/todos')
          .send({ title })

        //レスポンスのアサーション
        expect(res.statusCode).toBe(400)
        expect(res.body).toEqual({error: 'title is required'})
        //create()が実行されていないことのアサーション
        expect(fileSystem.create).not.toHaveBeenCalled()
      }
    })
    test('create()が失敗したらエラーを返す', async () => {
      //モックが返す値の指定
      fileSystem.create.mockRejectedValue(new Error('create()失敗'))

      //リクエストの送信
      const res = await request(app)
        .post('/api/todos')
        .send({ title: 'ネーム' })

      //レスポンスのアサーション
      expect(res.statusCode).toBe(500)
      expect(res.body).toEqual({error: 'create()失敗'})
    })        
  })

  describe('PUT /api/todos/:id/completed', () => {
    test('パスで指定したiDのToDoのcompletedをtrueに設定し、更新後のToDoを返す', async () => {
      const todo = { id: 'a', title: 'ネーム', completed: true}
      //モックが返す値の指定
      fileSystem.update.mockResolvedValue(todo)

      //リクエストの送信
      const res = await request(app).put('/api/todos/a/completed')
      
      //レスポンスのアサーション
      expect(res.statusCode).toBe(200)
      expect(res.body).toEqual(todo)
      //update()引数のアサーション
      expect(fileSystem.update).toHaveBeenCalledWith('a',{ completed: true})
    })
    test('存在しないID指定でupdate()がnullを返したら404エラーを返す', async () => {
      //モックが返す値の指定
      fileSystem.update.mockResolvedValue(null)

      //リクエストの送信
      const res = await request(app).put('/api/todos/a/completed')

      //レスポンスのアサーション
      expect(res.status).toBe(404)
      expect(res.body).toEqual({error: 'ToDo not found'})
    })
    test('update()が失敗したらエラーを返す', async () => {
      //モックが返す値の指定
      fileSystem.update.mockRejectedValue(new Error('update()失敗'))

      //リクエストの送信
      const res = await request(app).put('/api/todos/a/completed')

      //レスポンスのアサーション
      expect(res.status).toBe(500)
      expect(res.body).toEqual({error: 'update()失敗'})
    })        
  })

  describe('DELETE /api/todos/:id/completed', () => {
    test('パスで指定したiDのToDoのcompletedをfalseに設定し、更新後のToDoを返す', async () => {
      const todo = { id: 'a', title: 'ネーム', completed: false}
      //モックが返す値の指定
      fileSystem.update.mockResolvedValue(todo)

      //リクエストの送信
      const res = await request(app).delete('/api/todos/a/completed')
      
      //レスポンスのアサーション
      expect(res.status).toBe(200)
      expect(res.body).toEqual(todo)
      //update()引数のアサーション
      expect(fileSystem.update).toHaveBeenCalledWith('a',{ completed: false})
    })
    test('存在しないID指定でupdate()がnullを返したら404エラーを返す', async () => {
      //モックが返す値の指定
      fileSystem.update.mockResolvedValue(null)

      //リクエストの送信
      const res = await request(app).delete('/api/todos/a/completed')

      //レスポンスのアサーション
      expect(res.status).toBe(404)
      expect(res.body).toEqual({error: 'ToDo not found'})
    })
    test('update()が失敗したらエラーを返す', async () => {
      //モックが返す値の指定
      fileSystem.update.mockRejectedValue(new Error('update()失敗'))

      //リクエストの送信
      const res = await request(app).delete('/api/todos/a/completed')

      //レスポンスのアサーション
      expect(res.status).toBe(500)
      expect(res.body).toEqual({error: 'update()失敗'})
    })        
  })

  describe('DELETE /api/todos/:id', () => {
    test('パスで指定したiDのToDoを削除する', async () => {
      const todo = { id: 'a', title: 'ネーム', completed: false}
      //モックが返す値の指定
      fileSystem.remove.mockResolvedValue('a')

      //リクエストの送信
      const res = await request(app).delete('/api/todos/a')
      
      //レスポンスのアサーション
      expect(res.status).toBe(204)
      expect(res.body).toEqual({})
      //remove()引数のアサーション
      expect(fileSystem.remove).toHaveBeenCalledWith('a')
    })
    test('存在しないID指定でremove()がnullを返したら404エラーを返す', async () => {
      //モックが返す値の指定
      fileSystem.remove.mockResolvedValue(null)

      //リクエストの送信
      const res = await request(app).delete('/api/todos/a')

      //レスポンスのアサーション
      expect(res.status).toBe(404)
      expect(res.body).toEqual({error: 'ToDo not found'})
    })
    test('remove()が失敗したらエラーを返す', async () => {
      //モックが返す値の指定
      fileSystem.remove.mockRejectedValue(new Error('remove()失敗'))

      //リクエストの送信
      const res = await request(app).delete('/api/todos/a')

      //レスポンスのアサーション
      expect(res.status).toBe(500)
      expect(res.body).toEqual({error: 'remove()失敗'})
    })        
  })
})
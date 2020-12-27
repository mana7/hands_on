//外部のモジュールで公開されたものを利用するためのimport文
import { useEffect, useState} from 'react'
import Link from 'next/link'
import Head from 'next/head'
import 'isomorphic-fetch'

//各ページに関する情報の定義
const pages = {
  index: {title: 'すべてのToDo', fetchQuery: ''},
  active: {title: '未完了のToDo', fetchQuery: '?completed=false'},
  completed: {title: '完了したToDo', fetchQuery: '?completed=true'}
}

//CSRでページを切り替えるためのリンク
const pageLinks = Object.keys(pages).map((page,ind) => 
  <Link href = {`/${page === 'index' ? '' : page}`} key = {ind}> 
    <a style = {{ marginRight: 10}}>{pages[page].title}</a>
  </Link>
)

const pictureLink = <Link href = {`https://tyoudoii-illust.com/`} > 
  <a style = {{ marginRight: 10}}>ちょうどいいイラスト</a>
</Link>

//Reactコンポーネントを実装し、外部のモジュールで利用可能なようexport文で公開
export default function Todos(props) {
  const {title, fetchQuery} = pages[props.page]

  //コンポーネントの状態の初期化と、propsの値に応じた更新
  const [todos, setTodos] = useState([])
  　//useEffectは、クライアント再度にてコンポーネントの描画が完了後に実行される処理
  useEffect(() => {
    fetch(`/api/todos${fetchQuery}`)
      .then(async res => res.ok
        ? setTodos(await res.json())
        : alert(await res.text())
      )
  }, [props.page]) //第二引数を指定しているので、再描画が発生するたびではなく、props.pageが変わった時だけuseEffectが働く

  //このコンポーネントが描画するUIをJSX構文で記述して返す
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <h1>{title}</h1>
      {/* ToDo一覧の表示 */}
      <ul>
        {todos.map(({ id, title, completed}) => 
          <li key={id}>
            <span style={completed ? { textDecoration: 'line-through'} : {}}>
              {id}  ：  {title}      
            </span>
          </li>
        )}
      </ul>
      <div>{pageLinks}</div>
      <br></br>
      イラストリンク集
      <div>
      <Link href = {`https://www.irasutoya.com/`} > 
          <a style = {{ marginRight: 10}}>いらすとや</a>
      </Link>
      </div>

      <div>{pictureLink}</div>
    </>
  )
}
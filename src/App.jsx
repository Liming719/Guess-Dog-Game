import { useEffect, useRef } from "react";
import { useImmerReducer } from "use-immer";

function OnlyUniqueBreeds(pics){
  const uniqueBreeds = []
  const uniquePics = pics.filter(pic=>{
    const breed = pic.split("/")[4]
    if(!uniqueBreeds.includes(breed)){
      uniqueBreeds.push(breed)
      return true
    }
  })
  return uniquePics.slice(0, Math.floor(uniquePics.length/4)*4)
}

function ourReducer(draft, action){
  switch (action.type) {
    case "refreshHighScore":
      if(action.value)
        draft.highScore = action.value
      else
        draft.highScore = 0
      return
    case "Restart":
      draft.points= 0
      draft.strikes= 0
      draft.timRemaining= 0
      //draft.highScore= 0
      draft.cuurentQuestion= null
      draft.playing=false
      return
    case "countDown":      
      if(draft.timRemaining <= 0){
        draft.playing = false
      }
      else{
        draft.timRemaining--
      }
      return
    case "quessAttempt":
      if(draft.playing == false)
        return
      if(action.value == draft.cuurentQuestion.answer){
        draft.points ++
        draft.timRemaining+=5
        draft.cuurentQuestion = generateQuestion()
      }
      else{
        draft.strikes++
        if(draft.strikes>=3){
          draft.playing = false
          if(draft.highScore < draft.points)
            draft.highScore = draft.points        
        }
      }
      return
    case "startPlaying":      
      draft.timRemaining = 30
      draft.points = 0
      draft.strikes = 0
      draft.playing = true
      draft.cuurentQuestion = generateQuestion()      
      return  
    case "addToCollection":
      draft.bigCollection = draft.bigCollection.concat(action.value)
      return  
    default:
      break;
  }

  function generateQuestion(){
    const tempRandom = Math.floor(Math.random() * 4)
    const justFour = draft.bigCollection.slice(0, 4) 
    draft.bigCollection = draft.bigCollection.slice(4, draft.bigCollection.length)    
    if(draft.bigCollection.length <= 12){
      draft.fetchCount++
    } 
    return {breed:justFour[tempRandom].split("/")[4], photos:justFour, answer:tempRandom}
  }
}

const initialState = {
  points: 0,
  strikes: 0,
  timRemaining: 0,
  highScore: 0,
  bigCollection: [],
  cuurentQuestion: null,
  playing:false,
  fetchCount: 0
}
function HeatIcon(props){
  return(
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className={props.className} viewBox="0 0 16 16">
      <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
    </svg>
  )
}

function App() {
  const timer = useRef(null)
  const [state, disaptch] = useImmerReducer(ourReducer, initialState)

  useEffect(()=>{
    disaptch({type:"refreshHighScore", value:localStorage.getItem("highScore")})
  },[])

  useEffect(()=>{
    if(state.highScore>0)
      localStorage.setItem("highScore", state.highScore)
  },[state.highScore])

  useEffect(()=>{
    if(state.bigCollection.length){
      state.bigCollection.slice(0,8).forEach(pic=>{
        new Image().src = pic
      })
    }
  },[state.bigCollection])

  useEffect(()=>{
    if(state.playing){
      timer.current = setInterval(()=>{
        disaptch({type:"countDown"})
      }, 1000)
      return ()=>{
        console.log("interval cleared")
        clearInterval(timer.current)
      }
    }    
  }, [state.playing])

  useEffect(() => {
    const requestController = new AbortController()

    async function go(){
      try {
        const picsPromise = await fetch("https://dog.ceo/api/breeds/image/random/50",{signal:requestController.signal})
        const pics = await picsPromise.json()
        const uniquePics = OnlyUniqueBreeds(pics.message)
        disaptch({type:"addToCollection", value: uniquePics})
        //console.log(uniquePics)
      } catch (error) {
        console.log("our request was cancelled.")
      }      
    }
    go()
    return () => {
      requestController.abort()
    };
  }, [state.fetchCount]);

  return (
    <div>
      {state.cuurentQuestion && (
        <>
          <p className="text-center">
            <span className="text-zinc-400 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className={"inline-block " + (state.playing ? "animate-spin" : "")} viewBox="0 0 16 16">
                <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/>
                <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/>
                <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
              </svg>
              <span className="text-4xl relative top-2 ml-3">0:{String(state.timRemaining).padStart(2, '0')}</span>
            </span>
            {[...Array(3-state.strikes)].map((item, index)=>{
              return <HeatIcon key={index} className="inline text-pink-500 mx-1"></HeatIcon>
            })}
            {[...Array(state.strikes)].map((item, index)=>{
              return <HeatIcon key={index} className="inline text-pink-100 mx-1"></HeatIcon>
            })}
          </p>
          <h1 className="text-5xl text-center pt-3 pb-10 break-all md:text-7xl font-bold">{state.cuurentQuestion.breed}</h1>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 px-5">
            {state.cuurentQuestion.photos.map((photo, index)=>{
              return <div onClick={()=>{disaptch({type:"quessAttempt", value:index})}} key={index} className="rounded-lg h-40 lg:h-80  bg-cover bg-center" style={{backgroundImage:`url(${photo})`}}></div>
            })}
          </div>
          <div className="text-center text-3xl pt-2">Your Score : {state.points}</div>
        </>
      )}
      {state.playing == false && Boolean(state.bigCollection.length) && !state.cuurentQuestion && (
        <>
        <h1 className="text-4xl text-center pt-3 pb-10 md:text-7xl font-bold">Dog Guessing Game</h1>
        <p className="flex justify-center items-center text-center fixed left-0 right-0">
          <button onClick={()=>disaptch({type:"startPlaying"})} className="text-white bg-gradient-to-b from-orange-500 to-orange-700 px-4 py-3 rounded-md text-2xl font-bold">
            Play
          </button>
        </p>
        </>
        
      )}

      {(state.timRemaining <= 0 || state.strikes >= 3) && state.cuurentQuestion && (
        <div className="fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center text-center bg-black/90 text-white">
          <div>          
            {state.strikes>=3 && <p className="text-6xl mb-4 font-bold">3 Strikes, You're Out!</p>}
            {state.timRemaining <= 0 && <p className="text-6xl mb-4 font-bold">Time's up!</p>}
            <p className="flex items-baseline justify-center">Your score :{" "}
            <span className="text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="inline-block relative bottom-1 mx-1" viewBox="0 0 16 16">
              <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
            </svg>
            {state.points}
            </span>
            </p>
            <p className="mb-5">Your all-time high score : {state.highScore}</p>
            <button onClick={()=>disaptch({type:"startPlaying"})} className="text-white bg-gradient-to-b from-orange-500 to-orange-700 px-4 py-3 rounded-md text-lg mr-3">
              Play again
            </button>
            <button onClick={()=>disaptch({type:"Restart"})} className="text-white bg-gradient-to-b from-green-500 to-green-700 px-4 py-3 rounded-md text-lg">
              Exit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

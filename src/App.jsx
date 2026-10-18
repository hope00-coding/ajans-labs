import Scene from './components/Scene'
import Navbar from './components/Navbar'
import BottomBar from './components/BottomBar'
import Cursor from './components/Cursor'
import useInput from './hooks/useInput'
import Outro from './components/Outro'
import Contact from './components/Contact'
export default function App() {
  useInput()

  return (
    <>
      <div className="canvas-wrap">
        <Scene />
        <Outro />
        <Contact />
      </div>
      <Navbar />
      <BottomBar />
      <Cursor />
    </>
  )
}

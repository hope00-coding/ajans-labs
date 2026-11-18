import { useState } from 'react'
import Scene from './components/Scene'
import Navbar from './components/Navbar'
import BottomBar from './components/BottomBar'
import Cursor from './components/Cursor'
import useInput from './hooks/useInput'
import Outro from './components/Outro'
import Contact from './components/Contact'
import ServiceDetails, { RingControls } from './components/ServiceDetails'

export default function App() {
  useInput()
  const [detail, setDetail] = useState(null)

  return (
    <>
      <div className="canvas-wrap">
        <Scene onService={setDetail} />
        <Outro />
        <Contact />
      </div>
      <Navbar onAbout={() => setDetail('about')} />
      <RingControls onService={setDetail} />
      {detail !== null && (
        <ServiceDetails
          selection={detail}
          onSelect={setDetail}
          onClose={() => setDetail(null)}
        />
      )}
      <BottomBar />
      <Cursor />
    </>
  )
}

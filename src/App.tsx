import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import OptionsPositions from './OptionsPositions';

function App() {
  const [count, setCount] = useState(0)

  return (
    <OptionsPositions />
  )
}

export default App

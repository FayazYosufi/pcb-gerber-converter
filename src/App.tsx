import ViewPCB from './Components/PCB'
import { GerberProvider } from './Components/PCB/GerberContext'


const App = () => {
  return (
    <div>
      <GerberProvider>
        <ViewPCB/>
      </GerberProvider>
    </div>
  )
}

export default App
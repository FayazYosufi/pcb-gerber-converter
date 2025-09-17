import ViewPCB from './Components/PCB-View'
import { GerberProvider } from './context/GerberContext'


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
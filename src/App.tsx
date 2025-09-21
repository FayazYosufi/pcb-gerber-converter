import ViewPCB from './Components/PCB-View'
// import LayerToggler from './Components/PCB-View/deepseek'
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
import MermaidEditor from './components/MermaidEditor'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>Mermaid Diagram Editor</h1>
      </header>
      <main>
        <MermaidEditor />
      </main>
    </div>
  )
}

export default App

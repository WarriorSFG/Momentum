import './App.css'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/landing.jsx'
import Signup from './pages/signup.jsx'
import Dashboard from './pages/dashboard.jsx'
import Test from './pages/test.jsx'
import PracticeQ from './pages/practiceQ.jsx'
import PracticeA from './pages/practiceA.jsx'
import TestHistory from './pages/TestHistory.jsx'
import TestQ from './pages/TestQ.jsx'
import PracticeS from './pages/practiceS.jsx'
import GeneratedS from './pages/GeneratedS.jsx'
import GeneratedQ from './pages/generatedQ.jsx'


function App() {
  

  return (
    <>
  
    <Routes>
      <Route path="/" element={<Landing />}/>
      <Route path="/signup" element={<Signup heading="SIGNUP" option="Login" a="Existing" />}/>
      <Route path="/login" element={<Signup heading="LOGIN" option="Signup" a="New"/>}/>
      <Route path="/dashboard" element={<Dashboard />}/>
      <Route path="/testhistory" element={<TestHistory />} />
      <Route path="/test" element={<Test />}/>
      <Route path="/testQ" element={<TestQ />}/>
      <Route path='/generatedS' element={<GeneratedS />}/>
      <Route path="/generatedQ" element={<GeneratedQ />}/>
      <Route path="/practiceS" element={<PracticeS />}/>
      <Route path="/practiceQ" element={<PracticeQ />}/>
      <Route path="/practiceA" element={<PracticeA />}/>

    </Routes>
   
    </>
  )
}

export default App

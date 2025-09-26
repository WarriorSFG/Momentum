import React from 'react'
import Base from './base.jsx'
import { LogOut, Clock } from "lucide-react";
import QuestionBase from '../components/questionbase.jsx'
import QuestionSelect from '../components/questionSelect.jsx'

const test = () => {
  return (
    <>

    <Base>

    <QuestionBase heading="TEST">
        <QuestionSelect />
    </QuestionBase>
      
    </Base>


    </>
  )
}

export default test
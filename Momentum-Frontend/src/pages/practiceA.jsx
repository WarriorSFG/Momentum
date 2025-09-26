import React from 'react'
import QuestionBase from '../components/questionbase.jsx'
import QuestionSelect from '../components/questionSelect.jsx'
import Base from './base.jsx'
import SubmitSkip from '../components/submitSkip.jsx'

const practiceA = () => {
  return (
    <>
    <Base>

    <QuestionBase heading="PRACTICE">
        <SubmitSkip button1="Next" button2="Home" />
    </QuestionBase>
      
    </Base>
    </>
  )
}

export default practiceA
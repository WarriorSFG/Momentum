import React from 'react'
import Base from './base.jsx'
import Form from '../components/signupform.jsx' 

const Signup = ({heading,option,a}) => { 
    return ( 
        <>
        <Base>
            
            <div className="flex flex-row justify-center w-full max-w-full m-0"> 
                <Form heading={heading} option={option} a={a}/> 
            </div> 
        
        </Base>
        </>
    ) 
} 

export default Signup
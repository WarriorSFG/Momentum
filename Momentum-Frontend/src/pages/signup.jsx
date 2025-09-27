import Base from './base.jsx'
import AuthForm from '../components/authForm.jsx'

const Signup = ({heading,option,a}) => { 
    return ( 
        <>
        <Base>
            <div className="flex flex-row justify-center w-full max-w-full m-0"> 
                <AuthForm heading={heading} option={option} a={a}/> 
            </div> 
        </Base>
        </>
    ) 
} 

export default Signup
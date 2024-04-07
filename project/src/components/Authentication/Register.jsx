import React, { useState, useEffect } from 'react';
import examLogo from "../../assets/exam.png";
import { useNavigate, Link } from 'react-router-dom';

export const Register = () => {

    useEffect(() => {
        localStorage.removeItem('userRole');
    }, []);


    const [name, setName] = useState('');
    const [roll, setRoll] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        const userData = {
            name,
            roll,
            email,
            password
        };

        try {
            const response = await fetch('http://localhost:3001/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
        
            if (response.ok) {
                console.log('Registration successful');
                navigate('/');
            } else {
                const errorMessage = await response.text();
                alert(errorMessage);  // Show the specific error message from the server
            }
        } catch (error) {
            console.error('Registration error:', error);
        }
        
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <h2 className="text-center mt-5" style={{color: "#0e1c36"}}>Exam Panel</h2>
                    <div className="card my-5">
                        <form className="card-body cardbody-color p-lg-5" onSubmit={handleRegister}>
                            <div className="text-center">
                                <img src={examLogo} className="img-fluid profile-image-pic img-thumbnail rounded-circle my-3" width="200px" alt="profile"/>
                            </div>

                            <div className="mb-3">
                                <input type="text" className="form-control" id="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required/>
                            </div>
                            <div className="mb-3">
                                <input type="text" className="form-control" id="roll" placeholder="Roll Number" value={roll} onChange={(e) => setRoll(e.target.value)} required/>
                            </div>
                            <div className="mb-3">
                                <input type="email" className="form-control" id="email" placeholder="Mail ID" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                            </div>
                            <div className="mb-3">
                                <input type="password" className="form-control" id="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                            </div>
                            <div className="text-center">
                                <button type="submit" className="btn btn-primary px-5 w-100">Register</button>
                            </div>
                            <Link to="/"><em>Already have an account?</em></Link>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

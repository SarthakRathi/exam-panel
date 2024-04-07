import React, { useState, useEffect } from 'react';
import examLogo from "../../assets/exam.png";
import { useNavigate, Link } from 'react-router-dom';

function Login() {

  useEffect(() => {
    localStorage.removeItem('userRole');
}, []);


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (email === "admin" && password === "admin123") {
      localStorage.setItem('userRole', 'admin');
      navigate('/manageStudents');
  } else {
      try {
          const response = await fetch('http://localhost:3001/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password })
          });

          const data = await response.json(); 

          if (response.ok) {
              console.log('Login successful:', data.message);
              localStorage.setItem('studentRollNumber', data.rollNumber);
              localStorage.setItem('userRole', 'student');
              navigate('/showExams');
          } else {
              alert(data.message);
          }
      } catch (error) {
          console.error('Login error:', error);
      }
    };
  }


  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <h2 className="text-center mt-5" style={{color: "#0e1c36"}}>Exam Panel</h2>
          <div className="card my-5">
            <form className="card-body cardbody-color p-lg-5" onSubmit={handleLogin}>
              <div className="text-center">
                <img src={examLogo} className="img-fluid profile-image-pic img-thumbnail rounded-circle my-3" width="200px" alt="profile"/>
              </div>
  
              <div className="mb-3">
                <input type="text" className="form-control" id="email" placeholder="Mail ID" value={email} onChange={(e) => setEmail(e.target.value)}/>
              </div>
              <div className="mb-3">
                <input type="password" className="form-control" id="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
              </div>
              <div className="text-center">
                <button type="submit" className="btn btn-primary px-5 w-100">Login</button>
              </div>
              <Link to = "/register"><em>Create Account</em></Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

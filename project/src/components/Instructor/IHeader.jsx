import { useNavigate, useLocation } from 'react-router-dom';

export const IHeader = () => {

  const navigate = useNavigate();
  const location = useLocation();

    const logout = () => {
        localStorage.removeItem('userRole');
        navigate('/');
    };

    const tabStudents = () => {
      navigate('/manageStudents');
    }

    const tabExams = () => {
      navigate('/manageExams');
    }

  return (
    <div>
    <nav className="navbar navbar-expand-lg navbar-dark" style={{backgroundColor: "#0e1c36", fontSize: "22px"}}>
    <div className="container-fluid">
      <a className="navbar-brand">Instructor Dashboard</a>
      <div className="navbar-nav">
      <a className={`nav-link ${location.pathname.startsWith('/manageStudents') || location.pathname.startsWith('/manageMarks')? 'active' : ''}`} onClick={tabStudents}>Manage Students</a>
      <a className={`nav-link ${location.pathname.startsWith('/manageExams') || location.pathname.startsWith('/manageCourse') ? 'active' : ''}`} onClick={tabExams}>Manage Exams</a>
      </div>
      <button className="btn btn-outline-danger ml-auto" type="button" onClick={logout}>Logout</button>
    </div>
    </nav>

    </div>
  )
}

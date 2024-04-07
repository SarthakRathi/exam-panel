import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from './components/Authentication/Login'
import {Register} from './components/Authentication/Register'
import {ShowExams} from './components/Student/ShowExams'
import {GiveExam} from './components/Student/GiveExam'
import {ManageStudents} from "./components/Instructor/ManageStudents"
import {ManageMarks} from "./components/Instructor/ManageMarks"
import {ManageExams} from "./components/Instructor/ManageExams"
import {ManageCourse} from "./components/Instructor/ManageCourse"

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path="/showExams" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <ShowExams />
                    </ProtectedRoute>
          } />
          <Route path="/giveExam/:courseCode" element={
                    <ProtectedRoute allowedRoles={['student']}>
                        <GiveExam/>
                    </ProtectedRoute>
                } />
          <Route path="/manageStudents" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <ManageStudents />
                    </ProtectedRoute>
                } />
          <Route path="/manageMarks/:rollNumber" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <ManageMarks/>
                    </ProtectedRoute>
                } />
          <Route path='/manageExams' element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <ManageExams/>
                    </ProtectedRoute>
                } />
          <Route path='/manageCourse/:courseCode' element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <ManageCourse/>
                    </ProtectedRoute>
                } />
        </Routes>
      </Router>
    </>
  )
}

export default App;

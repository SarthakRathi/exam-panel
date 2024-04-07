import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const GiveExam = () => {
    const { courseCode } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(undefined);
    let tabChangeCount = 0;

    useEffect(() => {
        const fetchCourseDetailsAndQuestions = async () => {
            const courseResponse = await fetch(`http://localhost:3001/courses/${courseCode}`);
            if (courseResponse.ok) {
                const courseData = await courseResponse.json();
                setTimeLeft(courseData.timer_minutes * 60); // Assuming timer_minutes is in minutes

                const questionsResponse = await fetch(`http://localhost:3001/questions/${courseCode}`);
                if (questionsResponse.ok) {
                    const questionsData = await questionsResponse.json();
                    const totalQuestions = courseData.total_questions;
                    const shuffledQuestions = questionsData.sort(() => Math.random() - 0.5); // Shuffle the questions
                    setQuestions(shuffledQuestions.slice(0, totalQuestions)); // Set only the number of questions needed
                }
            }
        };

        fetchCourseDetailsAndQuestions();
    }, [courseCode]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                alert("Tab changed. Doing this 3 times will result in submission of your exam with 0 marks");
                tabChangeCount++;
                if (tabChangeCount >= 3) {
                    handleSubmitExam(0);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('contextmenu', handleRightClick);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('contextmenu', handleRightClick);
        };
    }, []);

    useEffect(() => {
        if (timeLeft !== undefined) {
            if (timeLeft <= 0) {
                handleSubmitExam(calculateScore());
            } else {
                const timer = setInterval(() => {
                    setTimeLeft(timeLeft - 1);
                }, 1000);
                return () => clearInterval(timer);
            }
        }
    }, [timeLeft]);

    const handleRightClick = (event) => {
        event.preventDefault();
    };

    const logout = () => {
        localStorage.removeItem('userRole');
        navigate('/');
    };

    const handleOptionChange = (questionId, option) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const calculateScore = () => {
        let score = 0;
        questions.forEach(question => {
            if (answers[question.question_id] === question.correct_option) {
                score++;
            }
        });
        return score;
    };

    const handleSubmitExam = async (score) => {
        const studentRollNumber = localStorage.getItem('studentRollNumber');
        try {
            const response = await fetch(`http://localhost:3001/marks/${studentRollNumber}/${courseCode}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ marks: score })
            });

            if (response.ok) {
                alert(`Exam submitted successfully. Your score is ${score}.`);
                navigate('/showExams');
            } else {
                alert('Failed to submit exam.');
            }
        } catch (error) {
            console.error('Error submitting exam:', error);
            alert('Error submitting exam');
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSubmitExam(calculateScore());
    };

    return (
        <div style={{ userSelect: 'none' }}>
            <nav className="navbar navbar-light px-3" style={{ backgroundColor: "#0e1c36", color: "whitesmoke", fontSize: "22px" }}>
                <span className="mb-0 h4">Exam Panel - Time Left: {timeLeft !== undefined ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : 'Loading...'}</span>
                <button className="btn btn-outline-danger my-2 my-sm-0" type="button" onClick={logout}>Logout</button>
            </nav>
            <div className="container mt-4">
                <h2 className="mb-5 text-center">Questions</h2>
                <form id="examForm" onSubmit={handleFormSubmit}>
                    {questions.map((question, index) => (
                        <div key={index} className="mb-3">
                            <p>{question.question_text}</p>
                            {[question.option_1, question.option_2, question.option_3, question.option_4].map((option, idx) => (
                                <div key={idx} className="form-check">
                                    <input 
                                        className="form-check-input" 
                                        type="radio" 
                                        name={`question${question.question_id}`} 
                                        id={`question${question.question_id}option${idx}`} 
                                        value={option}
                                        onChange={() => handleOptionChange(question.question_id, option)}
                                    />
                                    <label className="form-check-label" htmlFor={`question${question.question_id}option${idx}`}>
                                        {option}
                                    </label>
                                </div>
                            ))}
                        </div>
                    ))}
                    <div className="text-center">
                        <button type="reset" className="btn btn-warning mb-5">Clear All Selections</button>
                        <button type="submit" className="btn btn-success mb-5">Submit Exam</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GiveExam;

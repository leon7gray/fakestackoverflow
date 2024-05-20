import './index.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/header';
import Sidenav from './components/sidenav';
import Questions from './components/questions';
import AnswerPage from './pages/AnswerPage';
import AnswerForm from './pages/AnswerQuestionPage';
import AskForm from './pages/AskPage';
import Tags from './pages/Tags';
import { Link } from 'react-router-dom';

function App({ loggedIn, setLoggedIn }) {
    const [state, setState] = useState("home");
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [searching, setSearching] = useState(null);
    const [selectedTag, setSelectedTag] = useState(null);
    const [userAnswered, setUserAnswered] = useState(null);
    const [answerID, setAnswerID] = useState(null);
    /*
    const [answers, setAnswers] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [tags, setTags] = useState([]);
    */

    useEffect(() => {
        /*
        axios.get('http://localhost:8000/answers')
            .then(response => {
                setAnswers(response.data);
            })
            .catch(error => {
                console.log(error);
            });

        axios.get('http://localhost:8000/questions')
            .then(response => {
                setQuestions(response.data);
            })
            .catch(error => {
                console.log(error);
            });

        axios.get('http://localhost:8000/tags')
            .then(response => {
                setTags(response.data);
            })
            .catch(error => {
                console.log(error);
            });
            */
        async function checkLoginStatus() {
            try {
                const response = await axios.get('http://localhost:8000/welcome', {
                    withCredentials: true
                });
                const { loggedIn } = response.data;
                setLoggedIn(loggedIn);
            } catch (error) {
                console.log(error);
            }
        }
        checkLoginStatus();
    }, [setLoggedIn]);

    const handleQuestionClick = async (questionId, user) => {
        await axios.put(`http://localhost:8000/questions/${questionId}/views`);
        setSelectedQuestion(questionId);
        setUserAnswered(user);
        setState("question");

    };
    const handleTagClick = (tagName) => {
        setSelectedTag(tagName);
        setState("tagPage");

    };

    const handleUser = () => {
        setState("user");
    }
    const handleButton = () => {
        setSelectedTag(null);
    }
    const handleSearch = (searchQuery) => {
        setSearching(searchQuery);
        setState("search");
    };

    const postQuestionForm = () => {
        setState("questionForm");
    };

    const postedQuestion = () => {
        setState("home");
    }

    const questionTab = () => {
        setState("home");
    }

    const tagsTab = () => {
        setState("tags");
    }

    const postAnswerForm = (aid) => {
        setState("answerForm");
        setAnswerID(aid);
    }

    const postedAnswer = () => {
        setState("question");
    }

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8000/logout', null, {
                withCredentials: true
            });
            setLoggedIn(false);
        } catch (error) {
            console.log(error);
        }
    };

    const renderPage = () => {
        switch (state) {
            case "home":
                return (
                    <Questions
                        handleQuestionClick={handleQuestionClick}
                        postQuestionForm={postQuestionForm}
                        selectedTag={null}
                        handleButton={handleButton}
                        searching={null}
                        loggedIn={loggedIn}
                        user={false}
                    />
                );
            case "question":
                return (
                    <AnswerPage
                        selectedQuestion={selectedQuestion}
                        postQuestionForm={postQuestionForm}
                        postAnswerForm={postAnswerForm}
                        user={userAnswered}
                    />
                );
            case "questionForm":
                return (
                    <AskForm postedQuestion={postedQuestion} edit={false} />
                )
            case "answerForm":
                return (
                    <AnswerForm selectedQuestion={selectedQuestion} postedAnswer={postedAnswer} aid={answerID}/>
                );
            case "tags":
                return (
                    <Tags postQuestionForm={postQuestionForm} handleTagClick={handleTagClick} />
                )
            case "tagPage":
                return (
                    <Questions
                        handleQuestionClick={handleQuestionClick}
                        postQuestionForm={postQuestionForm}
                        selectedTag={selectedTag}
                        handleButton={handleButton}
                        searching={null}
                        loggedIn={loggedIn}
                        user={false}
                    />
                )
            case "search":
                return (
                    <Questions
                        handleQuestionClick={handleQuestionClick}
                        postQuestionForm={postQuestionForm}
                        selectedTag={null}
                        handleButton={handleButton}
                        searching={searching}
                        loggedIn={loggedIn}
                        user={false}
                    />
                )
            case "user":
                return (
                    <Questions
                        handleQuestionClick={handleQuestionClick}
                        postQuestionForm={postQuestionForm}
                        selectedTag={null}
                        handleButton={handleButton}
                        searching={searching}
                        loggedIn={loggedIn}
                        user={true}
                        handleTagClick={handleTagClick}
                    />
                )
            default:
                return (
                    <></>
                );
        }
    }

    return (
        <section className="fakesohead">
            <div id="header" className="header">
                <Header handleSearch={handleSearch} />
            </div>

            <div id="main" className="main" >
                <Sidenav questionTab={questionTab} tagsTab={tagsTab} />
                {
                    loggedIn ?
                        (
                            <div>
                                <Link to="/welcome" className="button" onClick={handleLogout}>
                                    Logout
                                </Link>
                                <button className='button' onClick={handleUser}>User Profile</button>
                            </div>
                        ) :
                        (
                            <Link to="/login" className="button">
                                Login
                            </Link>
                        )
                }

                {renderPage()}
            </div>
        </section>
    );
}

export default App;
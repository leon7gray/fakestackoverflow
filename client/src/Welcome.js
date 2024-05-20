import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Welcome.css';

function Welcome({ setLoggedIn }) {

    const [loggedIn, setLoggedInState] = useState(false);
    const [username, setUsername] = useState('');

    useEffect(() => {
        async function checkLoginStatus() {
            try {
                const response = await axios.get('http://localhost:8000/welcome', {
                    withCredentials: true
                });
                const { loggedIn, username } = response.data;
                setLoggedIn(loggedIn);
                setUsername(username);
                setLoggedInState(loggedIn);
            } catch (error) {
                console.log(error);
            }
        }
        checkLoginStatus();
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8000/logout', null, {
                withCredentials: true
            });
            setLoggedIn(false);
            setLoggedInState(false);
            setUsername('');
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="welcome">
            {loggedIn ? (
                <>
                    <h1>Welcome back {username}!</h1>
                    <Link className="button" onClick={handleLogout}>Logout</Link>
                </>

            ) : (
                <h1>Welcome to Fake Stack Overflow</h1>

            )}
            <div className="options">
                {loggedIn ? (
                    <Link to="/home" className="button">
                        Go to Home Page
                    </Link>
                ) : (
                    <>
                        <Link to="/register" className="button">
                            Register as a new user
                        </Link>
                        <Link to="/login" className="button">
                            Login as an existing user
                        </Link>
                        <Link to="/home" className="button">
                            Continue as guest
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default Welcome;
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errorMsg, setErrorMsg] = useState('');

    const { username, email, password, confirmPassword } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match');
            return;
        }

        // Email validation using a regex pattern
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setErrorMsg('Invalid email format');
            return;
        }

        // Check if email is already taken
        try {
            const res = await axios.get(`http://localhost:8000/users`);
            const users = res.data;
            const existingUser = users.find(user => user.email === email);
            if (existingUser) {
                setErrorMsg('User with this email already exists');
                return;
            }
        } catch (err) {
            console.error(err);
            setErrorMsg('Error checking for preexisting user');
            return;
        }

        // Check if password contains email or username
        if (password.includes(email) || password.includes(username)) {
            setErrorMsg('Password cannot contain email or username');
            return;
        }

        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const body = JSON.stringify({ username, email, password });

        try {
            await axios.post('http://localhost:8000/users', body, config);
            navigate('/login');
        } catch (err) {
            console.error(err.response.data);
            if (err.response && err.response.data) {
                setErrorMsg(err.response.data.error);
            } else {
                setErrorMsg('Error registering user');
            }
        }
    };

    return (
        <div className="register">
            <h1>Register</h1>
            {errorMsg && <div className="error">{errorMsg}</div>}
            <form onSubmit={onSubmit}>
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={onChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={onChange}
                        required
                    />
                </div>
                <input type="submit" value="Sign Up" />
            </form>
        </div>
    );
}

export default Register;
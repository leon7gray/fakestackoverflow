import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Tags({ postQuestionForm, handleTagClick }) {

    const [questions, setQuestions] = useState([]);
    const [tags, setTags] = useState(null);

    useEffect(() => {
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
    }, []);

    function TagOccuerence(tagName, questions) {
        let count = 0;
        questions.forEach(question => {
            question.tags.forEach(tag => {
                if (tag.name === tagName) {
                    count++;
                }
            })
        });
        return count;
    }

    if (!tags)
    {
        return (
            <p>Loading...</p>
        )
    }
    return (
        <div id="Tags" className="tabcontent">
            <div className='TagsBox'>
                <h1 id="numTags"><b>{tags.length} Tags</b></h1>
                <h2 id="tagsHeader"><b>All Tags</b></h2>
                <button className="askbutton" type="button" onClick={() => { postQuestionForm(); }}>Ask Question</button>
            </div>

            <div id="tagList">
                {tags.map(t => {
                    return (
                        <div className='tagBox' key={t._id}>
                            <div className='tagLink' id='t.name' onClick={() => { handleTagClick(t.name) }}>{t.name}</div>
                            <div>{TagOccuerence(t.name, questions)}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
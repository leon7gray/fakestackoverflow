import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AnswerForm({ selectedQuestion, postedAnswer, aid }) {
  const [username, setUsername] = useState("");
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");

  useEffect(() => {

    async function getUser() {
      try {
        const response = await axios.get('http://localhost:8000/profile', {
          withCredentials: true
        });
        const user = response.data.user;
        setUsername(user.username);
      } catch (error) {
        console.log(error);
      }
    }
    getUser();

    axios.get('http://localhost:8000/answers')
      .then(response => {
        for (let i = 0; i < response.data.length; i++) {
          if (response.data[i]._id === aid) {
            setEditText(response.data[i].text);
          }
        }

      })
      .catch(error => {
        console.log(error);
      });
  }, [aid]);


  async function postNewAnswer(event) {

    const text = document.getElementById("answerText").value.trimStart();

    if (text.length === 0) {
      document.getElementById('AtextError').textContent = 'Please enter an answer';
      return;
    }

    await axios.post(`http://localhost:8000/questions/${selectedQuestion}/answers`, {
      text: text,
      ans_by: username
    })
    postedAnswer();
  }

  const editAnswer = async() => {
    const text = document.getElementById("answerText").value.trimStart();

    if (text.length === 0) {
      document.getElementById('AtextError').textContent = 'Please enter an answer';
      return;
    }
    console.log("edit");
    await axios.put(`http://localhost:8000/questions/${selectedQuestion}/answers`, {
      text: text,
      aid: aid,
      qid: selectedQuestion
    })
    postedAnswer();
  }

  return (
    <div id="Answer" className="tabcontent" style={{ margin: "5% 15%" }}>
      <div id="questionID"></div>

      <h2 style={{ fontSize: 50 }}>Answer*</h2>
      <p>
        <i>
          <b>&nbsp;&nbsp;&nbsp;Add details</b>
        </i>
      </p>
      {aid === undefined ? (<textarea
        id="answerText"
        rows="20"
        cols="50"
        name="text"
        wrap="hard"
        style={{ fontSize: 20, width: "100%" }}
        value={text}
        onChange={(event) => setText(event.target.value)}
      ></textarea>) : (<textarea
        id="answerText"
        rows="20"
        cols="50"
        name="text"
        wrap="hard"
        style={{ fontSize: 20, width: "100%" }}
        value={editText}
        onChange={(event) => setEditText(event.target.value)}
      ></textarea>)}
      

      <div id="AtextError" style={{ color: "red" }}></div>

      { aid === undefined ? (<button
        className="askbutton"
        type="submit"
        style={{ margin: "5% 0" }}
        onClick={postNewAnswer}
      >
        Post Answer
      </button>) : (
        <button
        className="askbutton"
        type="submit"
        style={{ margin: "5% 0" }}
        onClick={editAnswer}
      >
        Post Answer
      </button>
      )}
      

      <p
        style={{
          color: "red",
          fontSize: 20,
          display: "inline",
          float: "right",
          margin: "5% 0",
        }}
      >
        * indicates mandatory fields
      </p>
    </div>
  );
}

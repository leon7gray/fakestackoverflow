import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AskForm({ postedQuestion, edit, setContent, qid }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [username, setUsername] = useState("");
  const [tagsList, setTagsList] = useState([]);
  const [reputation, setReputation] = useState(0);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editText, setEditText] = useState("");
  const [editTags, setEditTags] = useState("");

  useEffect(() => {
    axios.get('http://localhost:8000/tags')
      .then(response => {
        setTagsList(response.data);
      })
      .catch(error => {
        console.log(error);
      });

    axios.get('http://localhost:8000/questions')
      .then(response => {
        for (let i = 0; i < response.data.length; i++) {
          if (response.data[i]._id === qid) {
            setEditTitle(response.data[i].title);
            setEditSummary(response.data[i].summary);
            setEditText(response.data[i].text);
            setEditTags(response.data[i].tags.map(tag => tag.name).join(' '));
          }
        }

      })
      .catch(error => {
        console.log(error);
      });

    async function getUser() {
      try {
        const response = await axios.get('http://localhost:8000/profile', {
          withCredentials: true
        });
        const user = response.data.user;
        setUsername(user.username);
        setReputation(user.reputation);
      } catch (error) {
        console.log(error);
      }
    }
    getUser();
  });

  const deleteQuestion = async () => {
    await axios.delete('http://localhost:8000/questions', {
      data: {
        qid: qid
      }
    });
    setContent(0);
  }

  const editQuestion = async () => {
    const title = document.getElementById('questionTitle').value;
    const summary = document.getElementById('questionSummary').value;
    const text = document.getElementById('questionText').value;
    const tags = document.getElementById('questionTag').value.trim().split(' ');

    if (title.length === 0) {
      document.getElementById('QtitleError').textContent = 'Please enter a title';
      return;
    }
    if (title.length > 50) {
      document.getElementById('QtitleError').textContent = "Title cannot be more than 50 characters long";
      return;
    }
    if (summary.length === 0) {
      document.getElementById('QsummaryError').textContent = 'Please enter a summary';
      return;
    }
    if (summary.length > 140) {
      document.getElementById('QsummaryError').textContent = 'Summary cannot be more than 140 characters long';
      return;
    }
    if (text.length === 0) {
      document.getElementById('QtextError').textContent = 'Please enter a question';
      return;
    }
    if (tags[0] === '') {
      document.getElementById('QtagError').textContent = 'Please enter at least one tag';
      return;
    }

    var questionTags = [];
    var currentTag = null;

    for (let i = 0; i < tags.length; i++) {
      for (let j = 0; j < tagsList.length; j++) {
        currentTag = tagsList[j];
        if (tags[i].toLowerCase() === currentTag.name.toLowerCase()) {
          questionTags.push(currentTag.name);
          break;
        }
      }
      if (currentTag === null) {
        if (reputation < 50) {
          document.getElementById('QtagError').textContent = "Users wth less than 50 reputation cannot create new tags";
          return;
        }
        try {
          await axios.post('http://localhost:8000/tags', {
            name: tags[i].toLowerCase(),
            created_by: username
          });
        } catch (error) {
          console.log(error);
        }
        continue;
      }
      if (tags[i].toLowerCase() === currentTag.name.toLowerCase()) {
        continue;
      }
      if (reputation < 50) {
        document.getElementById('QtagError').textContent = "Users wth less than 50 reputation cannot create new tags";
        return;
      }
      try {
        await axios.post('http://localhost:8000/tags', {
          name: tags[i].toLowerCase(),
          created_by: username
        });
      } catch (error) {
        console.log(error);
      }
      questionTags.push(tags[i].toLowerCase());

    }
    try {
      await axios.put('http://localhost:8000/questions', {
        title: title, summary: summary, text: text, tags: questionTags, asked_by: username, qid: qid
      }); // add the new question to the model
    } catch (error) {
      console.log(error);
    }// add the new question to the model
    setContent(0);
  }



  async function postNewQuestion() {
    const title = document.getElementById('questionTitle').value;
    const summary = document.getElementById('questionSummary').value;
    const text = document.getElementById('questionText').value;
    const tags = document.getElementById('questionTag').value.trim().split(' ');

    if (title.length === 0) {
      document.getElementById('QtitleError').textContent = 'Please enter a title';
      return;
    }
    if (title.length > 50) {
      document.getElementById('QtitleError').textContent = "Title cannot be more than 50 characters long";
      return;
    }
    if (summary.length === 0) {
      document.getElementById('QsummaryError').textContent = 'Please enter a summary';
      return;
    }
    if (summary.length > 140) {
      document.getElementById('QsummaryError').textContent = 'Summary cannot be more than 140 characters long';
      return;
    }
    if (text.length === 0) {
      document.getElementById('QtextError').textContent = 'Please enter a question';
      return;
    }
    if (tags[0] === '') {
      document.getElementById('QtagError').textContent = 'Please enter at least one tag';
      return;
    }
    if (tags.length > 5) {
      document.getElementById('QtagError').textContent = 'You cannot use more than 5 tags';
      return;
    }

    for (let i = 0; i < tags.length; i++) {
      if (tags[i].length > 10) {
        document.getElementById('QtagError').textContent = "a tag cannot be more than 10 characters long";
        return;
      }
    }

    var questionTags = [];
    var currentTag = null;
    for (let i = 0; i < tags.length; i++) {
      for (let j = 0; j < tagsList.length; j++) {
        currentTag = tagsList[j];
        console.log(currentTag.name.toLowerCase());
        console.log(tags[i].toLowerCase());
        if (tags[i].toLowerCase() === currentTag.name.toLowerCase()) {
          questionTags.push(currentTag.name);
          break;
        }
      }
      if (currentTag === null) {
        if (reputation < 50) {
          document.getElementById('QtagError').textContent = "Users wth less than 50 reputation cannot create new tags";
          return;
        }
        try {
          await axios.post('http://localhost:8000/tags', {
            name: tags[i].toLowerCase(),
            created_by: username
          });
        } catch (error) {
          console.log(error);
        }
        continue;
      }
      if (tags[i].toLowerCase() === currentTag.name.toLowerCase()) {
        continue;
      }
      if (reputation < 50) {
        document.getElementById('QtagError').textContent = "Users wth less than 50 reputation cannot create new tags";
        return;
      }
      try {
        await axios.post('http://localhost:8000/tags', {
          name: tags[i].toLowerCase(),
          created_by: username
        });
      } catch (error) {
        console.log(error);
      }
      questionTags.push(tags[i].toLowerCase());

    }
    try {
      await axios.post('http://localhost:8000/questions', {
        title: title, summary: summary, text: text, tags: questionTags, asked_by: username
      }); // add the new question to the model
    } catch (error) {
      console.log(error);
    }// add the new question to the model
    postedQuestion();
  }

  return (
    <div>
      {!edit ? (<div id="Ask" className="tabcontent" style={{ margin: "5% 15%" }}>
        <form onSubmit={postNewQuestion}>
          <h1 style={{ fontSize: 50 }}>Question Title*</h1>
          <p>
            <i>
              <b>&nbsp;&nbsp;&nbsp;Limit title to 100 characters or less</b>
            </i>
          </p>

          <input
            type="text"
            id="questionTitle"
            name="title"
            style={{ width: "100%", height: "5%", fontSize: 30 }}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <div id="QtitleError" style={{ color: "red" }}></div>

          <h4 style={{ fontSize: 50 }}>Summary*</h4>
          <input
            type="text"
            id="questionSummary"
            name="summary"
            style={{ width: "100%", height: "5%", fontSize: 20 }}
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
          />

          <div id="QsummaryError" style={{ color: "red" }}></div>

          <h2 style={{ fontSize: 50 }}>Question Text*</h2>
          <p>
            <i>
              <b>&nbsp;&nbsp;&nbsp;Add details</b>
            </i>
          </p>
          <textarea
            id="questionText"
            rows="20"
            cols="50"
            name="text"
            wrap="hard"
            style={{ fontSize: 20, width: "100%" }}
            value={text}
            onChange={(event) => setText(event.target.value)}
          ></textarea>

          <div id="QtextError" style={{ color: "red" }}></div>

          <h3 style={{ fontSize: 50 }}>Tags*</h3>
          <p>
            <i>
              <b>&nbsp;&nbsp;&nbsp;Add keyboards separated by whitespace</b>
            </i>
          </p>
          <input
            type="text"
            id="questionTag"
            name="tags"
            style={{ width: "100%", height: "5%", fontSize: 20 }}
            value={tags}
            onChange={(event) => setTags(event.target.value)}
          />

          <div id="QtagError" style={{ color: "red" }}></div>

          <input
            className="askbutton"
            value="Post Question"
            style={{ margin: "5% 0" }}
            onClick={() => {
              postNewQuestion();
            }}
            readOnly
          />

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
        </form>
      </div>) : (
        <div id="Ask" className="tabcontent" style={{ margin: "5% 15%" }}>
          <form>
            <h1 style={{ fontSize: 50 }}>Question Title*</h1>
            <p>
              <i>
                <b>&nbsp;&nbsp;&nbsp;Limit title to 100 characters or less</b>
              </i>
            </p>

            <input
              type="text"
              id="questionTitle"
              name="title"
              style={{ width: "100%", height: "5%", fontSize: 30 }}
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
            />

            <div id="QtitleError" style={{ color: "red" }}></div>

            <h4 style={{ fontSize: 50 }}>Summary*</h4>
            <input
              type="text"
              id="questionSummary"
              name="summary"
              style={{ width: "100%", height: "5%", fontSize: 20 }}
              value={editSummary}
              onChange={(event) => setEditSummary(event.target.value)}
            />

            <div id="QsummaryError" style={{ color: "red" }}></div>

            <h2 style={{ fontSize: 50 }}>Question Text*</h2>
            <p>
              <i>
                <b>&nbsp;&nbsp;&nbsp;Add details</b>
              </i>
            </p>
            <textarea
              id="questionText"
              rows="20"
              cols="50"
              name="text"
              wrap="hard"
              style={{ fontSize: 20, width: "100%" }}
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
            ></textarea>

            <div id="QtextError" style={{ color: "red" }}></div>

            <h3 style={{ fontSize: 50 }}>Tags*</h3>
            <p>
              <i>
                <b>&nbsp;&nbsp;&nbsp;Add keyboards separated by whitespace</b>
              </i>
            </p>
            <input
              type="text"
              id="questionTag"
              name="tags"
              style={{ width: "100%", height: "5%", fontSize: 20 }}
              value={editTags}
              onChange={(event) => setEditTags(event.target.value)}
            />

            <div id="QtagError" style={{ color: "red" }}></div>


            <div>
              <button
                className="askbutton" onClick={editQuestion}>
                Save
              </button>
              <button className="askbutton" onClick={deleteQuestion}>
                Delete
              </button>
            </div>

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
          </form>
        </div>)}
    </div>
  );
}
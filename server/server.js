const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const Answer = require('./models/answers');
const Question = require('./models/questions');
const Tag = require('./models/tags');
const User = require('./models/users');
const router = express.Router();
const bcrypt = require('bcrypt');
const Comment = require('./models/comments');
app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

const store = new MongoDBStore({
    uri: 'mongodb://127.0.0.1:27017/fake_so_sessions',
    collection: 'sessions'
});

store.on('error', (error) => {
    console.log('Session store error:', error);
});

// Set up session middleware
app.use(session({
    secret: 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

let mongoDB = "mongodb://127.0.0.1:27017/fake_so";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('error', (error) => {
    console.log('MongoDB connection error:', error);
});

app.get('/users', (req, res) => {
    User.find()
        .then((users) => {
            res.json(users);
        })
        .catch((error) => {
            console.log('Error retrieving users:', error);
            res.status(500).json({ error: 'Error retrieving users' });
        });
});

app.post('/users', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Please provide a username, email, and password' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username: username, email: email, password: hashedPassword });
        await user.save();

        res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.log('Error registering user:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        req.session.user = user;
        res.json({ message: 'Login successful', sessionId: req.sessionID });
    } catch (error) {
        console.log('Error logging in user:', error);
        res.status(500).json({ error: 'Error logging in user' });
    }
});

app.get('/welcome', async (req, res) => {
    const sessionID = req.cookies.sessionId;
    store.get(sessionID, function (error, session) {
        if (error) {
            console.error(error);
        } else {
            if (session) {
                res.json({ loggedIn: true, username: session.user.username });
            }
            else {
                res.json({ loggedIn: false });
            }
        }
    });
});

app.get('/profile', (req, res) => {
    const sessionID = req.cookies.sessionId;
    store.get(sessionID, async function (error, session) {
        if (error) {
            console.error(error);
        } else {
            if (session) {
                const user = await User.findOne({ email: session.user.email });
                res.json({ user: user });
            }
        }
    });
});

app.post('/logout', (req, res) => {
    const sessionID = req.cookies.sessionId;
    if (sessionID) {
        store.destroy(sessionID, (error) => {
            if (error) {
                console.error(error);
            }
            res.clearCookie('sessionId');
            res.json({ message: 'Logout successful' });
        });
    } else {
        res.json({ message: 'No session found' });
    }
});

app.put('/qupvote', async (req, res) => {
    const { qid, username } = req.body;
    const question = await Question.findById(qid);
    question.votes += 1;
    await question.save();
    const user = await User.findOne({ username: username });
    user.reputation += 5;
    await user.save();
    res.json({ votes: question.votes });
});

app.put('/qdownvote', async (req, res) => {
    const { qid, username } = req.body;
    const question = await Question.findById(qid);
    question.votes -= 1;
    await question.save();
    const user = await User.findOne({ username: username });
    user.reputation -= 10;
    await user.save();
    res.json({ votes: question.votes });
});

app.put('/aupvote', async (req, res) => {
    const { qid, aid, username } = req.body;
    const answer = await Answer.findById(aid);
    answer.votes += 1;
    await answer.save();
    const question = await Question.findById(qid);
    const questionAns = await question.answers.find((ans) => ans._id.toString() === aid);
    questionAns.votes += 1;
    await question.save();
    const user = await User.findOne({ username: username });
    user.reputation += 5;
    await user.save();
    res.json({ votes: answer.votes });
});

app.put('/adownvote', async (req, res) => {
    const { qid, aid, username } = req.body;
    const answer = await Answer.findById(aid);
    answer.votes -= 1;
    await answer.save();
    const question = await Question.findById(qid);
    const questionAns = await question.answers.find((ans) => ans._id.toString() === aid);
    questionAns.votes -= 1;
    await question.save();
    const user = await User.findOne({ username: username });
    user.reputation -= 10;
    await user.save();
    res.json({ votes: answer.votes });
});

app.post('/questioncomment', async (req, res) => {
    const { qid, text, username } = req.body;
    const comment = new Comment({ text: text, sub_by: username });
    await comment.save();
    const question = await Question.findById(qid);
    question.comments.push(comment);
    await question.save();
    res.json({ comments: question.comments });
})

app.post('/answercomment', async (req, res) => {
    const { aid, text, username } = req.body;
    const comment = new Comment({ text: text, sub_by: username });
    await comment.save();
    const answer = await Answer.findById(aid);
    answer.comments.push(comment);
    await answer.save();
    res.json({ comments: answer.comments });
})

app.put('/questions', async (req, res) => {
    const { title, summary, text, tags, asked_by, qid } = req.body;
    const tagList = [];
    for (let i = 0; i < tags.length; i++) {
        const tag = await Tag.findOne({ name: tags[i] });
        tagList.push(tag);
    }

    const question = await Question.findById(qid);
    question.title = title;
    question.summary = summary;
    question.text = text;
    question.tags = tagList;
    question.asked_by = asked_by;
    question.ask_date_time = Date.now();
    await question.save();
});

app.delete('/questions', async (req, res) => {
    const { qid } = req.body;

    const question = await Question.findById(qid);

    await Comment.deleteMany({ _id: { $in: question.comments } });

    await Answer.deleteMany({ _id: { $in: question.answers } });

    await Question.deleteOne({ _id: qid });
});

app.put('/cqupvote', async (req, res) => {
    const { cid, qid, username } = req.body;
    const comment = await Comment.findById(cid);
    comment.votes += 1;
    await comment.save();
    const question = await Question.findById(qid);
    const questionCom = question.comments.find((com) => com._id.toString() === cid);
    questionCom.votes += 1;
    await question.save();
    const user = await User.findOne({ username: username });
    user.reputation += 5;
    await user.save();
    res.json({ votes: comment.votes });
});

app.put('/caupvote', async (req, res) => {
    const { cid, aid, username } = req.body;
    const comment = await Comment.findById(cid);
    comment.votes += 1;
    await comment.save();
    const answer = await Answer.findById(aid);
    const answerCom = answer.comments.find((com) => com._id.toString() === cid);
    answerCom.votes += 1;
    await answer.save();
    const user = await User.findOne({ username: username });
    user.reputation += 5;
    await user.save();
    res.json({ votes: comment.votes });
});

app.get('/users', (req, res) => {
    User.find()
        .then((users) => {
            res.json(users);
        })
        .catch((error) => {
            console.log('Error retrieving users:', error);
            res.status(500).json({ error: 'Error retrieving users' });
        });
});

app.delete('/users', async (req, res) => {
    const { username } = req.body;

    await Comment.deleteMany({ sub_by: { $in: username } });

    await Answer.deleteMany({ ans_by: { $in: username } });

    await Question.deleteMany({ asked_by: { $in: username } });

    await Tag.deleteMany({ created_by: { $in: username } });

    await User.deleteOne({ username: username });

    await User.find()
        .then((users) => {
            res.json(users);
        })
        .catch((error) => {
            console.log('Error retrieving users:', error);
            res.status(500).json({ error: 'Error retrieving users' });
        });
});

app.put('/tags', async (req, res) => {
    const { tid, name } = req.body;

    const tag = await Tag.findById(tid);
    tag.name = name;
    await tag.save();
    await Tag.find()
        .then((tags) => {
            res.json(tags);
        })
        .catch((error) => {
            console.log('Error retrieving tags:', error);
            res.status(500).json({ error: 'Error retrieving tags' });
        });
});

app.delete('/tags', async (req, res) => {
    const { tid } = req.body;

    await Tag.findByIdAndDelete(tid);

    await Tag.find()
        .then((tags) => {
            res.json(tags);
        })
        .catch((error) => {
            console.log('Error retrieving tags:', error);
            res.status(500).json({ error: 'Error retrieving tags' });
        });
});

app.put('/questions/:questionId/answers', async (req, res) => {
    const { text, aid, qid } = req.body;
    const question = await Question.findById(qid);
    const questionAns = question.answers.find((ans) => ans._id.toString() === aid);
    questionAns.text = text;
    questionAns.ans_date_time = Date.now();
    await question.save();
    await questionAns.save();

    const answerdb = await Answer.findById(aid);
    answerdb.text = text;
    await answerdb.save();

    res.json(question);
});

app.delete('/answers', async (req, res) => {
    const { qid, aid } = req.body;

    const question = await Question.findById(qid);
    const answerIndex = question.answers.findIndex((ans) => ans._id.toString() === aid);
    question.answers.splice(answerIndex, 1);
    await question.save();

    const answer = await Answer.findById(aid);
    for (let i = 0; i < answer.comments.length; i++)
    {
        await Comment.findByIdAndDelete(answer.comments[i]._id);
    }
    await Answer.findByIdAndDelete(aid);
    await Question.find()
        .then((questions) => {
            res.json(questions);
        })
        .catch((error) => {
            console.log('Error retrieving quesetions:', error);
            res.status(500).json({ error: 'Error retrieving questions' });
        });

});

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.get('/answers', (req, res) => {
    Answer.find()
        .then((answers) => {
            res.json(answers);
        })
        .catch((error) => {
            console.log('Error retrieving answers:', error);
            res.status(500).json({ error: 'Error retrieving answers' });
        });
});

app.post('/answers', (req, res) => {
    const { text, ans_by } = req.body;
    const answer = new Answer({ text, ans_by });
    answer.save()
        .then((result) => {
            res.json(result);
        })
        .catch((error) => {
            console.log('Error creating answer:', error);
            res.status(500).json({ error: 'Error creating answer' });
        });
});

app.get('/questions', (req, res) => {
    Question.find()
        .populate('tags')
        .populate('answers')
        .then((questions) => {
            res.json(questions);
        })
        .catch((error) => {
            console.log('Error retrieving questions:', error);
            res.status(500).json({ error: 'Error retrieving questions' });
        });
});

app.post('/questions', async (req, res) => {
    const { title, summary, text, tags, asked_by } = req.body;
    const tagList = [];
    for (let i = 0; i < tags.length; i++) {
        const tag = await Tag.findOne({ name: tags[i] });
        tagList.push(tag);
    }
    const question = new Question({ title: title, summary: summary, text: text, tags: tagList, asked_by: asked_by });

    await question.save()
        .then((result) => {
            res.json(result);
        })
        .catch((error) => {
            console.log('Error creating question:', error);
            res.status(500).json({ error: 'Error creating question' });
        });
});

app.put('/questions/:qid/views', async (req, res) => {
    const qid = req.params.qid;

    const question = await Question.findById(qid);

    question.views += 1;
    await question.save();
    res.status(200).json({ views: question.views });
});

app.post('/questions/:questionId/answers', async (req, res) => {
    const { text, ans_by, ans_date_time } = req.body;

    const answer = new Answer({
        text,
        ans_by,
        ans_date_time
    });

    await answer.save();

    const question = await Question.findById(req.params.questionId);
    question.answers.push(answer);
    await question.save();

    res.json(question);
});

app.get('/tags', (req, res) => {
    Tag.find()
        .then((tags) => {
            res.json(tags);
        })
        .catch((error) => {
            console.log('Error retrieving tags:', error);
            res.status(500).json({ error: 'Error retrieving tags' });
        });
});

app.post('/tags', (req, res) => {
    const { name, created_by } = req.body;
    const tag = new Tag({ name: name, created_by: created_by });
    tag.save()
        .then((result) => {
            res.json(result);
        })
        .catch((error) => {
            console.log('Error creating tag:', error);
            res.status(500).json({ error: 'Error creating tag' });
        });
});

app.listen(8000, () => {
    console.log('Server started on port 8000');
});

module.exports = router;
// Run this script to test your schema
// Start the mongoDB service as a background process before running the script
// Pass URL of your mongoDB instance as first argument(e.g., mongodb://127.0.0.1:27017/fake_so)
const adminUsername = "fakesoadmin";
const adminPassowrd = "admin123";
const adminEmail = "fakesoadmin@gmail.com";
let userArgs = process.argv.slice(2);

if (!(userArgs[0] === adminUsername)) {
    console.log('ERROR: admin username or password is incorrect');
    return
}
if (!(userArgs[1] === adminPassowrd)) {
    console.log('ERROR: admin username or password is incorrect');
    return
}

let Tag = require('./models/tags')
let Answer = require('./models/answers')
let Question = require('./models/questions')
let Comment = require('./models/comments')
let User = require('./models/users');
const bcrypt = require('bcrypt');


let mongoose = require('mongoose');
let mongoDB = "mongodb://127.0.0.1:27017/fake_so";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

function tagCreate(name, created_by) {
    let tag = new Tag({ name: name, created_by: created_by });
    return tag.save();
}

function commentCreate(text, sub_by) {
    let comment = new Comment({ text: text, sub_by: sub_by });
    return comment.save();
}

function answerCreate(text, ans_by, ans_date_time) {
    answerdetail = { text: text };
    if (ans_by != false) answerdetail.ans_by = ans_by;
    if (ans_date_time != false) answerdetail.ans_date_time = ans_date_time;

    let answer = new Answer(answerdetail);
    return answer.save();
}

function questionCreate(title, summary, text, tags, answers, asked_by, ask_date_time, views, votes, comments) {
    qstndetail = {
        title: title,
        summary: summary,
        text: text,
        tags: tags,
        asked_by: asked_by,
        votes: votes,
        comments: comments
    }
    if (answers != false) qstndetail.answers = answers;
    if (ask_date_time != false) qstndetail.ask_date_time = ask_date_time;
    if (views != false) qstndetail.views = views;

    let qstn = new Question(qstndetail);
    return qstn.save();
}

function userCreate(username, email, password, reputation) {
    userdetail = {
        username: username,
        email: email,
        password: password,
        reputation: reputation
    }
    let user = new User(userdetail);
    return user.save();
}

const populate = async () => {
    await userCreate("testUser1", "random@gmail.com", await bcrypt.hash("abc123", 10), 0, Date.now);
    await userCreate("testUser2", "cool@gmail.com", await bcrypt.hash("imsocool", 10), 0, Date.now);
    await userCreate(adminUsername, adminEmail, await bcrypt.hash(adminPassowrd, 10), 999999999, Date.now);
    let c1 = await commentCreate('This is crazy!', "testUser1");
    let c2 = await commentCreate('Yooo me too', "testUser2");
    let c3 = await commentCreate('Bruhhhh', "testUser1");
    let t1 = await tagCreate('react', "testUser1");
    let t2 = await tagCreate('javascript', "testUser2");
    let a1 = await answerCreate('SampleAnswer1', 'testUser1', false);
    let a2 = await answerCreate('I dont know.', 'testUser2', false);
    await questionCreate('Programmatically navigate using React router', 'sampleSummary1', 'I have no idea what Im looking at', [t1, t2], [a1], 'testUser1', false, 10, 0, [c1, c2]);
    await questionCreate('android studio save string shared preference', 'This is a very looooooooooong summary', 'Im too lazy to write the question so ur gonna have to read my mind', [t2], [a2], 'testUser2', false, 0, 0, [c3]);
    if (db) db.close();
    console.log('done');
}

populate()
    .catch((err) => {
        console.log('ERROR: ' + err);
        if (db) db.close();
    });

console.log('processing ...');

import LoadAnswer from "../components/LoadAnswer";



function AnswerPage({ selectedQuestion, postQuestionForm, postAnswerForm, user}) {
  
  return (
    <div> <LoadAnswer selectedQuestion={selectedQuestion} postQuestionForm = {postQuestionForm} postAnswerForm = {postAnswerForm} user = {user}/> 
    </div>
  );
}

export default AnswerPage;
// This is a sample json format for a quiz page's contentJSON field

{
  questionPool: 
  [{
    questionText: 'some multiple choice question',
    type: 'multiple',
    
    responses: 
    [{
      responseText: 'one of the choices',
      isCorrect: true
    }, 
    {
      responseText: 'a different choice'
    }, 
    {
      responseText: 'a third choice'
    }]
  }, 
  {
    questionText: 'some short answer question',
    type: 'short',
    
    correctAnswer: 'the correct answer'
  }, 
  {
    questionText: 'a rating scale question',
    type: 'rating',
    
    lowBound: 1,
    highBound: 7
  }],
  
  questionsToAsk: 2,
  
  percentToPass: 50,
  
  
}
var _ = require('underscore');
var utils = require('./utils');
var randomWords = require('random-words');

var data = {

  word: '',
  languageCode: '',
  questions: 1,
  wrongAnswers: 0

};

/**
 * get array of all the languages english translates to
 * @param  {array} results all of the languages database
 * @return {array}         array of objects of languages
 */
var getEngTos = function(results){
  var fromEnglish = _.filter(results, function(language){
    return language.from.name === 'English';
  });
  return _.map(fromEnglish, function(language){
    return language.to;
  });

};

module.exports = {

	index: function(req, res) {
    utils.beglobal.languages.all(function(err, results){

      var languages = _.pluck(getEngTos(results), 'name');
      res.render('quiz', {data: languages});
    });
  },

  startQuiz: function(req, res){
    data.word = randomWords();
    utils.beglobal.languages.all(function(err, results){
      
      var language = _.findWhere(getEngTos(results), {name: req.body.language});

      data.languageCode = language.code;
    });

    res.render('quiz-question', {
      language: req.body.language,
      word: data.word,
      question: data.questions
    });
  },

  question: function(req, res){
    data.word = randomWords();
    res.render('quiz-question', {
      language: req.body.language,
      word: data.word,
      question: data.questions
    });
  },

  answerQuiz: function(req, res){
    utils.translateWord('eng', data.languageCode, data.word, function(translated){
      // console.log(translated.translation, req.res.translation);
      var result = (translated.translation === req.body.translation)
      data.wrongAnswers += ~~!result;
      if (data.wrongAnswers === 3) {
        data.wrongAnswers = 0;
        data.questions = 1;
        res.render('quiz-fail')
      }
      var feedback = result ? "Correct!" : "Wrong, Loser!";
      if (++data.questions === 11){
        res.send('end!')
      } else {
        res.render('quiz-answer', {result: feedback, translation: translated.translation});
      }
    })
  }
};
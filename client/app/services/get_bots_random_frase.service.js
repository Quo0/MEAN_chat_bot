angular
  .module("chatApp")
  .factory("getBotsRandomFrase", [function() {
    return function getBotsRandomFrase(type){
      let selectedTypeArr;
      const welcomeFrases = [
        [`W E L C O M E `,"=)"],
        ["Welcome welcome welcome ! ! ! ! !",":Р"],
        ["SUPERRRRRRRR welcome frase3","\\(*_*)/"],
        ["OLOLOLOLOL welcome!!!","\\(+_+ )_"]
      ]
      const welcomeAgainFrases = [
        ["Hey! I'm happy you loged in again!","Haven't seen you for ages =)"],
        ["WHOOOOOW! Come on!","Didn't expect you will come back again :p","Wanna get some news?"]
      ]
      const greetAgain = [
        ["Welcome back, my friend!","Want me to show you some more cool news?)"],
        ["Hey!","Look who come back!)","Let me tell you more stories!!!"],
        ["Hello again!","Looking for some nice news articles?"]
      ]
      const inactivityFrases = [
        [`Are you here ???`],
        ["Do you even reading that i write to you?!","_(._. )\\"]
      ]
      const queryAnswerFrases = [
        ["Ok! Look what i found!"],
        ["Probably... ", "Yes! This must be the rigth article!"]
      ]
      const queryAnswerFailedFrases = [
        ["Looks like...", "Yeah... Unfortunately, i couldn't found anything"],
        ["Unfortunately...","Hm! I cant find anything you are asking for"]
      ]
      const dontUnderstandFrases = [
        [
          "Sorry, but i don't understand you...",
          "I dont speak human language very well"
        ],
        [
          "Sorry, but i don't know such command and dont understand you",
        ],
        [
          "Sorry, i don't understand you",
          "Could you repeat please one more time?",

        ],
      ]
      const helpFrases = [
        [
          "BOT show: 'your query'",
          "BOT help",
        ]
      ]

      if( type === "welcome" ){ selectedTypeArr = welcomeFrases} else
      if( type === "welcomeAgain" ){ selectedTypeArr = welcomeAgainFrases} else
      if( type === "greetAgain"){ selectedTypeArr = greetAgain} else
      if( type === "inactivity" ){ selectedTypeArr = inactivityFrases} else
      if( type === "queryAnswer" ){ selectedTypeArr = queryAnswerFrases} else
      if( type === "queryAnswerFailed" ){ selectedTypeArr = queryAnswerFailedFrases} else
      if( type === "dontUnderstand" ){ selectedTypeArr = dontUnderstandFrases } else
      if( type === "help"){ selectedTypeArr = helpFrases }

      return selectedTypeArr[Math.floor(Math.random() * selectedTypeArr.length)];
    }
  }]);

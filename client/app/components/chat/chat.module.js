angular.module("chatScreen",[])
  .component("chatScreen", {
    templateUrl: "client/app/components/chat/chat.template.html",
    controller: [
      "$http",
      "$timeout",
      "$interval",
      "addToMessageHistory",
      "queryNewsArticles",
      chatScreenCtrl
    ],
    controllerAs: "chatCtrl"
  })

function chatScreenCtrl($http, $timeout, $interval, addToMessageHistory, queryNewsArticles){
  //redirection
  const currentUser = JSON.parse(localStorage.getItem("User"))
  if(!currentUser){ window.location.hash = "#/welcome"}
  //DOM
  const messagesWindow = document.getElementById("messages-window");
  //
  const API_KEY = "16f021a3d7ed41c9a205cd87a7c877a5";
  //
  const botsCommands = {
    query: /^BOT show( me){0,1}:\s(\w{1,}\s{0,1}){1,}$/,
    help: /^BOT help( me){0,1}/
  }
  let inactivityTime = 0;
  let inactivityTimer;
  this.User = currentUser;
  this.latestMessages = [];
  this.oldMessages = [];
  this.showOnLoadLimit = 30;
  this.notificationCount = 0;
  //methods
  this.activateBot = activateBot;
  this.onSubmit = onSubmit;
  this.onSearchQueryChange = onSearchQueryChange;
  this.clearSearchQuery = clearSearchQuery;
  this.onTextAdded = onTextAdded;
  this.scrollToNewMessages = scrollToNewMessages;
  this.logOut = logOut;
  //
  this.getLatestMessages = getLatestMessages;
  this.getSomePreviousMessages = getSomePreviousMessages;
  //
  this.showBotsWelcome = showBotsWelcome;
  this.getBotsRandomFrase = getBotsRandomFrase;
  this.showBotsQueryAnswer = showBotsQueryAnswer;
  this.getLatestMessages();
  this.activateBot();

  // func bodies

  function getLatestMessages(){
    const req = {
      method: "GET",
      url: `/chat/${this.User.id}`,
      headers: {
        "Content-Type":"application/JSON"
      },
      params: {
        limit: this.showOnLoadLimit
      }
    }
    $http(req)
      .then(serverResponse=>{
        const latestMessages = serverResponse.data;
        latestMessages.forEach(message=>{
          message.text = JSON.parse(message.text)
        });
        this.latestMessages = latestMessages;
        forceScrollToTheBottom();
      })
      .catch(err=>{
        console.error(err);
      })
  }
  function getSomePreviousMessages(){
    const newOffset = this.latestMessages.length + this.oldMessages.length;
    const req = {
      method: "GET",
      url: `/chat/${this.User.id}`,
      headers: {
        "Content-Type":"application/JSON"
      },
      params: {
        offset: newOffset,
        limit: this.showOnLoadLimit
      }
    }
    $http(req)
      .then(serverResponse=>{
        console.log(serverResponse);
        if(serverResponse.data.fetched){
          this.nothingToLoad = true;
          const restMessages = serverResponse.data.lastRecords;
          restMessages.reverse().forEach(message=>{
            message.text = JSON.parse(message.text);
            this.oldMessages.unshift(message)
          })
            this.loadingInProgress = false;
        } else {
          const restMessages = serverResponse.data;
          restMessages.reverse().forEach(message=>{
            message.text = JSON.parse(message.text);
            this.oldMessages.unshift(message)
          })
          this.loadingInProgress = false;
        }
      })
      .catch(err=>{
        console.error(err);
      })
    // return $timeout(()=>{},0)
  }

  function onSearchQueryChange(){
    if(this.searchQuery != ""){
      const req = {
        method: "GET",
        url: `/chat/${this.User.id}/${this.searchQuery}`,
        headers: {
          "Content-Type":"application/JSON"
        }
      }
      $http(req)
      .then(serverResponse=>{
        console.log(serverResponse);
        const filteredData = serverResponse.data;
        filteredData.forEach(message=>{
          message.text = JSON.parse(message.text)
        });
        this.latestMessages = filteredData;
        this.oldMessages = [];
        forceScrollToTheBottom();
      })
    } else {
      this.getLatestMessages();
    }
  }

  function activateBot(){
    //  if msg hist
    if( Date.parse(new Date()) - Date.parse(this.User.loginTime ) < 5000 ){
      $timeout(()=>{
        //typing... emulation
        this.botIsBusy = true;
        tryToScrollToTheBottom.call(this, getScrollBottomPosition() , "typing");
        $timeout(()=>{
          this.showBotsWelcome(this.User);
          this.botIsBusy = false;
          startInactivityTimer.call(this);
        }, 3500); // time he will type the msg
      }, 2500) // time before he start typing
    } else {
      $timeout(()=>{
        //typing... emulation
        this.botIsBusy = true;
        tryToScrollToTheBottom.call(this, getScrollBottomPosition(), "typing");
        $timeout(()=>{
          this.botIsBusy = false;
          greetAgain.call(this);
          startInactivityTimer.call(this);
        }, 2500);// time he will type the msg
      }, 1500)// time before he start typing
    }
    tryToScrollToTheBottom.call(this, getScrollBottomPosition());
  }

  // bots functions

  function showBotsQueryAnswer(User, query){
    const url = 'https://newsapi.org/v2/everything?' +
          `q="${query}"&` +
          'from=2018-09-10&' +
          'sortBy=relevancy&' +
          `apiKey=${API_KEY}`;
    queryNewsArticles(url)
      .then(newsApiResponse=>{
        console.log(newsApiResponse);
        let message;
        if(newsApiResponse.data.articles.length > 0){
          const randomN = Math.floor(Math.random() * newsApiResponse.data.articles.length)
          const randomArt = newsApiResponse.data.articles[randomN]
          const botsRandomSearchQueryFrase = getBotsRandomFrase("queryAnswer");
          message = {
            type: "queryAnswer",
            frases: botsRandomSearchQueryFrase,
            article: randomArt
          }
        } else {
          const botsRandomSearchQueryFailedFrase = getBotsRandomFrase("queryAnswerFailed");
          message = {
            type: "queryAnswerFailed",
            frases: botsRandomSearchQueryFailedFrase
          }
        }
        return addToMessageHistory( User, "BOT" , message)
      })
      .then(serverResponse=>{
        serverResponse.data.text = JSON.parse(serverResponse.data.text);
        this.latestMessages.push(serverResponse.data);
        tryToScrollToTheBottom.call(this, getScrollBottomPosition());
      })
      .catch(err=>{
        console.log(err);
      })
  }

  function showBotsWelcome(User){
    const url = 'https://newsapi.org/v2/top-headlines?' +
    'country=us&' +
    `apiKey=${API_KEY}`;
    queryNewsArticles(url)
      .then(newsApiResponse=>{
        console.log(newsApiResponse);
        const randomN = Math.floor(Math.random() * newsApiResponse.data.articles.length)
        const randomArt = newsApiResponse.data.articles[randomN]
        const botsRandomWelcomeFrase = this.getBotsRandomFrase("welcome");
        const message = {
          type: "welcome",
          frases: botsRandomWelcomeFrase,
          article: randomArt
        }
        return addToMessageHistory( User, "BOT" , message)
      })
      .then(serverResponse=>{
        serverResponse.data.text = JSON.parse(serverResponse.data.text);
        this.latestMessages.push(serverResponse.data)
        tryToScrollToTheBottom.call(this, getScrollBottomPosition());
      })
      .catch(err=>{
        console.log(err);
      })
  }
  // bots frases
  function getBotsRandomFrase(type){
    let selectedTypeArr;
    const welcomeFrases = [
      [`W E L C O M E `,"=)"],
      ["Welcome welcome welcome ! ! ! ! !",":Р"],
      ["SUPERRRRRRRR welcome frase3","\\(*_*)/"],
      ["OLOLOLOLOL welcome!!!","\\(+_+ )_"]
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
    if( type === "greetAgain"){ selectedTypeArr = greetAgain} else
    if( type === "inactivity" ){ selectedTypeArr = inactivityFrases} else
    if( type === "queryAnswer" ){ selectedTypeArr = queryAnswerFrases} else
    if( type === "queryAnswerFailed" ){ selectedTypeArr = queryAnswerFailedFrases} else
    if( type === "dontUnderstand" ){ selectedTypeArr = dontUnderstandFrases } else
    if( type === "help"){ selectedTypeArr = helpFrases }

    return selectedTypeArr[Math.floor(Math.random() * selectedTypeArr.length)];
  }

  // user's functions

  function onSubmit(){
    if(this.newMessage){
      const currentMessage = this.newMessage;
      this.newMessage = "";
      inactivityTime = 0;
      addToMessageHistory(this.User, this.User.name, currentMessage)
        .then(serverResponse=>{
          serverResponse.data.text = JSON.parse(serverResponse.data.text);
          this.latestMessages.push(serverResponse.data);
          $interval.cancel(inactivityTimer);
          startInactivityTimer.call(this);
          forceScrollToTheBottom();
        })
        .then(()=>{
          return $timeout(()=>{
            this.botIsBusy = true;
            tryToScrollToTheBottom.call(this, getScrollBottomPosition(), "typing");
          }, 1000)
        })
        .then(()=>{
          if( currentMessage.match( botsCommands.query ) ){
            const queryIndex = currentMessage.indexOf(":") + 2 ;
            const query = currentMessage.slice(queryIndex);
            $timeout(()=>{
              this.botIsBusy = false;
              this.showBotsQueryAnswer(this.User, query);
            }, 3000)
          } else
          if( currentMessage.match( botsCommands.help ) ){
            $timeout(()=>{
              this.botIsBusy = false;
              showBotHelp.call(this);
            }, 2500)
          } else {
            $timeout(()=>{
              this.botIsBusy = false;
              showBotDontUnderstand.call(this);
            }, 2000)
          }
        })
        .then(()=>{

        })
        .catch(err=>{
          console.log(err);
        })
    }
  }

  function greetAgain(){
    const botsRandomHelpFrase = getBotsRandomFrase("greetAgain");
    const message = {
      type: "greetAgain",
      frases: botsRandomHelpFrase
    }
    addToMessageHistory( this.User, "BOT" , message)
      .then(serverResponse=>{
        serverResponse.data.text = JSON.parse(serverResponse.data.text);
        this.latestMessages.push(serverResponse.data);
        tryToScrollToTheBottom.call(this, getScrollBottomPosition());
      })
      .catch(err=>{
        console.log(err);
      })
  }

  function showBotHelp(){
    const botsRandomHelpFrase = getBotsRandomFrase("help");
    const message = {
      type: "help",
      frases: botsRandomHelpFrase
    }
    addToMessageHistory( this.User, "BOT" , message)
      .then(serverResponse=>{
        serverResponse.data.text = JSON.parse(serverResponse.data.text);
        this.latestMessages.push(serverResponse.data);
        tryToScrollToTheBottom.call(this, getScrollBottomPosition());
      })
      .catch(err=>{
        console.log(err);
      })
  }

  function showBotsInactivity(forcedMessage){
    let botsRandomInactivityFrase;
    if(forcedMessage){
      botsRandomInactivityFrase = [forcedMessage];
    } else {
      botsRandomInactivityFrase = getBotsRandomFrase("inactivity");
    }
    const message = {
      type: "inactivity",
      frases: botsRandomInactivityFrase
    }
    addToMessageHistory( this.User, "BOT" , message)
      .then(serverResponse=>{
        serverResponse.data.text = JSON.parse(serverResponse.data.text);
        this.latestMessages.push(serverResponse.data);
        tryToScrollToTheBottom.call(this, getScrollBottomPosition());
      })
      .catch(err=>{
        console.log(err);
      })
  }

  function showBotDontUnderstand(){
    const botsRandomDontUnderstandFrase = getBotsRandomFrase("dontUnderstand");
    const message = {
      type: "dontUnderstand",
      frases: botsRandomDontUnderstandFrase
    }
    addToMessageHistory( this.User, "BOT" , message)
      .then(serverResponse=>{
        serverResponse.data.text = JSON.parse(serverResponse.data.text);
        this.latestMessages.push(serverResponse.data);
        tryToScrollToTheBottom.call(this, getScrollBottomPosition());
      })
      .catch(err=>{
        console.log(err);
      })
  }

  function startInactivityTimer(){
    let ignoreTimes = 0;
    let botIsTyping;
    inactivityTimer = $interval(()=>{
      inactivityTime++ ;
      if(inactivityTime > 32 && !botIsTyping){ /// here you can set frase delay
        ignoreTimes++ ;
        botIsTyping = true;
        if(ignoreTimes > 1){
          $timeout(()=>{
            //typing... emulation
            this.botIsBusy = true;
            inactivityTime = 0;
            tryToScrollToTheBottom.call(this, getScrollBottomPosition(), "typing");
            $timeout(()=>{
              showBotsInactivity.call(this,"OK! i can see you dont have time or smthg...");
              $interval.cancel(inactivityTimer);
              this.botIsBusy = false;
              botIsTyping = false;
              inactivityTime = 0;
              return
            }, 2500) // time he will type the msg
          }, 1500) // time before he start typing
        } else {
          $timeout(()=>{
            //typing... emulation
            this.botIsBusy = true;
            inactivityTime = 0;
            tryToScrollToTheBottom.call(this, getScrollBottomPosition(), "typing");
            $timeout(()=>{
              this.botIsBusy = false;
              showBotsInactivity.call(this);
              inactivityTime = 0;
              botIsTyping = false;
            }, 2500); // time he will type the msg
          }, 1500) // time before he start typing
        }
      }
    }, 1000) // count++ every second
  };

  function scrollToNewMessages(){
    forceScrollToTheBottom();
  }

  function logOut(){
    $interval.cancel(inactivityTimer);
    localStorage.clear();
    window.location.hash = "#/welcome"
  }

  function clearSearchQuery(){
    if(this.searchQuery){
      this.searchQuery = "";
      this.latestMessages = [];
      $timeout(()=>{
        this.getLatestMessages();
      },0)
    }
  }

  function getScrollBottomPosition(){
    return messagesWindow.scrollHeight - messagesWindow.clientHeight - messagesWindow.scrollTop;
  }

  function forceScrollToTheBottom(){
    $timeout(()=>{
      messagesWindow.scrollTop = messagesWindow.scrollHeight - messagesWindow.offsetHeight;
    }, 0)
  }

  function tryToScrollToTheBottom(prevPosition, typing){
    if(prevPosition <= 1){
      this.atBottom = true;
      $timeout(()=>{
        messagesWindow.scrollTop = messagesWindow.scrollHeight - messagesWindow.offsetHeight;
      }, 0)
    } else {
      this.atBottom = false;
      if(!typing){
        this.notificationCount++;
      }
    }
  }

  function onTextAdded(e){
    if(e.code === "Enter" && !e.shiftKey){
      this.onSubmit();
    }
    if(e.code === "Enter" && e.shiftKey){
      this.newMessage+="\n"
    }
  }

  messagesWindow.onscroll = ()=>{
    if(getScrollBottomPosition() <= 1){
      this.atBottom = true;
      $timeout(()=>{
        this.notificationCount = 0; // becouse of inactivityTimer
      },0)
    } else {
      this.atBottom = false;
    }
    const latestUl = document.querySelector("#latest-messages");
    const messagesShowed = latestUl.querySelectorAll(".repeated-list").length;
    if( messagesWindow.scrollTop <= 1 &&
        messagesShowed >= this.showOnLoadLimit &&
        !this.nothingToLoad &&
        !this.loadingInProgress ){
      const topUl = document.querySelector("#old-messages") || latestUl;
      console.log(topUl);
      const lastList = topUl.querySelector("li");
      $timeout(()=>{
        console.log("step1");
        this.loadingInProgress = true;
        return $timeout(()=>{},0);
      }, 0)
      .then(()=>{
        console.log("step2");
        return $timeout(()=>{
          this.getSomePreviousMessages();
          console.log(lastList);
          lastList.scrollIntoView()
          messagesWindow.scrollTop = messagesWindow.scrollTop - 14 // for smoothing(1em - 2px);
        } , 2500)
      })
      .then(()=>{
        console.log("step3");
        return $timeout(()=>{
          messagesWindow.scrollTop = messagesWindow.scrollTop - 80
        } , 150)
      })
    }
  }
}

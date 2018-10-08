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
  const chatHeader = document.querySelector(".chat-header");
  const actionButtons = chatHeader.querySelector(".action-buttons");
  const burger = chatHeader.querySelector("#burger");
  //
  const API_KEY = "16f021a3d7ed41c9a205cd87a7c877a5";
  //
  const botsCommands = {
    query: /^BOT show( me){0,1}:\s(\w{1,}\s{0,1}){1,}$/,
    help: /^BOT help( me){0,1}/
  }
  let inactivityTime = 0;
  let inactivityTimer;
  let hoveredOverMenuTime = 0;
  let hoveredOverMenuTimer;
  let notScrolledUpTimer = 0;
  this.User = currentUser;
  this.DISPLAYED_MESSAGES = [];
  this.showOnLoadLimit = 50;
  this.notificationCount = 0;
  //methods
  this.activateBot = activateBot;
  this.onSubmit = onSubmit;
  this.onSearchQueryChange = onSearchQueryChange;
  this.clearSearchQuery = clearSearchQuery;
  this.onTextAdded = onTextAdded;
  this.scrollToNewMessages = scrollToNewMessages;
  this.showMenu = showMenu;
  this.hideMenu = hideMenu;
  this.logOut = logOut;
  this.resetHoverOverMenuTimer = resetHoverOverMenuTimer;
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
        this.DISPLAYED_MESSAGES = latestMessages;
        forceScrollToTheBottom();
      })
      .catch(err=>{
        console.error(err);
      })
  }
  function getSomePreviousMessages(){
    const newOffset = this.DISPLAYED_MESSAGES.length;
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
          if(messagesWindow.scrollTop <= 1){
            messagesWindow.scrollTop = messagesWindow.scrollTop + 1; // shit fix
          }
          restMessages.reverse().forEach(message=>{
            message.text = JSON.parse(message.text);
            this.DISPLAYED_MESSAGES.unshift(message)
          })
          this.loadingInProgress = false;
        } else {
          const restMessages = serverResponse.data;
          if(messagesWindow.scrollTop <= 1){
            messagesWindow.scrollTop = messagesWindow.scrollTop + 1; // shit fix
          }
          restMessages.reverse().forEach(message=>{
            message.text = JSON.parse(message.text);
            this.DISPLAYED_MESSAGES.unshift(message)
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
        this.DISPLAYED_MESSAGES = filteredData;
        forceScrollToTheBottom();
      })
    } else {
      this.getLatestMessages();
      hideMenu.call(this);
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
        this.DISPLAYED_MESSAGES.push(serverResponse.data);
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
        this.DISPLAYED_MESSAGES.push(serverResponse.data)
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
      if(this.newMessage.trim() != ""){
        const currentMessage = this.newMessage;
        this.newMessage = "";
        inactivityTime = 0;
        addToMessageHistory(this.User, this.User.name, currentMessage)
          .then(serverResponse=>{
            serverResponse.data.text = JSON.parse(serverResponse.data.text);
            this.DISPLAYED_MESSAGES.push(serverResponse.data);
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
        this.DISPLAYED_MESSAGES.push(serverResponse.data);
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
        this.DISPLAYED_MESSAGES.push(serverResponse.data);
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
        this.DISPLAYED_MESSAGES.push(serverResponse.data);
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
        this.DISPLAYED_MESSAGES.push(serverResponse.data);
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

  function showMenu(){
    if(!this.menuBeenHovered){
      burger.classList.add("burger-hovered");
      const promice = (()=>{
        this.menuBeenHovered = true;
        return $timeout(()=>{
          burger.style.opacity = 0;
        }, 1500)
      })();
      promice
        .then(()=>{
          return $timeout(()=>{
            // wait a bit before the hiding burger
          }, 200)
        })
        .then(()=>{
          burger.style.display = "none";
          actionButtons.style.display = "flex";
        })
        .catch(err=>{
          console.error(3);
        })
    }
  }
  function hideMenu(){
    if(this.menuBeenHovered){
      hoveredOverMenuTimer = $interval(()=>{
        hoveredOverMenuTime ++;
        if(hoveredOverMenuTime > 3){
          if(!this.searchQuery){
            this.menuBeenHovered = false;
            this.searchFieldShown = false;
            burger.classList.remove("burger-hovered");
            burger.classList.add("burger-showed-back");
            burger.style.opacity = 1;
            burger.style.display = "block";
            actionButtons.style.display = "none";
          } else {
            hoveredOverMenuTime = 0;
          }
          $interval.cancel(hoveredOverMenuTimer);
        }
      },1000)
    }
  }

  function resetHoverOverMenuTimer(){
    hoveredOverMenuTime = 0;
    $interval.cancel(hoveredOverMenuTimer);
  }

  function logOut(){
    $interval.cancel(inactivityTimer);
    localStorage.clear();
    window.location.hash = "#/welcome"
  }

  function clearSearchQuery(){
    this.searchFieldShown = !this.searchFieldShown
    if(this.searchQuery){
      this.searchQuery = "";
      this.DISPLAYED_MESSAGES = [];
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
      if(this.newMessage.trim() != ""){
        this.onSubmit();
      } else {
        this.newMessage = "";
      }
    }
    if(e.code === "Enter" && e.shiftKey){
      this.newMessage+="";
    }
  }

  messagesWindow.onscroll = ()=>{
    // rules for BOTTOM
    if(getScrollBottomPosition() <= 1){
      this.atBottom = true;
      $timeout(()=>{
        this.notificationCount = 0; // becouse of inactivityTimer
      },0)
    } else {
      this.atBottom = false;
    }
    // rules for TOP
    const lessThanPersentage = messagesWindow.scrollTop / messagesWindow.scrollHeight * 100 < 40 ;
    const latestUl = document.querySelector("#latest-messages");
    const messagesShowed = latestUl.querySelectorAll(".repeated-list").length;
    if( lessThanPersentage && messagesShowed >= this.showOnLoadLimit &&
        !this.nothingToLoad && !this.loadingInProgress ){
      console.log(messagesWindow.scrollTop / messagesWindow.scrollHeight * 100);
      const lastList = latestUl.querySelector("li");
      this.loadingInProgress = true;
      console.log("lzlzlzl" , this.loadingInProgress);
      $timeout(()=>{
        this.getSomePreviousMessages();
      } , 500);
    }
    // cutting the list
    if(this.DISPLAYED_MESSAGES.length > 200){
      if(this.atBottom && notScrolledUpTimer === 0){
        $timeout.cancel(notScrolledUpTimer);
        // console.log("started timer");
        notScrolledUpTimer = $timeout(()=>{
          this.DISPLAYED_MESSAGES = this.DISPLAYED_MESSAGES.slice(-this.showOnLoadLimit);
          this.nothingToLoad = false;
          // console.log("CUTTED");
        }, 10000);
      };
      if(!this.atBottom){
        // console.log("timer is cleared");
        $timeout.cancel(notScrolledUpTimer);
        notScrolledUpTimer = 0;
      }
    }
  }
}

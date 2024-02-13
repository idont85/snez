import React, { useState, useEffect, useRef } from 'react';
import { firestore } from './firebaseConfig';
import './chat.css';
import logoImage from './logo.png';
import Linkify from 'react-linkify';

const PAGE_SIZE = 18; // Number of messages to fetch per page
const INACTIVITY_TIMEOUT = 1080000; // 1 minute in milliseconds

const badWords = ['fuck', 'ass', 'shit', 'bitch', 'nigger', 'dick', 'motherfucker', 'cock', 'fucker', 'asscock', 'penis','fucking','shitting','asshole','niger','trump','faggot','nigglet']; // List of bad words
const badNames = ['fuck', 'ass', 'shit', 'bitch', 'nigger', 'dick', 'motherfucker', 'cock', 'fucker', 'asscock', 'penis','fucking','shitting','asshole','niger','trump','System','system','faggot','nigglet']; // List of bad user names
const AUTHORIZATION_PASSWORD = 'bissell16'; 

function Chat() {
  const currentversion = '6.3.6'
  const buttonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copyButtonStates, setCopyButtonStates] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [currentTime, setCurrentTime] = useState(getFormattedTime()) 
  const [loginCountdown, setLoginCountdown] = useState(20);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  const [isBanned, setIsBanned] = useState(false); // Track user ban status
  const [showPasswordRequiredOptions, setShowPasswordRequiredOptions] = useState(false); // Track visibility of password-required options
  const messageBoxRef = useRef(null);
  const inputRef = useRef(null);
  const usernameInputRef = useRef(null);
  const messageReceivedSoundRef = useRef(new Audio('https://raw.githubusercontent.com/idont85/Sounds/master/message-receive-[AudioTrimmer.com]%20(1).mp3'));
  const lastMessageRef = useRef(null);
  const banTimeoutRef = useRef(null);
  var temporary = ""
  const emojiMap = {
    ':skull:': '💀',
    ':sad:': '☹️',
    ':happy:': '😀',
    ':crying:': '😢',
    ':mad:': '😡',
    ':sob:': '😭',
    ':)': '😀',
    ':(': '☹️',
    ':duck:': '🦆',
    ':chicken:': '🐔',
    ':chick:': '🐤',
    ':school:': '🏫',
    ':car:': '🚗',
    ':nerd:': '🤓',
    ':cat:': '😺',
    ':happycat:': '😸',
    ':madcat:': '😾',
    ':blackcat:': '🐈‍⬛',
    ':cryingcat:': '😿',
    ':mao:': 'ᕙ(⇀‸↼‶)ᕗ',
    ':sk:': 'hah. you got no skill bud | LLL',
    ':sadcat:': '😿',
    ':ban:': '🔨',
    ':cap:': '🧢',
    ':thumbsup:': '👍',
    ':thumbsdown:': '👎',
    ':fire:': '🔥',
    ':cool:': '😎',
    ':love:': '❤️',
    ':laugh:': '😂',
    ':wizard:': '🧙‍♂️',
    ':star:': '⭐️',
    ':alien:': '👽',
    ':flower:': '🌸',
    ':pizza:': '🍕',
    ':coffee:': '☕',
    ':book:': '📚',
    ':moon:': '🌙',
    ':sun:': '☀️',
    ':rainbow:': '🌈',
    ':ghost:': '👻',
    ':tada:': '🎉',
    ':rocket:': '🚀',
    ':money:': '💰',
    ':clap:': '👏',
    ':confused:': '😕',
    ':sunglasses:': '😎',
    ':tongue:': '😛',
    ':unicorn:': '🦄',
    ':zap:': '⚡',
    ':sweat:': '😓',
    ':penguin:': '🐧',
    ':guitar:': '🎸',
    ':camera:': '📷',
    ':microphone:': '🎤',
    ':soccer:': '⚽',
    ':cookie:': '🍪',
    ':birthday:': '🎂',
    ':party:': '🎉',
    ':flag:': '🚩',
    ':mapleleaf:': '🍁',
    ':fireworks:': '🎆',
    ':dizzy:': '💫',
    ':globe:': '🌐',
    ':bulb:': '💡',
    ':tv:': '📺',
    ':robot:': '🤖',
    ':octopus:': '🐙',
    ':shark:': '🦈',
    ':panda:': '🐼',
    ':rose:': '🌹',
    ':muscle:': '💪',
    ':medal:': '🏅',
    ':trophy:': '🏆',
    ':apple:': '🍎',
    ':mushroom:': '🍄',
    ':cookie:': '🍪',
    ':lemon:': '🍋',
    ':hamburger:': '🍔',
    ':pill:': '💊',
    ':sunflower:': '🌻',
    ':rain:': '🌧️',
    ':snowman:': '☃️',
    ':tent:': '⛺',
    ':cactus:': '🌵',
    ':volcano:': '🌋',
    ':cameraflash:': '📸',
    ':gun:': '🔫',
    ':crossedfingers:': '🤞',
    ':peace:': '✌️',
    ':boxinggloves:': '🥊',
    ':skateboard:': '🛹',
    ':surfboard:': '🏄‍♂️',
    ':bicycle:': '🚴',
    ':swimmer:': '🏊',
    ':running:': '🏃‍♂️',
    ':weightlifting:': '🏋️',
    ':umbrella:': '☔',
    ':clock:': '🕰️',
    ':telephone:': '☎️',
    ':email:': '📧',
    ':briefcase:': '💼',
    ':toolbox:': '🧰',
    ':laptop:': '💻',
    ':desktop:': '🖥️',
    ':printer:': '🖨️',
    ':keyboard:': '⌨️',
    ':mouse:': '🖱️',
    ':loudspeaker:': '🔊',
    ':headphones:': '🎧',
    ':microphone2:': '🎙️',
    ':dvd:': '📀',
    ':tophat:': '🎩',
    ':crown:': '👑',
    ':ring:': '💍',
    ':lipstick:': '💄',
    ':nailpolish:': '💅',
    ':shirt:': '👕',
    ':jeans:': '👖',
    ':dress:': '👗',
    ':sandal:': '👡',
    ':boot:': '👢',
    ':bikini:': '👙',
    ':scarf:': '🧣',
    ':gloves:': '🧤',
    ':umbrella2:': '☂️',
    ':eyeglasses:': '👓',
    ':dizzyface:': '😵',
    ':facepalm:': '🤦',
    ':clown:': '🤡',
    ':zombie:': '🧟‍♂️',
    ':juggling:': '🤹‍♂️',
    ':mage:': '🧙‍♀️',
    ':vampire:': '🧛‍♂️',
    ':mermaid:': '🧜‍♀️',
    ':elf:': '🧝‍♂️',
    ':superhero:': '🦸‍♂️',
    ':supervillain:': '🦹‍♂️',
    ':mage2:': '🧙‍♂️',
    ':fairy:': '🧚‍♀️',
    ':genie:': '🧞‍♂️',
    ':ghost2:': '👻',
    ':robot2:': '🤖',
    ':alien2:': '👽',
    ':rocket2:': '🚀',
    ':fire2:': '🔥',
    ':earth:': '🌍',
    ':globe2:': '🌐',
    ':sun2:': '☀️',
    ':moon2:': '🌙',
    ':star2:': '⭐️',
    ':cloud:': '☁️',
    ':rain:': '🌧️',
    ':umbrella3:': '☔',
    ':snowflake:': '❄️',
    ':tornado:': '🌪️',
    ':fog:': '🌫️',
    ':thunderstorm:': '⛈️',
    ':rainbow2:': '🌈',
    ':ocean:': '🌊',
    ':desert:': '🏜️',
    ':mountain:': '⛰️',
    ':volcano2:': '🌋',
    ':island:': '🏝️',
    ':city:': '🏙️',
    ':house:': '🏠',
    ':building:': '🏢',
    ':office:': '🏣',
    ':hospital:': '🏥',
    ':bank:': '🏦',
    ':hotel:': '🏨',
    ':school2:': '🏫',
    ':church:': '⛪',
    ':mosque:': '🕌',
    ':synagogue:': '🕍',
    ':stadium:': '🏟️',
    ':park:': '🏞️',
    ':bridge:': '🌉',
    ':tent2:': '⛺',
    ':factory:': '🏭',
    ':oil:': '🛢️',
    ':railway:': '🛤️',
    ':airplane:': '✈️',
    ':helicopter:': '🚁',
    ':car2:': '🚗',
    ':truck:': '🚚',
    ':bus:': '🚌',
    ':bike:': '🚲',
    ':motorcycle:': '🏍️',
    ':scooter:': '🛴',
    ':boat:': '⛵',
    ':ship:': '🚢',
    ':rocket3:': '🚀',
    ':train:': '🚂',
    ':tram:': '🚊',
    ':taxi:': '🚕',
    ':police:': '🚓',
    ':ambulance:': '🚑',
    ':firetruck:': '🚒',
    ':construction:': '🚧',
    ':fuel:': '⛽',
    ':stop:': '🛑',
    ':warning:': '⚠️',
    ':speed:': '🚦',
    ':trafficlight:': '🚥',
    ':railroad:': '🛤️',
    ':bicycle2:': '🚴',
    ':wheelchair:': '♿',
    ':atm:': '🏧',
    ':restroom:': '🚻',
    ':bell:': '🔔',
    ':key:': '🔑',
    ':lock:': '🔒',
    ':unlock:': '🔓',
    ':hammer:': '🔨',
    ':axe:': '🪓',
    ':screwdriver:': '🪛',
    ':wrench:': '🔧',
    ':knife:': '🔪',
    ':gun2:': '🔫',
    ':bomb:': '💣',
    ':fireextinguisher:': '🧯',
    ':shield:': '🛡️',
    ':compass:': '🧭',
    ':magnifyingglass:': '🔍',
    ':flashlight:': '🔦',
    ':id:': '🆔',
    ':creditcard:': '💳',
    ':moneybag:': '💰',
    ':coin:': '🪙',
    ':wallet:': '👛',
    ':purse:': '👝',
    ':shoppingbag:': '🛍️',
    ':gift:': '🎁',
    ':ticket:': '🎫',
    ':receipt:': '🧾',
    ':computer:': '💻',
    ':printer2:': '🖨️',
    ':mouse2:': '🖱️',
    ':keyboard2:': '⌨️',
    ':monitor:': '🖥️',
    ':cpu:': '🧠',
    ':memory:': '🖲️',
    ':cd:': '💿',
    ':dvd2:': '📀',
    ':phone:': '📞',
    ':telephone2:': '☎️',
    ':pager:': '📟',
    ':fax:': '📠',
    ':tv2:': '📺',
    ':camera2:': '📷',
    ':video:': '📹',
    ':movie:': '🎥',
    ':microphone3:': '🎙️',
    ':headphones2:': '🎧',
    ':radio:': '📻',
    ':clock2:': '🕰️',
    ':alarm:': '⏰',
    ':stopwatch:': '⏱️',
    ':timer:': '⏲️',
    ':hourglass:': '⌛',
    ':battery:': '🔋',
    ':electricplug:': '🔌',
    ':bulb2:': '💡',
    ':flashlight2:': '🔦',
    ':candle:': '🕯️',
    ':wastebasket:': '🗑️',
    ':oil2:': '🛢️',
    ':money2:': '💰',
    ':shoppingcart:': '🛒',
    ':mailbox:': '📬',
    ':mailboxclosed:': '📪',
    ':mailboxwithmail:': '📬',
    ':mailboxwithnomail:': '📭',
    ':postbox:': '📮',
    ':moyai:': '🗿',
    ':thermometer:': '🌡️',
    ':umbrella4:': '☔',
    ':dodo:': '🦤',
  }
  
  const handleButtonClick = () => {
    // Check if the buttonRef is defined
    if (buttonRef.current) {
      // Use the ref to access the button element and click it
      buttonRef.current.click();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(getFormattedTime());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  function getFormattedTime() {
    const now = new Date();
    const hours = now.getHours() % 12 || 12; // Convert to 12-hour format
    const minutes = now.getMinutes();
    const period = now.getHours() < 12 ? 'A.M.' : 'P.M.';

    return `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${period}`;
  }

  
  useEffect(() => {
    const intervalId = setInterval(() => {
      handleAutoDeleteUsers();
      console.log("ran")
    }, 4 *  60 * 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run it only once when the component mounts


  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    const unsubscribeMessages = firestore
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(PAGE_SIZE)
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(data.reverse());

        const lastMessage = data[data.length - 1];
        if (lastMessage && lastMessage.sender !== userName) {
          playMessageReceivedSound();
        }

        if (data.length > 0) {
          lastMessageRef.current = snapshot.docs[snapshot.docs.length - 1];
        }

        scrollToBottom();
      });

      const isUserAuthorized = document.cookie.includes('chat_authorized=true');
      if (isUserAuthorized) {
        // If authorized, proceed to the default loading screen
        setIsAuthorized(true);
      }

      const savedLocalName = localStorage.getItem('localUsername');

      if (savedLocalName) {
        setUserName(savedLocalName);
        addOnlineUser(savedLocalName);
      }


      const loadingTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 3200);


    const unsubscribeOnlineUsers = firestore.collection('onlineUsers').onSnapshot(snapshot => {
      const onlineUserNames = snapshot.docs.map(doc => doc.id);
      setOnlineUsers(onlineUserNames);
    });

    document.addEventListener('keydown', (event) => {
      // Check if the key pressed is 'i' and the Ctrl key is also pressed
      if (event.key === 'i' && (event.ctrlKey || event.metaKey)) {
        // Remove focus from the currently focused input element
        const focusedInput = document.activeElement;
        if (focusedInput && focusedInput.tagName === 'INPUT') {
          focusedInput.blur();
        }
      }
    });

    window.addEventListener('beforeunload', () => {
      if (userName) {
        removeOnlineUser(userName);
      }
    });

    const inactivityInterval = setInterval(() => {
      if (Date.now() - lastActiveTime > INACTIVITY_TIMEOUT) {
        removeOnlineUser(userName);
      }
    }, 1080000);

    const unsubscribeBanMessages = firestore
      .collection('banMessages')
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const banMessage = change.doc.data();
            if (banMessage.username === userName) {
              // Set a cookie to ban the user
              document.cookie = 'chat_banned=true; max-age=20'; // Ban for 20 seconds
              setIsBanned(true); // Set user as banned
              banTimeoutRef.current = setTimeout(() => {
                setIsBanned(false); // Unban user after 20 seconds
                document.cookie = 'chat_banned=; max-age=0'; // Remove the ban cookie
              }, 25000); // 20 seconds in milliseconds

            }
          }
        });
      });



    return () => {
      document.removeEventListener('keydown', handleKeydown);
      clearTimeout(loadingTimeout);
      unsubscribeMessages();
      unsubscribeOnlineUsers();
      clearInterval(inactivityInterval);
      clearTimeout(typingTimeout);
      clearTimeout(banTimeoutRef.current); // Clear the ban timeout when the component unmounts
      unsubscribeBanMessages();
      window.removeEventListener('beforeunload', () => {
        if (userName) {
          removeOnlineUser(userName);
        }
      });
      unsubscribeBanMessages();
    };
  }, [typingTimeout, userName, lastActiveTime]);

  const startLoginCountdown = () => {
    const countdownInterval = setInterval(() => {
      setLoginCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    setTimeout(() => {
      clearInterval(countdownInterval);
      document.cookie = 'chat_authorized=true; max-age=4320000; samesite=None; secure'; // Authorized for 20 seconds
      window.location.reload();
    }, 20000);
  };

  const handleLoginClick = () => {
    // Check if the countdown is not already running
    if (loginCountdown === 20) {
      startLoginCountdown();
    }
  };

  const handleKeydown = (e) => {
    // Check if any input element is focused
    const inputs = document.querySelectorAll('input');
    const textareas = document.querySelectorAll('textarea');
    const focusedInputs = Array.from(inputs).filter((input) => input === document.activeElement);
    const focusedTextareas = Array.from(textareas).filter(
      (textarea) => textarea === document.activeElement
    );
  
    // If no input element is focused, you can execute keybind actions
    if (focusedInputs.length === 0 && focusedTextareas.length === 0) {
      // Check which key was pressed
      switch (e.key) {
        case 'm':
          e.preventDefault();
          // Set caret in the message box when the 'm' key is pressed
          if (inputRef.current) {
            inputRef.current.focus();
          }
          break;
        case 'b':
          // Click a button when the 'b' key is pressed
          handleButtonClick();
          break;
        
        case 'l':
          document.getElementById("lighter").click()
          break;
        
        case 'p':
          document.getElementById("pbutt").click()
          break;

        case 'a':
          document.getElementById("del").click()
          break;
        
        case 'u':
          document.getElementById("ua").click()
          break;
        
        default:
          break;
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  const replaceEmojiPhrases = (text) => {
    let replacedText = text;
    Object.entries(emojiMap).forEach(([phrase, emoji]) => {
      const regex = new RegExp(phrase.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
      replacedText = replacedText.replace(regex, emoji);
    });
    return replacedText;
  };
  
  const darkModeClass = isDarkMode ? 'dark-mode' : '';

  const deleteMessage = async (messageId) => {
    try {
      await firestore.collection('messages').doc(messageId).delete();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  const togglePasswordRequiredOptions = () => {
    setShowPasswordRequiredOptions(!showPasswordRequiredOptions);
  };

  const handleDeleteUserMessages = () => {
    const enteredUsername = document.getElementById('banbox').value
    if (enteredUsername) {
      const enteredPassword = document.getElementById('passbox').value
      if (enteredPassword === 'flicker') {
        deleteMessagesForUsername(enteredUsername);      
        document.getElementById('alertdiv').style.display = 'block';
          
        document.getElementById("inputlabel").innerHTML = "User messages deleted!";
        setTimeout(async () => {
          console.log("done")
          document.getElementById("alertdiv").style.display = 'none';
        },2000)
        document.getElementById('inputlabel').value = "User messages deleted!"
      } else {
        document.getElementById('alertdiv').style.display = 'block';
          
        document.getElementById("inputlabel").innerHTML = "Incorrect password. User messages not deleted.";
        setTimeout(async () => {
          console.log("done")
          document.getElementById("alertdiv").style.display = 'none';
        },2000)
      }
    }
  };

  const deleteMessagesForUsername = (username) => {
    const messagesRef = firestore.collection('messages');
    messagesRef.where('sender', '==', username).get()
      .then((querySnapshot) => {
        const batch = firestore.batch();
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });

        return batch.commit();
      })
      .catch((error) => {
        console.error('Error deleting messages:', error);
        document.getElementById('alertdiv').style.display = 'block';
          
        document.getElementById("inputlabel").innerHTML = "Error deleting messages. If issue consits, contact owner.";
        setTimeout(async () => {
          console.log("done")
          document.getElementById("alertdiv").style.display = 'none';
        },2000)
      });
  };

  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      const lastMessageListItem = messageBoxRef.current.querySelector('.message-list li:last-child');
      if (lastMessageListItem) {
        lastMessageListItem.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  };
  
  
  
  
  
  

  const playMessageReceivedSound = () => {
    if (messageReceivedSoundRef.current) {
      messageReceivedSoundRef.current.currentTime = 0;
      messageReceivedSoundRef.current.volume = 1;
      messageReceivedSoundRef.current.play();
    }
  };

  const handleAutoDeleteUsers = async () => {
      try {
        const querySnapshot = await firestore.collection('onlineUsers').get();
        const batch = firestore.batch();
  
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
      } catch (error) {
        console.error('Error deleting online users:', error);
        document.getElementById('alertdiv').style.display = 'block';
        document.getElementById('inputlabel').innerHTML =
          'An error occurred. Please try again or consult with the owner.';
        setTimeout(async () => {
          document.getElementById('alertdiv').style.display = 'none';
        }, 2000);
      }  
  };

  const handleDeleteAllOnlineUsers = async () => {
    const enteredPassword = document.getElementById("passbox").value;
  
    if (getCookie('golat') == 'true' || enteredPassword === 'flicker' || enteredPassword === 'michaeliscringe') {
      try {
        const querySnapshot = await firestore.collection('onlineUsers').get();
        const batch = firestore.batch();
  
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
  
        await batch.commit();
      } catch (error) {
        console.log('well that sucks')
      }
    }
    
  };
  

  const sendMessage = async () => {
    if (newMessage && userName && !isBadName(userName)) {
      const filteredMessage = filterBadWords(newMessage);
      const filteredUserName = filterBadNames(userName);
      const messageWithEmojis = replaceEmojiPhrases(filteredMessage);
      await firestore.collection('messages').add({
        text: messageWithEmojis,
        sender: filteredUserName,
        timestamp: new Date(),
      });

      setNewMessage('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const sendUpdateMessage = async () => {
      var updateuser = 'System (Auto-Generated Response)';
      const updateversion = 'Implant: ' +  'v' + currentversion;
      await firestore.collection('messages').add({
        text: updateversion,
        sender: updateuser,
        timestamp: new Date(),
      });
    }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  const handleClick = () => {
    setLastActiveTime(Date.now());
  };

  const handleNameChange = (event) => {
    const newName = event.target.value.trim(); // Trim whitespace from the input
  
    if (!newName || (newName && !/\p{Zs}/u.test(newName))) {
      // Check if the entered username already exists in the onlineUsers list
      if (onlineUsers.includes(newName)) {
        // Username already exists, clear the input field using the ref
        usernameInputRef.current.value = ''; // Clear the input field
  
        // Clear the username from local storage
        localStorage.removeItem('localUsername');
      } else {
        if (userName !== '') {
          removeOnlineUser(userName);
        }
        setUserName(newName);
  
        // Store the username in Local Storage
        localStorage.setItem('localUsername', newName);
  
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }
  
        const newTypingTimeout = setTimeout(() => {
          addOnlineUser(newName);
          setTypingTimeout(null);
        }, 8000);
  
        setTypingTimeout(newTypingTimeout);
      }
    }
  };
  

  // eslint-disable-next-line
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop().split(';').shift());
    }
  };
  
  // eslint-disable-next-line
  const setCookie = (name, value, days) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    // Set the SameSite attribute to 'None' and include 'Secure' for cross-origin access
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=None; Secure`;
  };
  
  
  useEffect(() => {
    const savedLocalName = localStorage.getItem('localUsername');
    if (savedLocalName && !onlineUsers.includes(savedLocalName)) {
      setUserName(savedLocalName);
      addOnlineUser(savedLocalName);
    }
  }, [onlineUsers]);

  const isBadName = (name) => {
    const lowerCaseName = name.toLowerCase();
    return badNames.includes(lowerCaseName);
  };

  const handleEZBanUser = async () => {
    console.log('running1')
    const banner = filterBadNames(document.getElementById('nameput').value);
    const enteredUsername = temporary
    if (enteredUsername) {
      console.log("running1.5")
      if (getCookie("golat") == 'true') {
                console.log("running2")
                // Add a ban message to Firestore for the entered username
                const banMessage = "'" + enteredUsername + "'" + " was banned by: " + banner
                await firestore.collection('banMessages').add({
                  username: enteredUsername, // Ban the entered username
                  timestamp: new Date(),
                });
                await firestore.collection('messages').add({
                  text: banMessage,
                  sender: 'System',
                  timestamp: new Date(),
                });
                
                // Set a timeout to remove the ban message from Firestore after 20 seconds
                const banTimeout = setTimeout(async () => {
                  setIsBanned(false);
                  document.cookie = 'chat_banned=; max-age=0'; // Remove the ban cookie
                  
                  // Remove the ban message from Firestore
                  const banQuerySnapshot = await firestore
                    .collection('banMessages')
                    .where('username', '==', enteredUsername)
                    .get();
          
                  const batch = firestore.batch();
                  banQuerySnapshot.forEach(doc => {
                    batch.delete(doc.ref);
                  });
          
                  await batch.commit();
                }, 20000);
          
                // Store the banTimeout in a ref to clear it later if needed
                banTimeoutRef.current = banTimeout; 
      }
    }
  };
  
        
  const handleBanUser = async () => {
    const banner = filterBadNames(document.getElementById('nameput').value);
    const enteredUsername = document.getElementById("banbox").value
    if (enteredUsername) {
      const enteredPassword = document.getElementById('passbox').value
      if (enteredPassword === 'flicker' || enteredPassword === 'michaeliscringe') {
        setCookie("golat", true, 365)
        // Add a ban message to Firestore for the entered username
        const banMessage = "'" + enteredUsername + "'" + " was banned by: " + banner
        await firestore.collection('banMessages').add({
          username: enteredUsername, // Ban the entered username
          timestamp: new Date(),
        });
        await firestore.collection('messages').add({
          text: banMessage,
          sender: 'System',
          timestamp: new Date(),
        });
        
        // Set a timeout to remove the ban message from Firestore after 20 seconds
        const banTimeout = setTimeout(async () => {
          setIsBanned(false);
          document.cookie = 'chat_banned=; max-age=0'; // Remove the ban cookie
          
          // Remove the ban message from Firestore
          const banQuerySnapshot = await firestore
            .collection('banMessages')
            .where('username', '==', enteredUsername)
            .get();
  
          const batch = firestore.batch();
          banQuerySnapshot.forEach(doc => {
            batch.delete(doc.ref);
          });
  
          await batch.commit();
        }, 20000);
  
        // Store the banTimeout in a ref to clear it later if needed
        banTimeoutRef.current = banTimeout;
        document.getElementById('alertdiv').style.display = 'block';
          
        document.getElementById("inputlabel").innerHTML = "User banned!";
        setTimeout(async () => {
          console.log("done")
          document.getElementById("alertdiv").style.display = 'none';
        },2000)
        
      } else {
        document.getElementById('alertdiv').style.display = 'block';
          
        document.getElementById("inputlabel").innerHTML = "Incorrect password, user not banned";
        setTimeout(async () => {
          console.log("done")
          document.getElementById("alertdiv").style.display = 'none';
        },2000)
      }
    }
  };
  
  const handleDeleteAllBanMessages = async () => {
    const enteredPassword = document.getElementById("passbox").value
    console.log(enteredPassword)
    if (enteredPassword === 'flicker' || enteredPassword === 'michaeliscringe') {
      const confirmDelete = true
      if (confirmDelete) {
        try {
          const querySnapshot = await firestore.collection('banMessages').get();
          const batch = firestore.batch();
  
          querySnapshot.forEach(doc => {
            batch.delete(doc.ref);
          });
  
          await batch.commit();
          document.getElementById('alertdiv').style.display = 'block';
          
          document.getElementById("inputlabel").innerHTML = "Successfully deleted all bans! This message will disappear shortly.";
          setTimeout(async () => {
            console.log("done")
            document.getElementById("alertdiv").style.display = 'none';
          },2000)
        } catch (error) {
          document.getElementById('alertdiv').style.display = 'block';
          
          document.getElementById("inputlabel").innerHTML = "Sorry, an error occurred. Please try again shortly or consult with the owner.";
          setTimeout(async () => {
            console.log("done")
            document.getElementById("alertdiv").style.display = 'none';
          },2000)
        }
      }
    } else {
      document.getElementById('alertdiv').style.display = 'block';
          
      document.getElementById("inputlabel").innerHTML = "Incorrect password. Messages not erased. This message will disappear shortly.";
      setTimeout(async () => {
        console.log("done")
        document.getElementById("alertdiv").style.display = 'none';
      },2000)
    }
  };
  

  const filterBadWords = (text) => {
    return text
      .split(' ')
      .map(word =>
        badWords.includes(word.toLowerCase())
          ? `${word.charAt(0)}${'*'.repeat(word.length - 1)}`
          : word
      )
      .join(' ');
  };

  const copyUsername = (username) => {
    const tempInput = document.createElement('input');
    tempInput.value = username;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    setTimeout(() => {
      temporary = username
      handleEZBanUser()
    }, 500);

    // Create a copy of the current button states
    const newButtonStates = { ...copyButtonStates };

    // Change the button text for the clicked user to a checkmark for 2 seconds
    newButtonStates[username] = '✅';
    setCopyButtonStates(newButtonStates);

    // Set a timer to reset the button text for the clicked user
    setTimeout(() => {
      // Reset the button text for all users
      const resetButtonStates = { ...newButtonStates };
      Object.keys(resetButtonStates).forEach((key) => {
        resetButtonStates[key] = '📋'; // Reset to the clipboard symbol
      });
      setCopyButtonStates(resetButtonStates);
    }, 2000);
  };

  const filterBadNames = (name) => {
    return isBadName(name) ? `${name.charAt(0)}${'*'.repeat(name.length - 1)}` : name;
  };

  const addOnlineUser = (username) => {
    firestore.collection('onlineUsers').doc(username).set({});
  };

  const removeOnlineUser = (username) => {
    firestore.collection('onlineUsers').doc(username).delete();
  };
  
  const formatMessageText = (text) => {
    // Regular expression to match URLs in the text
    const urlRegex = /(https?:\/\/[^\s]+)/g;
  
    // Replace URLs with anchor elements
    const formattedText = text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank">${url}</a>`;
    });
  
    // Return the formatted text as HTML
    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };


  const handleDeleteMessages = async () => {
    const enteredPassword = document.getElementById('passbox').value
    if (enteredPassword === 'flicker') {
      try {
        const querySnapshot = await firestore.collection('messages').get();
        const batch = firestore.batch();

        querySnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });

        await batch.commit();

        setMessages([]);
        document.getElementById('alertdiv').style.display = 'block';
          
        document.getElementById("inputlabel").innerHTML = "All messages deleted!";
        setTimeout(async () => {
          console.log("done")
          document.getElementById("alertdiv").style.display = 'none';
        },2000)
        sendUpdateMessage()
      } catch (error) {
        console.error('Error deleting messages:', error);
      }
    } else {
      document.getElementById('alertdiv').style.display = 'block';
      document.getElementById('inputlabel').innerHTML = 'Incorrect password, messages not deleted.'
      setTimeout(async () => {
        console.log("done")
        document.getElementById("alertdiv").style.display = 'none';
      },2000)
    }
  };

  if (!isAuthorized) {
    // Render the login screen if the user is not authorized
    return (
      <div className={`chat-container ${isDarkMode ? 'dark-mode' : ''}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div className="chat-login" style={{ textAlign: 'center', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', maxWidth: '400px', width: '100%' }}>
          <h1 className="chat-title">Login to Implant</h1>
          <input
            style={{ height: '40px', width: '100%', marginBottom: '10px', textAlign: 'center'}}
            type="password"
            placeholder="Enter AuthPass"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                if (newMessage === AUTHORIZATION_PASSWORD) {
                  handleLoginClick()
                }
              }
            }}
            ref={(input) => {
              inputRef.current = input;
            }}
          />
          <button
            style={{ height: '40px', width: '100%', backgroundColor: '#007bff', color: '#fff', border: 'none' }}
            onClick={() => {
              if (newMessage === AUTHORIZATION_PASSWORD) {
                handleLoginClick()
            }
          }}
          >
            {loginCountdown === 20 ? 'Login' : `Logging in (${loginCountdown} seconds)`}
          </button>
          <div className="implant-text">
            <img src={logoImage} alt="Logo" />
          </div>
        </div>
      </div>
    );
  }
  
  
  

  return (
    <>
      <div>
        <div style={{ position: 'relative', flex: '1' }}>

            <div className="clock">
              <p id='userlabel'>Username: </p>
            <input
            type="text"
            id="nameput"
            className={`nametag-input`}
            value={userName}
            onChange={handleNameChange}
            maxLength={10}
            ref={usernameInputRef}
            placeholder="Enter your name..."
            onClick={handleClick}
          />
          <p
          id='usercounter'
            style={{
              position: 'absolute',
              top: '25%',
              left: '19.5vw',
              fontSize: '12px',
            }}
          >
            {userName.length}/10
          </p>
            <img id='logos' src={logoImage}></img>
              <p id='yes'>{currentTime}</p>
              
            </div>
        </div>
      </div>
      <div className={`chat-container ${isDarkMode ? 'dark-mode' : ''}`}>
        {isLoading ? (
          <div className="loading-screen">
            <div className="implant-text">
              <img src={logoImage} alt="Logo" />
            </div>
            <div className="loading-wheel">
              <div className="lds-dual-ring"></div>
            </div>
            <p>Loading...</p>
          </div>
        ) : isBanned ? (
          <div className="banned-message">
            You are banned for 25 seconds. Please wait before sending messages again.
          </div>
        ) : (
          <>
            <div className={`message-box ${userName.length < 3 ? 'blur' : ''}`} ref={messageBoxRef}>
              <ul className={`message-list ${userName.length < 3 ? 'blur' : ''}`}>
              {messages.map((message, index) => (
  <li
    key={message.id}
    className={`message ${message.sender === userName ? 'sender' : ''}`}
    data-first-letter={message.sender.charAt(0).toUpperCase()} // Add this line
  >
    <div
      className={`message-container ${message.sender === userName ? 'your-message' : ''}`}
    >
      <div>
        <Linkify>
          <div className="message-text">
            {formatMessageText(message.text)}
          </div>
        </Linkify>
        <div className="message-time">{formatTimestamp(message.timestamp)}</div>
        <div className="message-sender">{message.sender}</div>
      </div>
      {/* Render the trash can button only for your messages */}
      {message.sender === userName && (
        <button
          className="delete-message-button"
          onClick={() => deleteMessage(message.id)}
        >
          🗑️
        </button>
      )}
    </div>
  </li>
))}
              </ul>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1' }}>
                  <input
                    ref={inputRef}
                    type="text"
                    className={`message-input ${userName.length < 3 ? 'blur' : ''}`}
                    value={newMessage}
                    onChange={(e) => {
                      if (e.target.value.length <= 1000) {
                        setNewMessage(e.target.value);
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    onClick={handleClick}
                    style={{ filter: userName.length < 3 ? 'blur(4px)' : 'none' }}
                    disabled={userName.length < 3}
                  />
                  <p
                    style={{
                      position: 'absolute',
                      top: '40%',
                      transform: 'translateY(-25%)',
                      right: '-7px',
                      margin: '0',
                      color: 'gray',
                      fontSize: '12px',
                    }}
                  >
                    {newMessage.length}/1000
                  </p>
                </div>
              </div>
              
              <button className="send-button" onClick={sendMessage} disabled={userName.length < 3}>
                Send
              </button>
  
              <button
                id="pbutt"
                className="pr-options-button"
                onClick={togglePasswordRequiredOptions}
              >
                {showPasswordRequiredOptions ? 'Hide PR Options' : 'Show PR Options'}
              </button>
              {showPasswordRequiredOptions && (
                <>
                  <button id="del" className="delete-messages-button" onClick={handleDeleteMessages}>
                    Delete All Messages (Password Required)
                  </button>
                  <button
                    className="delete-user-messages-button"
                    onClick={handleDeleteUserMessages}
                  >
                    Delete User Messages (Password Required)
                  </button>
                  <button ref={buttonRef} className="ban-button" onClick={handleBanUser}>
                    Ban User
                  </button>
                  <button
                    id="ua"
                    className="delete-all-ban-messages-button"
                    onClick={handleDeleteAllBanMessages}
                  >
                    Unban All (Password Required)
                 
  
   </button>
                  <button
                    className="delete-all-online-users-button"
                    onClick={handleDeleteAllOnlineUsers}
                  >
                    Clear Online Users (Password Required)
                  </button>
  
                  {/* Add other password-required buttons here */}
                  <input
                    placeholder="Enter Password"
                    id="passbox"
                    className="pbbox"
                    type="password"
                    autoComplete="current-password"
                  ></input>
                  <input
                    placeholder="Enter Username to Ban"
                    className="pbbox"
                    id="banbox"
                  ></input>
                </>
              )}
              {/* Dark mode button */}
              <button id="lighter" className="dark-mode-button" onClick={toggleDarkMode}>
                {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </button>
            </div>
          </>
        )}
        <div className="user-list">
          <h3 className="online-users-heading">Online Users</h3>
          <ul className="online-users-list">
            {onlineUsers.map((user, index) => (
              <li key={index} className="online-user">
                {user}
                <span className="tooltip">
                  <button onClick={() => copyUsername(user)} className="copy-username-button">
                    {copyButtonStates[user] || '📋'}
                  </button>
                  <span className="tooltiptext">Click to Copy/Ban</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="overlay-div" id="alertdiv">
          <label id="inputlabel"></label>
        </div>
      </div>
    </>
  );
  
    
  
  

}

export default Chat;
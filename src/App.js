import React, {useRef, useState, useEffect} from 'react';
import './App.css';

// firebase sdk
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

// hooks
import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

import logo from './images/bird (1).png'

// identify project
firebase.initializeApp({
  // config
  apiKey: "AIzaSyBuc9CrDPXhGevsGO5Jm6S68Hxa30d0nNk",
  authDomain: "superchatter-acb0a.firebaseapp.com",
  projectId: "superchatter-acb0a",
  storageBucket: "superchatter-acb0a.appspot.com",
  messagingSenderId: "723565069036",
  appId: "1:723565069036:web:f6b4afa06d651b09c1dbc9",
  measurementId: "G-M4H0FQRGWC"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const numUsrs = firestore.collection('messages');

function App() {

  const[user] = useAuthState(auth); // signed in, user is an object) | signed out, user is null

  // use ternary operator to check if a user is signed in or not
  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h1>Chatter</h1>
          <img src={logo} alt="chatter icon"/>
        </div>

        <div className='right-header'>
          <SignOut/>
        </div>

      </header>
      
      <section>
        {user ? <Chat /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle} className='sign-in'>Sign in with Google</button>
  )
}

function SignOut() {
  // check for current user, and return a button to sign out
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function Chat(){
  
  const dummy = useRef();

  // reference a firestore collection (in this case, messages)
  const messageRef = firestore.collection('messages');
  // query documents in the messages collection
  const query = messageRef.orderBy('created').limit(25);

  // listen to data with a hook in real time
  const[messages] = useCollectionData(query, {idField: 'id'});

  const[formValue, setFormValue] = useState('');

  const n = auth.currentUser.displayName;
  
  const sendMsg = async(e) => {
    // prevent page refresh
    e.preventDefault();
    // get user id from current logged in user
    const {uid, photoURL} = auth.currentUser;

    // create new document in database
    await messageRef.add({
      text: formValue,
      // created: firebase.firestore.FieldValue.serverTimestamp(),
      created: firebase.firestore.Timestamp.fromDate(new Date()),
      uid,
      photoURL,
      n
    });

    // after, set form value back to empty string
    setFormValue('');

    // scroll into view whenever a user sends a message (prob not needed bc of useEffect)
    dummy.current.scrollIntoView({behavior: 'smooth'});
  }

  // Scroll to the bottom of the chat whenever messages change
  useEffect(() => {
    if (dummy.current) {
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <>
      <main>
        {/* {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)} */}
        {messages &&
          messages.map((msg, index) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              prevMessage={messages[index - 1]}
            />
          ))}

        <span ref={dummy}></span>

      </main>
    
      <form onSubmit={sendMsg}>
        {/* bind state to form input */}
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Send a message" />
        
        <button type="submit">💬</button>

      </form>
    </>
  )
}

function ChatMessage(props) {
  // find chat message child component, show actual text
  const {text, uid, photoURL, n, created} = props.message;
  // const ts = (created.seconds + created.nanoseconds/1000000000) * 1000;
  const ts = created.toDate();
  const d = ts.toLocaleTimeString([], {
    timeStyle: 'short'
  });

  // distinguish between messages that were sent and received
  // compare user id on firestore document and currently logged in user, if equal, current user sent them
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  const tagClass = uid === auth.currentUser.uid ? 'sentN' : 'receivedN';


  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };

  const currentDate = new Date().toLocaleDateString('en-us', options);
  
  let formattedDate = ts.toLocaleDateString('en-us', options);

  // Compare the current message's date with the previous message's date
  const isDifferentDay =
    !props.prevMessage ||
    formattedDate !==
      new Date(props.prevMessage.created.toDate()).toLocaleDateString('en-us', options);

  // Change date header if the message is sent today
  if (formattedDate === currentDate) {
    formattedDate = "Today - " + currentDate;
  }
  
  return (
    <>
    {isDifferentDay && (
        <div className="message-date">
          <p>{formattedDate}</p>
        </div>
    )}

    <div className={`name ${tagClass}`}>
      <p>{n} | {d}</p>
    </div>

    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="profile pic"/>
      <p>{text}</p>
    </div>
    </>
  )
}

export default App;

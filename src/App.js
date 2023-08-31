import React from 'react';
import './App.css';

// firebase sdk
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

// hooks
import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

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

function App() {

  const[user] = useAuthState(auth); // signed in, user is an object) | signed out, user is null

  // use ternary operator to check if a user is signed in or not
  return (
    <div className="App">
      <header className="App-header">
        
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
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  // check for current user, and return a button to sign out
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function Chat(){
  // reference a firestore collection (in this case, messages)
  const messageRef = firestore.collection('messages');
  // query documents in the messages collection
  const query = messageRef.orderBy('created').limit(25);

  // listen to data with a hook in real time
  const[messages] = useCollectionData(query, {idField: 'id'});

  const[formValue, setFormValue] = useState('');

  return (
    <>
      <div>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      </div>

      <form onSubmit={sendMessage}>
        {/* bind state to form input */}
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="no cussing pls" />
        
        <button type="submit">SEND</button>

      </form>
    </>
  )
}

function ChatMessage(props) {
  // find chat message child component, show actual text
  const {text, uid} = props.message;

  // distinguish between messages that were sent and received
  // compare user id on firestore document and currently logged in user, if equal, current user sent them
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';


  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL}/>
      <p>{text}</p>
    </div>
  
  )
}

export default App;

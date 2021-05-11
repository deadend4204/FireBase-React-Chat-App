import "./App.css";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Fragment, useRef, useState } from "react";

firebase.initializeApp({
  //config
  apiKey: `${process.env.REACT_APP_FIREBASE_API_KEY}`,
  authDomain: "chat-app-553d1.firebaseapp.com",
  projectId: "chat-app-553d1",
  storageBucket: "chat-app-553d1.appspot.com",
  messagingSenderId: "909731449244",
  appId: "1:909731449244:web:7bf7d29f4752d5e2a7e059",
  measurementId: "G-JL8JH5LL02",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  console.log("i am running");
  return (
    <div className="App">
      <header>
        <h1>Chat App</h1> <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

// sign in component
const SignIn = () => {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return (
    <div>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign In
      </button>
    </div>
  );
};

// sign out

const SignOut = () => {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
};

// chatroom

const ChatRoom = () => {
  const dummy = useRef();

  const messageRef = firestore.collection("messages");
  const query = messageRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");
  // console.log(messages);
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });
    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <Fragment>
      <main>
        {messages &&
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Say something..."
        />
        <button type="submit">SEND</button>
      </form>
    </Fragment>
  );
};

const ChatMessage = ({ message }) => {
  const { text, uid, photoURL } = message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="Profile-Pic" />
      <p>{text}</p>
    </div>
  );
};

export default App;

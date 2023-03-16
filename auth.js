import { app } from "/index.js"
import { getAuth, signInWithRedirect, onAuthStateChanged, getRedirectResult, GoogleAuthProvider } from "firebase/auth"

const provider = new GoogleAuthProvider(app);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  let authInfo = document.getElementById("auth");
  let li = document.createElement("li");

  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    const uid = user.uid;
    console.log("Auth si");
    li.textContent = user.displayName;
    authInfo.appendChild(li);

  } else {
    // User is signed out
    // ...
    console.log("Auth no");
    li.textContent = "No usuario autentificado.";
    authInfo.appendChild(li);
  }
});

document.getElementById("login").onclick = async function () {
  await signInWithRedirect(auth, provider);

  await getRedirectResult(auth)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access Google APIs.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;

      // The signed-in user info.
      const user = result.user;
      // IdP data available using getAdditionalUserInfo(result)
      // ...}

      if (user !== null) {
        // The user object has basic properties such as display name, email, etc.
        const displayName = user.displayName;
        const email = user.email;
        const photoURL = user.photoURL;
        const emailVerified = user.emailVerified;

        // The user's ID, unique to the Firebase project. Do NOT use
        // this value to authenticate with your backend server, if
        // you have one. Use User.getToken() instead.
        const uid = user.uid;

        console.log(user.email);
        console.log("Hollaaa");
      }
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
    });
}
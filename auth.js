import { app, db } from "/index.js"
import { getAuth, signInWithRedirect, onAuthStateChanged, getRedirectResult, GoogleAuthProvider } from "firebase/auth"
import { ref, set, update, onValue, onChildAdded, get } from "firebase/database";
const provider = new GoogleAuthProvider(app);
const auth = getAuth(app);

let authInfo = document.getElementById("auth");

const redirect = await getRedirectResult(auth);

onAuthStateChanged(auth, (user) => {
  let li = document.createElement("li");
  if (user) {
    if (redirect !== null && redirect.operationType === "signIn") {
      saveUserData(user);
    }

    console.log("Auth si");
  } else {
    console.log("Auth no");
    li.textContent = "No usuario autentificado.";
    authInfo.appendChild(li);
    document.getElementById("logout").hidden = true;
  }
});

onChildAdded(ref(db, 'usersKeys'), (data) => {
  onValue(ref(db, 'users/' + data.key + "/foto"), (child) => {
    let li = document.createElement("li");
    let img = document.createElement("img");
    img.style.width = "100px";
    img.src = child.val();
    li.appendChild(img);
    authInfo.appendChild(li);
  })
});

document.getElementById("login").onclick = async function () {
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.log(error);
  }
}

//Esta función guarda los datos del usuario recien autenticado
function saveUserData(user) {
  set(ref(db, 'users/' + user.uid), {
    uid: user.uid,
    autenticado: true, // de momento no funciona, y ademas se hace con reglas de firebase de token
    nombre: user.displayName,
    email: user.email, // si los datos son legibles para todos es mejor no guardar esto
    foto: user.photoURL,
    dia: user.metadata.lastSignInTime
  });

  // guardando keys o uid de los usuarios por motivos de seguridad
  set(ref(db, 'usersKeys/' + user.uid), true);
}

/* document.getElementById("logout").onclick = async function () {
  // Revoke all refresh tokens for a specified user for whatever reason.
  // Retrieve the timestamp of the revocation, in seconds since the epoch.
  let uid = auth.currentUser.uid;
  auth.revokeRefreshTokens(uid)
    .then(() => {
      return getAuth().getUser(uid);
    })
    .then((userRecord) => {
      return new Date(userRecord.tokensValidAfterTime).getTime() / 1000;
    })
    .then((timestamp) => {
      set(ref(db, 'users/' + uid), { autenticado: false });
      console.log(`Tokens revoked at: ${timestamp}`);
    });
} */

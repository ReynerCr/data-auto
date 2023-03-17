import { app, db } from "/index.js"
import { ref, set, update, onValue, onChildAdded, get, onChildChanged } from "firebase/database";
import {
  getAuth,
  signInWithRedirect,
  onAuthStateChanged,
  getRedirectResult,
  GoogleAuthProvider,
  signOut
} from "firebase/auth"

const provider = new GoogleAuthProvider(app);
const auth = getAuth(app);
const redirect = await getRedirectResult(auth);

let authInfo = document.getElementById("auth");

// Maneja si hay usuario autenticado o no
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (redirect !== null && redirect.operationType === "signIn") {
      saveUserData(user);
    }
    console.log("Auth si");
    window.document.getElementById("login").hidden = true;
    window.document.getElementById("logout").hidden = false;
  } else {
    console.log("Auth no");
    window.document.getElementById("login").hidden = false;
    window.document.getElementById("logout").hidden = true;
  }
});

// Lista de fotos de usuarios autenticados
onChildAdded(ref(db, 'usersKeys'), (data) => {
  onValue(ref(db, 'users/' + data.key + "/"), (child) => {
    if (child.val().autenticado === true) {
      let li = document.createElement("li");
      let img = document.createElement("img");
      img.style.width = "80px";
      img.src = child.val().foto;
      li.id = data.key; // quizas no es lo mas seguro
      li.appendChild(img);
      authInfo.appendChild(li);
    }
  })
});

// Evento para boton de login
document.getElementById("login").onclick = async function () {
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.log(error);
  }
}

//Esta funcion guarda los datos del usuario recien autenticado
function saveUserData(user) {
  set(ref(db, 'users/' + user.uid), {
    uid: user.uid,
    autenticado: true, // para mostrar la imagen de perfil de usuarios autenticados
    nombre: user.displayName,
    email: user.email,
    foto: user.photoURL,
    dia: user.metadata.lastSignInTime
  });

  // guardando keys o uid en otra ruta por motivos de seguridad
  set(ref(db, 'usersKeys/' + user.uid), true);
}

// Funcion de cierre de sesion y boton de cierre
async function logout(uid) {
  const reference = ref(db, 'users/' + uid + "/");
  await update(reference, { autenticado: false });

  let img = document.getElementById(uid);

  authInfo.removeChild(img);
}

document.getElementById("logout").onclick = async function () {
  try {
    const uid = auth.currentUser.uid;
    await signOut(auth).then(logout(uid));
  } catch (error) {
    console.log(error);
  }
}


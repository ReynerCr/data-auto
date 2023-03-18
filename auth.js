import { app, db } from "/index.js"
import { ref, set, update, onValue, onChildAdded } from "firebase/database";
import {
  getAuth,
  signInWithRedirect,
  onAuthStateChanged,
  getRedirectResult,
  GoogleAuthProvider,
  signOut
} from "firebase/auth"

import "/authorNote.js";

const provider = new GoogleAuthProvider(app);
export const auth = getAuth(app);

let authInfo = document.getElementById("auth");

// Maneja si hay usuario autenticado o no
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const redirect = await getRedirectResult(auth);

    if (redirect !== null && redirect.operationType === "signIn") {
      saveUserData(user);
    }
    window.document.getElementById("login").hidden = true;
    window.document.getElementById("logout").hidden = false;

    isAuthor();
  } else {
    window.document.getElementById("login").hidden = false;
    // TODO habilitar
    //window.document.getElementById("logout").hidden = true;
  }
});

// Lista de fotos de usuarios autenticados
onChildAdded(ref(db, 'usersKeys'), (data) => {
  onValue(ref(db, 'users/' + data.key + '/public'), (child) => {
    if (child.val().auth === true) {
      let li = document.createElement("li");
      let img = document.createElement("img");
      img.style.width = "80px";
      img.src = child.val().photo;
      li.id = data.key; // quizas no es lo mas seguro
      li.appendChild(img);
      authInfo.appendChild(li);
    }
    else {
      let li = document.getElementById(data.key);
      if (li) {
        authInfo.removeChild(li);
      }
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
    public: {
      auth: true,
      photo: user.photoURL
    }, // para mostrar la imagen de perfil de usuarios autenticados
    
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    login_timestamp: user.metadata.lastSignInTime
  });

  // guardando keys o uid en otra ruta por motivos de seguridad
  set(ref(db, 'usersKeys/' + user.uid), true);
}

// Funcion de cierre de sesion y boton de cierre
async function logout(uid) {
  const reference = ref(db, 'users/' + uid + "/public/");
  await update(reference, { auth: false });
}

document.getElementById("logout").onclick = async function () {
  try {
    const uid = auth.currentUser.uid;
    await signOut(auth).then(logout(uid));
  } catch (error) {
    console.log(error);
  }
}

// TODO funcional pero se puede mejorar
function isAuthor() {
  if (auth.currentUser.email === "reynercontreras0@gmail.com") {
    let btnUpdateAuthorNotes = document.getElementById("updateAuthorNotes");

    document.getElementById("authorNotes").disabled = false;

    btnUpdateAuthorNotes.hidden = false;
    btnUpdateAuthorNotes.onclick = () => {
      const notes = document.getElementById("authorNotes").value;
      console.log(notes);
      set(ref(db, 'authorNotes'), notes);
    }
  }
}

onValue(ref(db, 'authorNotes'), (notes) => {
  document.getElementById("authorNotes").value = notes.val();
})
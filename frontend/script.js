console.log("script loaded")
const button = document.getElementById("tonggleMode");
const body = document.body;
const output = document.getElementById("ayat");
const btnHello = document.getElementById("btnHello");
const btnTime = document.getElementById("btnTime");
const btnSend = document.getElementById("btnSend");
const nameInput = document.getElementById("nameInput");
const reply = document.getElementById("reply");
const userList = document.getElementById("userList");
const API_BASE = "https://flask-crud-app-jkog.onrender.com";
let isOn = false;


if(button){
button.addEventListener("click",function() {
console.log("Button Clicked");
console.log("Current state:", isOn);

if (isOn === false) {
    body.classList.add("dark-mode");
    isOn = true;
} else {
    body.classList.remove("dark-mode");
    isOn = false;
}});
}

if(btnSend){
btnSend.addEventListener("click", () => {
    const name = nameInput.value;
    reply.textContent = "Sending...";
    reply.style.color = "gray";
    btnSend.disabled = true;

    fetch(`${API_BASE}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name })
    })
    .then(r => r.json())
    .then(data => {
      if (data.error) {
        reply.textContent = "❌ " + data.error;
        reply.style.color = "red";
      } else {
        reply.textContent = "✅ " + data.message;
        reply.style.color = "green";
        loadUsers();
        nameInput.value = "";
      }
    })

    .catch(err => {
        console.error(err);
        reply.textContent = "Error sending data";
    })
    .finally(() => {
      btnSend.disabled = false;
    });
});
}

// fetch /hello
if(btnHello){
btnHello.addEventListener("click", () => {
    console.log("Hello button clicked");
  fetch(`${API_BASE}/hello`)
    .then(r => r.json())
    .then(data => {
      output.textContent = data.message;
    })
    .catch(err => console.error(err));
});
}

// fetch /time
if(btnTime){
btnTime.addEventListener("click", () => {
  fetch(`${API_BASE}/time`)
    .then(r => r.json())
    .then(data => {
      output.textContent = "Masa: " + data.time;
    })
    .catch(err => console.error(err));
});
}

fetch("nav.html")
.then(response => response.text())
.then(data => {
    document.getElementById("nav-placeholder").innerHTML = data;
});

fetch(`${API_BASE}/time`)
  .then(response => response.json())
  .then(data => {
    document.getElementById("ayat").textContent =
    "Masa dari backend: " + data.time;
  })
  .catch(error => {
    console.error("Fetch error:", error);
  });

  function loadUsers(){
    fetch(`${API_BASE}/users`)
    .then(r => r.json())
    .then(users =>{
      userList.innerHTML = "";

      if(users.lenght === 0){
        const li = document.createElement("li");
        li.textContent = "No users yet. Be the first";

        li.style.color = "gray";
        userList.appendChild(li);
        return;
      }

      users.forEach(user => {
        const li = document.createElement("li");
        const text = document.createElement("span");
        text .textContent = `${user.name} • ${new Date(user.created_at).toLocaleString()}`;

        const btnDelete = document.createElement("button");
        btnDelete.textContent = "Delete";
        btnDelete.style.marginleft = "5px";

        const btnEdit = document.createElement("button");
        btnEdit.textContent = "Edit";
        btnEdit.style.marginleft = "10px";

        //EDIT
        btnEdit.addEventListener("click", () => {
          const newName = prompt("Enter new name:", user.name);
          if (!newName)
            return;

          fetch(`${API_BASE}/users/${user.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: newName })
          })

          .then(r => r.json())
          .then(() => {
            loadUsers();
          });
        });

        //DELETE
        btnDelete.addEventListener("click", () => {
          if (!confirm("Delete this user?")) 
            return;

          fetch(`${API_BASE}/users/${user.id}`, {
            method: "DELETE"
          })

          .then(r => r.json())
          .then(() => {
            loadUsers();

          });
        });

        li.appendChild(text);
        li.appendChild(btnEdit);
        li.appendChild(btnDelete);
        userList.appendChild(li);
    })
  })
    .catch(err => {
      console.error("Error loading users:", err);
    });
  }

  console.log("JS loaded at", new Date().toLocaleTimeString());
  loadUsers();


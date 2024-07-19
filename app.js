document.addEventListener("DOMContentLoaded", function () {
  function showLogin() {
    document.getElementById("auth-container").style.display = "block";
    document.getElementById("auth-container").style.display = "flex";
    document.getElementById("login-form").style.display = "block";
    document.getElementById("login-form").style.display = "flex";
    document.getElementById("register-form").style.display = "none";
    document.getElementById("notes-container").style.display = "none";
  }

  function showRegister() {
    document.getElementById("auth-container").style.display = "block";
    document.getElementById("auth-container").style.display = "flex";
    document.getElementById("login-form").style.display = "none";
    document.getElementById("register-form").style.display = "block";
    document.getElementById("register-form").style.display = "flex";
    document.getElementById("notes-container").style.display = "none";
  }

  function showNotes() {
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("notes-container").style.display = "block";
    loadNotes();
  }

  document
    .getElementById("show-register")
    .addEventListener("click", function (e) {
      e.preventDefault();
      showRegister();
    });

  document.getElementById("show-login").addEventListener("click", function (e) {
    e.preventDefault();
    showLogin();
  });

  document.getElementById("login-btn").addEventListener("click", function () {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    fetch("https://notes-app-backend-gusl.onrender.com/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          showNotes();
        } else {
          alert("Login failed: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

  document
    .getElementById("register-btn")
    .addEventListener("click", function () {
      const username = document.getElementById("register-username").value;
      const email = document.getElementById("register-email").value;
      const password = document.getElementById("register-password").value;
      fetch("https://notes-app-backend-gusl.onrender.com/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "User registered successfully") {
            alert(data.message);
            showLogin();
          } else {
            alert("Registration failed: " + data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });

  document.getElementById("logout-btn").addEventListener("click", function () {
    localStorage.removeItem("token");
    showLogin();
  });

  document
    .getElementById("view-all-notes")
    .addEventListener("click", function () {
      showNotes();
    });

  function loadNotes(endpoint = "notes") {
    const token = localStorage.getItem("token");
    if (!token) return showLogin();
    fetch(`https://notes-app-backend-gusl.onrender.com/${endpoint}`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((response) => response.json())
      .then((notes) => {
        const noteList = document.getElementById("note-list");
        noteList.innerHTML = "";
        notes.forEach((note) => {
          const noteDiv = document.createElement("div");
          noteDiv.className = "note";
          noteDiv.dataset.id = note._id;
          noteDiv.style.backgroundColor = note.color;
          noteDiv.innerHTML = `
                    <div class="title">${note.title}</div>
                    <div class="content">${note.content}</div>
                    <div class="tags">${note.tags.join(", ")}</div>
                    <div>
                    <button class="color-button"><input type="color" value=${
                      note.color
                    }  /></button>
                    <button class="edit-note">Edit</button>
                    <button class="delete-note">Delete</button>
                    <button class="toggle-archive">${
                      note.isArchived ? "Unarchive" : "Archive"
                    }</button>
                      <button class="toggle-trash">${
                        note.isTrashed ? "Restore" : "Trash"
                      }</button>
                        </div>
                `;
          noteList.appendChild(noteDiv);
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  document.getElementById("new-note").addEventListener("click", function () {
    const title = prompt("Enter note title:");
    const content = prompt("Enter note content:");
    const token = localStorage.getItem("token");
    fetch("https://notes-app-backend-gusl.onrender.com/notes", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    })
      .then((response) => response.json())
      .then((note) => {
        loadNotes();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

  document
    .getElementById("view-archive")
    .addEventListener("click", function () {
      loadNotes("notes/archived");
    });

  document.getElementById("view-trash").addEventListener("click", function () {
    loadNotes("notes/trash");
  });

  document
    .getElementById("view-reminders")
    .addEventListener("click", function () {
      loadNotes("notes/reminders");
    });

  document.getElementById("search").addEventListener("keyup", function () {
    const query = this.value.toLowerCase();
    document.querySelectorAll(".note").forEach((note) => {
      const title = note.querySelector(".title").textContent.toLowerCase();
      const content = note.querySelector(".content").textContent.toLowerCase();
      if (title.includes(query) || content.includes(query)) {
        note.style.display = "";
      } else {
        note.style.display = "none";
      }
    });
  });

  document
    .getElementById("note-list")
    .addEventListener("click", function (event) {
      if (event.target.classList.contains("edit-note")) {
        const noteDiv = event.target.closest(".note");
        const id = noteDiv.dataset.id;
        const newTitle = prompt("Enter new title:");
        const newContent = prompt("Enter new content:");
        const token = localStorage.getItem("token");
        fetch(`https://notes-app-backend-gusl.onrender.com/notes/${id}`, {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: newTitle, content: newContent }),
        })
          .then((response) => response.json())
          .then((note) => {
            loadNotes();
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }

      if (event.target.classList.contains("delete-note")) {
        const noteDiv = event.target.closest(".note");
        const id = noteDiv.dataset.id;
        const token = localStorage.getItem("token");
        fetch(`https://notes-app-backend-gusl.onrender.com/notes/${id}`, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token },
        })
          .then(() => {
            loadNotes();
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }

      if (event.target.classList.contains("toggle-archive")) {
        const noteDiv = event.target.closest(".note");
        const id = noteDiv.dataset.id;
        const token = localStorage.getItem("token");
        fetch(
          `https://notes-app-backend-gusl.onrender.com/notes/${id}/archive`,
          {
            method: "PUT",
            headers: { Authorization: "Bearer " + token },
          }
        )
          .then(() => {
            loadNotes();
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }

      if (event.target.classList.contains("toggle-trash")) {
        const noteDiv = event.target.closest(".note");
        const id = noteDiv.dataset.id;
        const token = localStorage.getItem("token");
        fetch(`https://notes-app-backend-gusl.onrender.com/notes/${id}/trash`, {
          method: "PUT",
          headers: { Authorization: "Bearer " + token },
        })
          .then(() => {
            loadNotes();
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    });

  // On initial load, check if the user is logged in
  const token = localStorage.getItem("token");
  if (token) {
    showNotes();
  } else {
    showLogin();
  }
});

document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "https://localhost:44388/api/user";
    const userForm = document.getElementById("userForm");
    const userIdInput = document.getElementById("userId");
    const submitBtn = document.getElementById("submitBtn");
    const updateBtn = document.getElementById("updateBtn");
    const userTableBody = document.querySelector("#userTable tbody");
    const searchBar = document.getElementById("searchBar");
  
    const deleteModal = document.getElementById("deleteModal");
    const closeModalBtn = document.querySelector(".close");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const currentPageDisplay = document.getElementById("currentPage");
    const totalPagesDisplay = document.getElementById("totalPages");
  
    let userToDeleteId = null;
    let currentPage = 1;
    let usersPerPage = 10;
    let totalPages = 1;
  
    function fetchUsers(searchQuery = "", page = 1) {
      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          const filteredData = data.filter(user => {
            const searchString = searchQuery.toLowerCase();
            return (
                user.userId.toString().includes(searchString)||
                user.userName.toLowerCase().includes(searchString)||
                user.userPassword.toLowerCase().includes(searchString)
            );  
          });
  
          totalPages = Math.ceil(filteredData.length / usersPerPage);
          const startIndex = (page - 1) * usersPerPage;
          const paginatedData = filteredData.slice(startIndex, startIndex + usersPerPage);
  
          userTableBody.innerHTML = "";
          paginatedData.forEach(user => {
            const row = document.createElement("tr");
  
            row.innerHTML = `
              <td>${user.userId}</td>
              <td>${user.userName}</td>
              <td>${user.userPassword}</td>
              <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
              </td>
            `;
  
            row.querySelector(".edit-btn").addEventListener("click", () => editUser(user));
            row.querySelector(".delete-btn").addEventListener("click", () => openDeleteModal(user.userId));
  
            userTableBody.appendChild(row);
          });
  
          currentPageDisplay.textContent = currentPage;
          totalPagesDisplay.textContent = totalPages;
  
          prevPageBtn.disabled = currentPage === 1;
          nextPageBtn.disabled = currentPage === totalPages;
        });
    }
  
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        fetchUsers(searchBar.value.trim(), currentPage);
      }
    });
  
    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        fetchUsers(searchBar.value.trim(), currentPage);
      }
    });
  
    function openDeleteModal(id) {
      userToDeleteId = id;
      deleteModal.style.display = "block";
    }
  
    function closeModal() {
      deleteModal.style.display = "none";
      userToDeleteId = null;
    }
  
    confirmDeleteBtn.addEventListener("click", function() {
      if (userToDeleteId) {
        fetch(`${apiUrl}/${userToDeleteId}`, {
          method: "DELETE"
        })
        .then(() => {
          closeModal();
          fetchUsers(searchBar.value.trim(), currentPage);
        })
        .catch(error => {
          console.error("Error deleting user:", error);
        });
      }
    });
  
    cancelDeleteBtn.addEventListener("click", closeModal);
    closeModalBtn.addEventListener("click", closeModal);
  
    userForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const user = {
        userName: document.getElementById("userName").value,
        userPassword: document.getElementById("userPassword").value
      };
  
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
      }).then(() => {
        userForm.reset();
        fetchUsers(searchBar.value.trim(), currentPage);
      });
    });
  
    function editUser(user) {
      userIdInput.value = user.userId;
      document.getElementById("userName").value = user.userName;
      document.getElementById("userPassword").value = user.userPassword;
  
      submitBtn.style.display = "none";
      updateBtn.style.display = "inline-block";
  
      updateBtn.onclick = function() {
        updateUser(user.userId);
      };
    }
  
    function updateUser(id) {
      const updatedUser = {
        userId: id,
        userName: document.getElementById("userName").value,
        userPassword: document.getElementById("userPassword").value
      };
  
      fetch(`${apiUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser)
      }).then(() => {
        fetchUsers(searchBar.value.trim(), currentPage);
      });
  
      userForm.reset();
      submitBtn.style.display = "inline-block";
      updateBtn.style.display = "none";
    }
  
    searchBar.addEventListener("input", function() {
      const searchQuery = searchBar.value.trim();
      currentPage = 1;
      fetchUsers(searchQuery, currentPage);
    });
  
    fetchUsers("", currentPage);
  });
  
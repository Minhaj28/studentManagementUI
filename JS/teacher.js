document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "https://localhost:44388/api/teacher";
    const teacherForm = document.getElementById("teacherForm");
    const teacherIDInput = document.getElementById("teacherID");
    const submitBtn = document.getElementById("submitBtn");
    const updateBtn = document.getElementById("updateBtn");
    const teacherTableBody = document.querySelector("#teacherTable tbody");
    const searchBar = document.getElementById("searchBar");
  
    const deleteModal = document.getElementById("deleteModal");
    const closeModalBtn = document.querySelector(".close");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const currentPageDisplay = document.getElementById("currentPage");
    const totalPagesDisplay = document.getElementById("totalPages");
  
    let teacherToDeleteId = null;
    let currentPage = 1;
    let teachersPerPage = 10;
    let totalPages = 1;
  
    function fetchTeachers(searchQuery = "", page = 1) {
      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          const filteredData = data.filter(teacher => {
            const searchString = searchQuery.toLowerCase();
            return (
              teacher.teacherId.toString().includes(searchString) ||
              teacher.name.toLowerCase().includes(searchString) ||
              teacher.address.toLowerCase().includes(searchString) ||
              teacher.email.toLowerCase().includes(searchString) ||
              teacher.phoneNumber.toLowerCase().includes(searchString) ||
              teacher.department.toLowerCase().includes(searchString) ||
              teacher.designation.toLowerCase().includes(searchString)
            );
          });
  
          totalPages = Math.ceil(filteredData.length / teachersPerPage);
          const startIndex = (page - 1) * teachersPerPage;
          const paginatedData = filteredData.slice(startIndex, startIndex + teachersPerPage);
  
          teacherTableBody.innerHTML = "";
          paginatedData.forEach(teacher => {
            const row = document.createElement("tr");
  
            row.innerHTML = `
              <td>${teacher.teacherId}</td>
              <td>${teacher.name}</td>
              <td>${teacher.address}</td>
              <td>${teacher.email}</td>
              <td>${teacher.phoneNumber}</td>
              <td>${teacher.department}</td>
              <td>${teacher.designation}</td>
              <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
              </td>
            `;
  
            row.querySelector(".edit-btn").addEventListener("click", () => editTeacher(teacher));
            row.querySelector(".delete-btn").addEventListener("click", () => openDeleteModal(teacher.teacherId));
  
            teacherTableBody.appendChild(row);
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
        fetchTeachers(searchBar.value.trim(), currentPage);
      }
    });
  
    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        fetchTeachers(searchBar.value.trim(), currentPage);
      }
    });
  
    function openDeleteModal(id) {
      teacherToDeleteId = id;
      deleteModal.style.display = "block";
    }
  
    function closeModal() {
      deleteModal.style.display = "none";
      teacherToDeleteId = null;
    }
  
    confirmDeleteBtn.addEventListener("click", function() {
      if (teacherToDeleteId) {
        fetch(`${apiUrl}/${teacherToDeleteId}`, {
          method: "DELETE"
        })
        .then(() => {
          closeModal();
          fetchTeachers(searchBar.value.trim(), currentPage);
        })
        .catch(error => {
          console.error("Error deleting teacher:", error);
        });
      }
    });
  
    cancelDeleteBtn.addEventListener("click", closeModal);
    closeModalBtn.addEventListener("click", closeModal);
  
    teacherForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const teacher = {
        name: document.getElementById("name").value,
        address: document.getElementById("address").value,
        email: document.getElementById("email").value,
        phoneNumber: document.getElementById("phoneNumber").value,
        department: document.getElementById("department").value,
        designation: document.getElementById("designation").value
      };
  
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacher)
      }).then(() => {
        teacherForm.reset();
        fetchTeachers(searchBar.value.trim(), currentPage);
      });
    });
  
    function editTeacher(teacher) {
      teacherIDInput.value = teacher.teacherId;
      document.getElementById("name").value = teacher.name;
      document.getElementById("address").value = teacher.address;
      document.getElementById("email").value = teacher.email;
      document.getElementById("phoneNumber").value = teacher.phoneNumber;
      document.getElementById("department").value = teacher.department;
      document.getElementById("designation").value = teacher.designation;
  
      submitBtn.style.display = "none";
      updateBtn.style.display = "inline-block";
  
      updateBtn.onclick = function() {
        updateTeacher(teacher.teacherId);
      };
    }
  
    function updateTeacher(id) {
      const updatedTeacher = {
        teacherId: id,
        name: document.getElementById("name").value,
        address: document.getElementById("address").value,
        email: document.getElementById("email").value,
        phoneNumber: document.getElementById("phoneNumber").value,
        department: document.getElementById("department").value,
        designation: document.getElementById("designation").value
      };
  
      fetch(`${apiUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTeacher)
      }).then(() => {
        fetchTeachers(searchBar.value.trim(), currentPage);
        teacherForm.reset();
        submitBtn.style.display = "inline-block";
        updateBtn.style.display = "none";
      });
    }
  
    searchBar.addEventListener("input", function() {
      fetchTeachers(searchBar.value.trim(), currentPage);
    });
  
    fetchTeachers();
  });
  
document.addEventListener("DOMContentLoaded", function() {
  const apiUrl = "https://localhost:44388/api/student";
  const studentForm = document.getElementById("studentForm");
  const studentIDInput = document.getElementById("studentID");
  const submitBtn = document.getElementById("submitBtn");
  const updateBtn = document.getElementById("updateBtn");
  const studentTableBody = document.querySelector("#studentTable tbody");
  const searchBar = document.getElementById("searchBar");

  const deleteModal = document.getElementById("deleteModal");
  const closeModalBtn = document.querySelector(".close");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");
  const currentPageDisplay = document.getElementById("currentPage");
  const totalPagesDisplay = document.getElementById("totalPages");

  let studentToDeleteId = null;
  let currentPage = 1;
  let studentsPerPage = 5;
  let totalPages = 1;

  // Fetch and display students with pagination
  function fetchStudents(searchQuery = "", page = 1) {
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        // Filter the data based on search query
        const filteredData = data.filter(student => {
          const searchString = searchQuery.toLowerCase();
          return (
            student.studentID.toString().includes(searchString) ||
            student.name.toLowerCase().includes(searchString) ||
            student.address.toLowerCase().includes(searchString) ||
            student.email.toLowerCase().includes(searchString) ||
            student.phoneNumber.toLowerCase().includes(searchString) ||
            student.level.toLowerCase().includes(searchString) ||
            student.gpa.toLowerCase().includes(searchString)
          );
        });

        totalPages = Math.ceil(filteredData.length / studentsPerPage);
        const startIndex = (page - 1) * studentsPerPage;
        const paginatedData = filteredData.slice(startIndex, startIndex + studentsPerPage);

        studentTableBody.innerHTML = "";
        paginatedData.forEach(student => {
          const row = document.createElement("tr");

          row.innerHTML = `
            <td>${student.studentID}</td>
            <td>${student.name}</td>
            <td>${student.address}</td>
            <td>${student.email}</td>
            <td>${student.phoneNumber}</td>
            <td>${student.level}</td>
            <td>${student.gpa}</td>
            <td>
              <button class="edit-btn">Edit</button>
              <button class="delete-btn">Delete</button>
            </td>
          `;

          row.querySelector(".edit-btn").addEventListener("click", () => editStudent(student));
          row.querySelector(".delete-btn").addEventListener("click", () => openDeleteModal(student.studentID));

          studentTableBody.appendChild(row);
        });

        currentPageDisplay.textContent = currentPage;
        totalPagesDisplay.textContent = totalPages;

        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
      });
  }

  // Handle pagination button clicks
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchStudents(searchBar.value.trim(), currentPage);
    }
  });

  nextPageBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchStudents(searchBar.value.trim(), currentPage);
    }
  });

  // Open the delete confirmation modal
  function openDeleteModal(id) {
    studentToDeleteId = id;
    deleteModal.style.display = "block";
  }

  // Close the modal
  function closeModal() {
    deleteModal.style.display = "none";
    studentToDeleteId = null;
  }

  // Delete student
  confirmDeleteBtn.addEventListener("click", function() {
    if (studentToDeleteId) {
      fetch(`${apiUrl}/${studentToDeleteId}`, {
        method: "DELETE"
      })
      .then(() => {
        closeModal();
        fetchStudents(searchBar.value.trim(), currentPage); // Refresh the table after deleting a student
      })
      .catch(error => {
        console.error("Error deleting student:", error);
      });
    }
  });

  cancelDeleteBtn.addEventListener("click", closeModal);
  closeModalBtn.addEventListener("click", closeModal);

  // Create or update student
  studentForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const student = {
      name: document.getElementById("name").value,
      address: document.getElementById("address").value,
      email: document.getElementById("email").value,
      phoneNumber: document.getElementById("phoneNumber").value,
      level: document.getElementById("level").value,
      gpa: document.getElementById("gpa").value
    };

    // Create student
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student)
    }).then(() => {
      studentForm.reset();
      fetchStudents(searchBar.value.trim(), currentPage);
    });
  });

  // Edit student
  function editStudent(student) {
    studentIDInput.value = student.studentID;
    document.getElementById("name").value = student.name;
    document.getElementById("address").value = student.address;
    document.getElementById("email").value = student.email;
    document.getElementById("phoneNumber").value = student.phoneNumber;
    document.getElementById("level").value = student.level;
    document.getElementById("gpa").value = student.gpa;

    submitBtn.style.display = "none";
    updateBtn.style.display = "inline-block";

    updateBtn.onclick = function() {
      updateStudent(student.studentID);
    };
  }

  // Update student
  function updateStudent(id) {
    const updatedStudent = {
      studentID: id,
      name: document.getElementById("name").value,
      address: document.getElementById("address").value,
      email: document.getElementById("email").value,
      phoneNumber: document.getElementById("phoneNumber").value,
      level: document.getElementById("level").value,
      gpa: document.getElementById("gpa").value
    };

    fetch(`${apiUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedStudent)
    }).then(() => {
      fetchStudents(searchBar.value.trim(), currentPage);
    });

    studentForm.reset();
    submitBtn.style.display = "inline-block";
    updateBtn.style.display = "none";
  }

  // Search students
  searchBar.addEventListener("input", function() {
    const searchQuery = searchBar.value.trim();
    currentPage = 1;
    fetchStudents(searchQuery, currentPage);
  });

  fetchStudents("", currentPage);
});

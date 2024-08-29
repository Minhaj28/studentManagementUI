document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://localhost:44388/api/student";
  const studentForm = document.getElementById("studentForm");
  const studentIDInput = document.getElementById("studentID");
  const submitBtn = document.getElementById("submitBtn");
  const updateBtn = document.getElementById("updateBtn");
  const studentTableBody = document.querySelector("#studentTable tbody");
  const searchBar = document.getElementById("searchBar");

  // Fetch and display students
  function fetchStudents(searchQuery = "") {
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        studentTableBody.innerHTML = "";
        data
          .filter((student) => {
            const searchString = searchQuery.toLowerCase();
            return (
              student.name.toLowerCase().includes(searchString) ||
              student.address.toLowerCase().includes(searchString) ||
              student.email.toLowerCase().includes(searchString) ||
              student.phoneNumber.toLowerCase().includes(searchString) ||
              student.level.toLowerCase().includes(searchString) ||
              student.gpa.toLowerCase().includes(searchString)
            );
          })
          .forEach((student) => {
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

            row
              .querySelector(".edit-btn")
              .addEventListener("click", () => editStudent(student));
            row
              .querySelector(".delete-btn")
              .addEventListener("click", () =>
                deleteStudent(student.studentID)
              );

            studentTableBody.appendChild(row);
          });
      });
  }

  // Create or update student
  studentForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const student = {
      name: document.getElementById("name").value,
      address: document.getElementById("address").value,
      email: document.getElementById("email").value,
      phoneNumber: document.getElementById("phoneNumber").value,
      level: document.getElementById("level").value,
      gpa: document.getElementById("gpa").value,
    };

    // Create student
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    }).then(() => {
      fetchStudents(); // Refresh the table after creating a student
      studentForm.reset();
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

    updateBtn.onclick = function () {
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
      gpa: document.getElementById("gpa").value,
    };

    fetch(`${apiUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedStudent),
    }).then(() => {
      fetchStudents(); // Refresh the table after updating a student
      studentForm.reset();
      submitBtn.style.display = "inline-block";
      updateBtn.style.display = "none";
    });
  }

  // Delete student
  function deleteStudent(id) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this student?"
    );

    if (confirmDelete) {
      fetch(`${apiUrl}/${id}`, {
        method: "DELETE",
      })
        .then(() => {
          fetchStudents(); // Refresh the table after deleting a student
        })
        .catch((error) => {
          console.error("Error deleting student:", error);
        });
    }
  }

  // Search students
  searchBar.addEventListener("input", function () {
    const searchQuery = searchBar.value.trim();
    fetchStudents(searchQuery);
  });

  fetchStudents();
});

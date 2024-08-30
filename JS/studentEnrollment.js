document.addEventListener("DOMContentLoaded", function () {
    const apiUrl = "https://localhost:44388/api/StudentEnrollment";
    const studentUrl = "https://localhost:44388/api/student";
    const courseUrl = "https://localhost:44388/api/course";
    const enrollmentForm = document.getElementById("enrollmentForm");
    const studentIdSelect = document.getElementById("studentId");
    const courseIdSelect = document.getElementById("courseId");
    const enrollmentTableBody = document.querySelector("#enrollmentTable tbody");
    const searchBar = document.getElementById("searchBar");
  
    const deleteModal = document.getElementById("deleteModal");
    const closeModalBtn = document.querySelector(".close");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const currentPageDisplay = document.getElementById("currentPage");
    const totalPagesDisplay = document.getElementById("totalPages");
  
    let currentPage = 1;
    let enrollmentsPerPage = 5;
    let totalPages = 1;
  
    let enrollmentToDeleteId = null;
  
    // Fetch students for selection
    function fetchStudents() {
      fetch(studentUrl)
        .then((response) => response.json())
        .then((students) => {
          students.forEach((student) => {
            const option = document.createElement("option");
            option.value = student.studentID;
            option.textContent = student.name;
            studentIdSelect.appendChild(option);
          });
        });
    }
  
    // Fetch courses for selection
    function fetchCourses() {
      fetch(courseUrl)
        .then((response) => response.json())
        .then((courses) => {
          courses.forEach((course) => {
            const option = document.createElement("option");
            option.value = course.courseId;
            option.textContent = course.courseName;
            courseIdSelect.appendChild(option);
          });
        });
    }
  
    // Fetch enrollments and display in table
    function fetchEnrollments(searchQuery = "", page = 1) {
      fetch(`${apiUrl}/allStudentEnrollmentView`)
        .then((response) => response.json())
        .then((data) => {
          // Filter the data based on search query
          const filteredData = data.filter((enrollment) => {
            const searchString = searchQuery.toLowerCase();
            return (
              enrollment.studentEnrollmentId.toString().includes(searchString) ||
              enrollment.name.toLowerCase().includes(searchString) ||
              enrollment.courseName.toLowerCase().includes(searchString)
            );
          });
  
          totalPages = Math.ceil(filteredData.length / enrollmentsPerPage);
          const startIndex = (page - 1) * enrollmentsPerPage;
          const paginatedData = filteredData.slice(
            startIndex,
            startIndex + enrollmentsPerPage
          );
  
          enrollmentTableBody.innerHTML = "";
          paginatedData.forEach((enrollment) => {
            const row = document.createElement("tr");
  
            row.innerHTML = `
              <td>${enrollment.studentEnrollmentId}</td>
              <td>${enrollment.name}</td>
              <td>${enrollment.courseName}</td>
              <td>
                <button class="delete-btn">Delete</button>
              </td>
            `;
  
            row
              .querySelector(".delete-btn")
              .addEventListener("click", () =>
                openDeleteModal(enrollment.studentEnrollmentId)
              );
  
            enrollmentTableBody.appendChild(row);
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
        fetchEnrollments(searchBar.value.trim(), currentPage);
      }
    });
  
    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        fetchEnrollments(searchBar.value.trim(), currentPage);
      }
    });
  
    function openDeleteModal(id) {
      enrollmentToDeleteId = id;
      deleteModal.style.display = "block";
    }
  
    function closeModal() {
      deleteModal.style.display = "none";
      enrollmentToDeleteId = null;
    }
  
    confirmDeleteBtn.addEventListener("click", function () {
      if (enrollmentToDeleteId) {
        fetch(`${apiUrl}/${enrollmentToDeleteId}`, {
          method: "DELETE",
        })
          .then(() => {
            closeModal();
            fetchEnrollments(searchBar.value.trim(), currentPage);
          })
          .catch((error) => {
            console.error("Error deleting enrollment:", error);
          });
      }
    });
  
    cancelDeleteBtn.addEventListener("click", closeModal);
    closeModalBtn.addEventListener("click", closeModal);
  
    enrollmentForm.addEventListener("submit", function (e) {
      e.preventDefault();
  
      const enrollment = {
        studentID: studentIdSelect.value,
        courseId: courseIdSelect.value,
      };
  
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enrollment),
      }).then(() => {
        enrollmentForm.reset();
        fetchEnrollments(searchBar.value.trim(), currentPage);
      });
    });
  
    searchBar.addEventListener("input", function () {
      const searchQuery = searchBar.value.trim();
      currentPage = 1;
      fetchEnrollments(searchQuery, currentPage);
    });
  
    // Initial load
    fetchStudents();
    fetchCourses();
    fetchEnrollments("", currentPage);
  });
  
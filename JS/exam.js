document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "https://localhost:44388/api/exam";
    const courseUrl = "https://localhost:44388/api/course";
    const examForm = document.getElementById("examForm");
    const courseIdSelect = document.getElementById("courseId");
    const examTableBody = document.querySelector("#examTable tbody");
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
    let examsPerPage = 10;
    let totalPages = 1;

    let examToDeleteId = null;

    // Fetch courses for selection
    function fetchCourses() {
        fetch(courseUrl)
            .then(response => response.json())
            .then(courses => {
                courses.forEach(course => {
                    const option = document.createElement("option");
                    option.value = course.courseId;
                    option.textContent = course.courseName;
                    courseIdSelect.appendChild(option);
                });
            });
    }

    // Fetch exams and display in table
    function fetchExams(searchQuery = "", page = 1) {
        fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          // Filter the data based on search query
          const filteredData = data.filter(exam => {
            const searchString = searchQuery.toLowerCase();
            return (
                exam.examId.toString().includes(searchString) ||
                exam.courseName.toLowerCase().includes(searchString) ||
                exam.examDate.toLowerCase().includes(searchString) ||
                exam.examType.toLowerCase().includes(searchString)
            );
          });
  
          totalPages = Math.ceil(filteredData.length / examsPerPage);
          const startIndex = (page - 1) * examsPerPage;
          const paginatedData = filteredData.slice(startIndex, startIndex + examsPerPage);
  
          examTableBody.innerHTML = "";
          paginatedData.forEach(exam => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${exam.examId}</td>
                <td>${exam.courseName}</td>
                <td>${exam.examDate}</td>
                <td>${exam.examType}</td>
                <td>
                    <button class="delete-btn">Delete</button>
                </td>
            `;

            row.querySelector(".delete-btn").addEventListener("click", () => openDeleteModal(exam.examId));

            examTableBody.appendChild(row);
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
      fetchExams(searchBar.value.trim(), currentPage);
    }
  });

  nextPageBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchExams(searchBar.value.trim(), currentPage);
    }
  });

    function openDeleteModal(id) {
        examToDeleteId = id;
        deleteModal.style.display = "block";
    }

    function closeModal() {
        deleteModal.style.display = "none";
        examToDeleteId = null;
    }

    confirmDeleteBtn.addEventListener("click", function() {
        if (examToDeleteId) {
            fetch(`${apiUrl}/${examToDeleteId}`, {
                method: "DELETE"
            })
            .then(() => {
                closeModal();
                fetchExams(searchBar.value.trim(), currentPage);
            })
            .catch(error => {
                console.error("Error deleting exam:", error);
            });
        }
    });

    cancelDeleteBtn.addEventListener("click", closeModal);
    closeModalBtn.addEventListener("click", closeModal);

    examForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const exam = {
            courseId: courseIdSelect.value,
            examDate: document.getElementById("examDate").value,
            examType: document.getElementById("examType").value
        };

        fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(exam)
        }).then(() => {
            examForm.reset();
            fetchExams(searchBar.value.trim(), currentPage);
        });
    });

    searchBar.addEventListener("input", function() {
        const searchQuery = searchBar.value.trim();
        currentPage = 1;
        fetchExams(searchQuery, currentPage);
      });

    // Initial load
    fetchCourses();
    fetchExams();
});

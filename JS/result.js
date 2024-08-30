document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "https://localhost:44388/api/result";
    const examUrl = "https://localhost:44388/api/exam";
    const studentUrl = "https://localhost:44388/api/student";
    const resultForm = document.getElementById("resultForm");
    const examIdSelect = document.getElementById("examId");
    const studentIdSelect = document.getElementById("studentId");
    const resultTableBody = document.querySelector("#resultTable tbody");
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
    let resultsPerPage = 10;
    let totalPages = 1;

    let resultToDeleteId = null;

    // Fetch exams for selection
    function fetchExams() {
        fetch(examUrl)
            .then(response => response.json())
            .then(exams => {
                exams.forEach(exam => {
                    const option = document.createElement("option");
                    option.value = exam.examId;
                    option.textContent = `${exam.courseName}(${exam.examType}) - ${exam.examDate}`;
                    examIdSelect.appendChild(option);
                });
            });
    }

    // Fetch students for selection
    function fetchStudents() {
        fetch(studentUrl)
            .then(response => response.json())
            .then(students => {
                students.forEach(student => {
                    const option = document.createElement("option");
                    option.value = student.studentID;
                    option.textContent = `${student.name}(${student.level})`;
                    studentIdSelect.appendChild(option);
                });
            });
    }

    // Fetch results and display in table
    function fetchResults(searchQuery = "", page = 1) {
        fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          // Filter the data based on search query
          const filteredData = data.filter(result => {
            const searchString = searchQuery.toLowerCase();
            return (
                result.resultId.toString().includes(searchString) ||
                result.examId.toString().includes(searchString) ||
                result.studentID.toString().includes(searchString) ||
                result.name.toLowerCase().includes(searchString) ||
                result.courseName.toLowerCase().includes(searchString) ||
                result.score.toString().includes(searchString)
            );
          });
  
          totalPages = Math.ceil(filteredData.length / resultsPerPage);
          const startIndex = (page - 1) * resultsPerPage;
          const paginatedData = filteredData.slice(startIndex, startIndex + resultsPerPage);
  
          resultTableBody.innerHTML = "";
          paginatedData.forEach(result => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${result.resultId}</td>
                <td>${result.examId}</td>
                <td>${result.studentID}</td>
                <td>${result.name}</td>
                <td>${result.courseName}</td>
                <td>${result.score}</td>
                <td>
                    <button class="delete-btn">Delete</button>
                </td>
            `;

            row.querySelector(".delete-btn").addEventListener("click", () => openDeleteModal(result.resultId));

            resultTableBody.appendChild(row);
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
            fetchResults(searchBar.value.trim(), currentPage);
        }
    });

    nextPageBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchResults(searchBar.value.trim(), currentPage);
        }
    });

    function openDeleteModal(id) {
        resultToDeleteId = id;
        deleteModal.style.display = "block";
    }

    function closeModal() {
        deleteModal.style.display = "none";
        resultToDeleteId = null;
    }

    confirmDeleteBtn.addEventListener("click", function() {
        if (resultToDeleteId) {
            fetch(`${apiUrl}/${resultToDeleteId}`, {
                method: "DELETE"
            })
            .then(() => {
                closeModal();
                fetchResults(searchBar.value.trim(), currentPage);
            })
            .catch(error => {
                console.error("Error deleting result:", error);
            });
        }
    });

    cancelDeleteBtn.addEventListener("click", closeModal);
    closeModalBtn.addEventListener("click", closeModal);

    resultForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const result = {
            examId: examIdSelect.value,
            studentID: studentIdSelect.value,
            score: document.getElementById("score").value
        };

        fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result)
        }).then(() => {
            resultForm.reset();
            fetchResults(searchBar.value.trim(), currentPage);
        });
    });

    searchBar.addEventListener("input", function() {
        const searchQuery = searchBar.value.trim();
        currentPage = 1;
        fetchResults(searchQuery, currentPage);
    });

    // Initial load
    fetchExams();
    fetchStudents();
    fetchResults("", currentPage);
});

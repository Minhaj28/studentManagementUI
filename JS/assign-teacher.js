document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "https://localhost:44388/api/teacher/assigned-teachers";
    const courseUrl = "https://localhost:44388/api/course";
    const teacherUrl = "https://localhost:44388/api/teacher";
    const assignedTeacherForm = document.getElementById("assignedTeacherForm");
    const teacherIdSelect = document.getElementById("teacherId");
    const courseIdSelect = document.getElementById("courseId");
    const assignedTeacherTableBody = document.querySelector("#assignedTeacherTable tbody");
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
    let itemsPerPage = 10;
    let totalPages = 1;

    let itemToDeleteId = null;

    // Fetch teachers for selection
    function fetchTeachers() {
        fetch(teacherUrl)
            .then(response => response.json())
            .then(teachers => {
                teachers.forEach(teacher => {
                    const option = document.createElement("option");
                    option.value = teacher.teacherId;
                    option.textContent = teacher.name;
                    teacherIdSelect.appendChild(option);
                });
            });
    }

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

    // Fetch assigned teachers and display in table
    function fetchAssignedTeachers(searchQuery = "", page = 1) {
        fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Filter the data based on search query
            const filteredData = data.filter(item => {
                const searchString = searchQuery.toLowerCase();
                return (
                    item.assignedTeacherId.toString().includes(searchString) ||
                    item.name.toLowerCase().includes(searchString) ||
                    item.courseName.toLowerCase().includes(searchString)
                );
            });

            totalPages = Math.ceil(filteredData.length / itemsPerPage);
            const startIndex = (page - 1) * itemsPerPage;
            const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

            assignedTeacherTableBody.innerHTML = "";
            paginatedData.forEach(item => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${item.assignedTeacherId}</td>
                    <td>${item.name}</td>
                    <td>${item.courseName}</td>
                    <td>
                        <button class="delete-btn">Delete</button>
                    </td>
                `;

                row.querySelector(".delete-btn").addEventListener("click", () => openDeleteModal(item.assignedTeacherId));

                assignedTeacherTableBody.appendChild(row);
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
            fetchAssignedTeachers(searchBar.value.trim(), currentPage);
        }
    });

    nextPageBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchAssignedTeachers(searchBar.value.trim(), currentPage);
        }
    });

    function openDeleteModal(id) {
        itemToDeleteId = id;
        deleteModal.style.display = "block";
    }

    function closeModal() {
        deleteModal.style.display = "none";
        itemToDeleteId = null;
    }

    confirmDeleteBtn.addEventListener("click", function() {
        if (itemToDeleteId) {
            fetch(`https://localhost:44388/api/teacher/assigned-teacher/${itemToDeleteId}`, {
                method: "DELETE"
            })
            .then(() => {
                closeModal();
                fetchAssignedTeachers(searchBar.value.trim(), currentPage);
            })
            .catch(error => {
                console.error("Error deleting assigned teacher:", error);
            });
        }
    });

    cancelDeleteBtn.addEventListener("click", closeModal);
    closeModalBtn.addEventListener("click", closeModal);

    assignedTeacherForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const assignedTeacher = {
            teacherId: teacherIdSelect.value,
            courseId: courseIdSelect.value
        };

        fetch(`https://localhost:44388/api/teacher/assign-teacher`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(assignedTeacher)
        }).then(() => {
            assignedTeacherForm.reset();
            fetchAssignedTeachers(searchBar.value.trim(), currentPage);
        });
    });

    searchBar.addEventListener("input", function() {
        const searchQuery = searchBar.value.trim();
        currentPage = 1;
        fetchAssignedTeachers(searchQuery, currentPage);
    });

    // Initial load
    fetchTeachers();
    fetchCourses();
    fetchAssignedTeachers("", currentPage);
});

document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "https://localhost:44388/api/course";
    const courseForm = document.getElementById("courseForm");
    const courseIDInput = document.getElementById("courseID");
    const submitBtn = document.getElementById("submitBtn");
    const updateBtn = document.getElementById("updateBtn");
    const courseTableBody = document.querySelector("#courseTable tbody");
    const searchBar = document.getElementById("searchBar");

    const deleteModal = document.getElementById("deleteModal");
    const closeModalBtn = document.querySelector(".close");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const currentPageDisplay = document.getElementById("currentPage");
    const totalPagesDisplay = document.getElementById("totalPages");

    let courseToDeleteId = null;
    let currentPage = 1;
    let coursesPerPage = 10;
    let totalPages = 1;

    function fetchCourses(searchQuery = "", page = 1) {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const filteredData = data.filter(course => {
                    const searchString = searchQuery.toLowerCase();
                    return (
                        course.courseId.toString().includes(searchString) ||
                        course.courseName.toLowerCase().includes(searchString) ||
                        course.description.toLowerCase().includes(searchString) ||
                        course.level.toLowerCase().includes(searchString)
                    );
                });

                totalPages = Math.ceil(filteredData.length / coursesPerPage);
                const startIndex = (page - 1) * coursesPerPage;
                const paginatedData = filteredData.slice(startIndex, startIndex + coursesPerPage);

                courseTableBody.innerHTML = "";
                paginatedData.forEach(course => {
                    const row = document.createElement("tr");

                    row.innerHTML = `
                        <td>${course.courseId}</td>
                        <td>${course.courseName}</td>
                        <td>${course.description}</td>
                        <td>${course.level}</td>
                        <td>
                            <button class="edit-btn">Edit</button>
                            <button class="delete-btn">Delete</button>
                        </td>
                    `;

                    row.querySelector(".edit-btn").addEventListener("click", () => editCourse(course));
                    row.querySelector(".delete-btn").addEventListener("click", () => openDeleteModal(course.courseId));

                    courseTableBody.appendChild(row);
                });

                currentPageDisplay.textContent = currentPage;
                totalPagesDisplay.textContent = totalPages;

                prevPageBtn.disabled = currentPage === 1;
                nextPageBtn.disabled = currentPage === totalPages;
            });
    }

    function openDeleteModal(id) {
        courseToDeleteId = id;
        deleteModal.style.display = "block";
    }

    function closeModal() {
        deleteModal.style.display = "none";
        courseToDeleteId = null;
    }

    confirmDeleteBtn.addEventListener("click", function() {
        if (courseToDeleteId) {
            fetch(`${apiUrl}/${courseToDeleteId}`, {
                method: "DELETE"
            })
            .then(() => {
                closeModal();
                fetchCourses(searchBar.value.trim(), currentPage);
            })
            .catch(error => {
                console.error("Error deleting course:", error);
            });
        }
    });

    cancelDeleteBtn.addEventListener("click", closeModal);
    closeModalBtn.addEventListener("click", closeModal);

    courseForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const course = {
            courseId: courseIDInput.value || 0,
            courseName: document.getElementById("courseName").value,
            description: document.getElementById("description").value,
            level: document.getElementById("level").value
        };

        if (course.courseId) {
            // Update existing course
            fetch(`${apiUrl}/${course.courseId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(course)
            })
            .then(() => {
                fetchCourses(searchBar.value.trim(), currentPage);
                courseForm.reset();
                submitBtn.style.display = "inline-block";
                updateBtn.style.display = "none";
            });
        } else {
            // Create new course
            fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(course)
            })
            .then(() => {
                fetchCourses(searchBar.value.trim(), currentPage);
                courseForm.reset();
            });
        }
    });

    function editCourse(course) {
        courseIDInput.value = course.courseId;
        document.getElementById("courseName").value = course.courseName;
        document.getElementById("description").value = course.description;
        document.getElementById("level").value = course.level;

        submitBtn.style.display = "none";
        updateBtn.style.display = "inline-block";

        updateBtn.onclick = function() {
            updateCourse(course.courseId);
        };
    }

    function updateCourse(id) {
        const updatedCourse = {
            courseId: id,
            courseName: document.getElementById("courseName").value,
            description: document.getElementById("description").value,
            level: document.getElementById("level").value
        };

        fetch(`${apiUrl}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCourse)
        })
        .then(() => {
            fetchCourses(searchBar.value.trim(), currentPage);
            courseForm.reset();
            submitBtn.style.display = "inline-block";
            updateBtn.style.display = "none";
        });
    }

    searchBar.addEventListener("input", function() {
        fetchCourses(searchBar.value.trim(), currentPage);
    });

    prevPageBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            fetchCourses(searchBar.value.trim(), currentPage);
        }
    });

    nextPageBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchCourses(searchBar.value.trim(), currentPage);
        }
    });

    fetchCourses();
});

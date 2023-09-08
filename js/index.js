// PROJECTS PAGE

// variables

const domainName = 'http://localhost:5678'
let projects = [];
let categories = [];

// display projects

async function displayProjects(projects) {
    console.log("Inside displayProjects with data:", projects);

    try {
        const galleryDiv = document.querySelector('#gallery');
        const projectTemplate = document.querySelector('#project-template');

        if (!galleryDiv || !projectTemplate) {
            throw new Error("DOM elements not found.");
        }

        galleryDiv.querySelectorAll('*:not(template)').forEach((element) => element.remove());

        projects.forEach((project) => {
            const projectDiv = projectTemplate.content.cloneNode(true);

            const projectImg = projectDiv.querySelector('figure > img');
            projectImg.setAttribute('src', project.imageUrl);
            projectImg.setAttribute('alt', project.title);

            projectDiv.querySelector('figcaption').innerText = project.title;

            galleryDiv.appendChild(projectDiv);
        });
    } catch (error) {
        console.error("There was an error displaying projects: ", error);
    }
}

// display categories

function displayCategory(categoryLabel, projects, filter = true) {
    const categoryTemplate = document.querySelector('#category-template');

    if (!categoryTemplate) {
        console.error("Category template not found.");
        return;
    }

    const categoryDiv = categoryTemplate.content.cloneNode(true);
    const categoryLink = categoryDiv.querySelector('a');

    categoryLink.classList.add('filter-button');
    categoryLink.innerText = categoryLabel;

    categoryLink.addEventListener('click', (event) => {
        event.preventDefault();

        displayProjects(
            filter ?
                projects.filter((project) => project.category.name === categoryLabel)
                : projects
        );
    });

    const parent = categoryTemplate.parentElement;
    if (parent) {
        parent.appendChild(categoryDiv);
    } else {
        console.error("Category template parent not found.");
    }
}

// fetch categories

async function fetchCategories() {
    try {
        const response = await fetch(`${domainName}/api/categories`);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Categories could not be loaded:", error);
        return [];
    }
}

// fetch projects

async function fetchProjects() {
    try {
        const response = await fetch(`${domainName}/api/works`);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        projects = await response.json();

        const categoriesResponse = await fetchCategories();

        const filterContainer = document.querySelector('.filter-container ul');
        filterContainer.innerHTML = '';

        categoriesResponse.forEach((category) => displayCategory(category.name, projects));

        displayProjects(projects);
    } catch (error) {
        console.error("Error during fetchProjects:", error);
    }
}



document.addEventListener('DOMContentLoaded', async () => {
    try {
        await fetchProjects();
        await fetchCategories();
    } catch (error) {
        console.error("Error during initialization:", error);
    }
});

// display the edit button

document.addEventListener('DOMContentLoaded', () => {
    const editButton = document.getElementById('edit-button');

    if (localStorage.getItem('userId') && localStorage.getItem('token')) {
        editButton.style.display = 'block';
        updateNavText(true); // User is logged in, update the navigation text
    } else {
        editButton.style.display = 'none';
        updateNavText(false); // User is not logged in, update the navigation text
    }
});

// update login/logout

function updateNavText(isLoggedIn) {
    const loginNavItem = document.querySelector('nav ul li a');
    if (isLoggedIn) {
        loginNavItem.textContent = 'logout';
        loginNavItem.href = 'login.html'; // Set the logout URL here
    } else {
        loginNavItem.textContent = 'login';
        loginNavItem.href = 'login.html'; // Set the login URL here
    }
}






// MODAL

// open the modal
document.getElementById("edit-button").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("dialog-container").style.display = "flex";
});

// close the modal with the cross
document.getElementById("cross").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("dialog-container").style.display = "none";
});

// close the modal when clicking out
document.getElementById("dialog-container").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
        document.getElementById("dialog-container").style.display = "none";
    }
});

// fetch projects
async function populateModalWithProjects() {
    try {
        const projectListUl = document.querySelector('#modal-project-list');
        projectListUl.innerHTML = '';

        // Assuming 'projects' is defined globally or elsewhere in your code
        if (!window.projects) {
            const response = await fetch(`${domainName}/api/works`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            window.projects = await response.json();
        }

        projects.forEach((project) => {
            const projectLi = document.createElement('li');

            projectLi.innerHTML = `
                <div class="project-container">
                    <img src="${project.imageUrl}" alt="${project.title}"/>
                    <button class="delete-project" data-id="${project.id}">🗑️</button>
                </div>
            `;

            projectLi.querySelector('.delete-project').addEventListener('click', async (e) => {
                const projectId = e.target.getAttribute('data-id');
                try {
                    await deleteProject(projectId);
                    await fetchProjects();
                    await populateModalWithProjects();
                    await hideDeleteButtons();
                } catch (error) {
                    console.error(`Error deleting project ${projectId}:`, error);
                }
            });

            projectListUl.appendChild(projectLi);
        });
    } catch (error) {
        console.error("An error occurred while opening the modal: ", error);
    }
}

document.getElementById("edit-button").addEventListener("click", async (e) => {
    e.preventDefault();
    document.getElementById("dialog-container").style.display = "flex";

    populateModalWithProjects();

    document.getElementById("delete-gallery").addEventListener("click", () => {
        const deleteButtons = document.querySelectorAll('.delete-project');
        deleteButtons.forEach(button => {
            button.style.display = 'block';
        });
    });
});

// hide delete buttons when one is clicked
async function hideDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.delete-project');
    deleteButtons.forEach(button => {
        button.style.display = 'none';
    });
}

// open explorer onclick
document.getElementById("add-photo-button").addEventListener("click", () => {
    const dialogContent = document.getElementById("dialog-content");
    dialogContent.innerHTML = "";

    const title = document.querySelector('#title > h3');
    title.innerText = "Ajouter une photo"

    const newWorkForm = document.getElementById("new-work-form");
    const newWorkFormContent = newWorkForm.content.cloneNode(true);

    const workCategories = newWorkFormContent.getElementById("work-categories");
    console.log(workCategories);
    try {
        for (let category of categories) {
            categories = fetchCategories();
            const categoryOption = document.createElement('option');
            categoryOption.innerText = category.name;
            categoryOption.value = category.id;
            workCategories.appendChild(categoryOption);
        }

        dialog.appendChild(newWorkFormContent);

        const workForm = document.getElementById("work-form");
        workForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(workForm);

            const response = await fetch(`${domainName}/api/works`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await fetchProjects();

            workForm.reset();
        });
    } catch (error) {
        console.error("An error occurred while opening the explorer: ", error);
    }
});

// delete a project
async function deleteProject(id) {
    try {
        const response = await fetch(`${domainName}/api/works/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
    } catch (error) {
        console.error(`The project ${id} was not deleted:`, error);
    }
}

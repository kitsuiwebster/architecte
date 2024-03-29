// PROJECTS PAGE

// variables

const domainName = "http://localhost:5678";
let projects = [];
let categories = [];

// display projects

async function displayProjects(projects) {
  console.log("Inside displayProjects with data:", projects);

  try {
    const galleryDiv = document.querySelector("#gallery");
    const projectTemplate = document.querySelector("#project-template");

    if (!galleryDiv || !projectTemplate) {
      throw new Error("DOM elements not found.");
    }

    galleryDiv
      .querySelectorAll("*:not(template)")
      .forEach((element) => element.remove());
    // document.querySelectorAll('.filter-container > ul > *:not(template)').forEach((element) => element.remove());
    
    projects.forEach((project) => {
      const projectDiv = projectTemplate.content.cloneNode(true);

      const projectImg = projectDiv.querySelector("figure > img");
      projectImg.setAttribute("src", project.imageUrl);
      projectImg.setAttribute("alt", project.title);

      projectDiv.querySelector("figcaption").innerText = project.title;

      galleryDiv.appendChild(projectDiv);
    });
    
  } catch (error) {
    console.error("There was an error displaying projects: ", error);
  }
}

// display categories

function displayCategory(categoryLabel, projects, filter = true) {
  const categoryTemplate = document.querySelector("#category-template");

  if (!categoryTemplate) {
    console.error("Category template not found.");
    return;
  }


  const categoryDiv = categoryTemplate.content.cloneNode(true);
  const categoryLink = categoryDiv.querySelector("a");

  categoryLink.classList.add("filter-button");
  categoryLink.innerText = categoryLabel;

  if (categoryLabel === "Tous") {
    categoryLink.id = "all-category";
  }

  categoryLink.addEventListener("click", (event) => {
    event.preventDefault();

    if (categoryLabel === "Tous") {
      displayProjects(projects);
    } else {
      displayProjects(
        filter
          ? projects.filter(
              (project) => project.category.name === categoryLabel
            )
          : projects
      );
    }
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

    categoriesResponse.forEach((category) =>
      displayCategory(category.name, projects)
    );

    displayProjects(projects);
  } catch (error) {
    console.error("Error during fetchProjects:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await fetchCategories();
    await fetchProjects();

    const allCategoryLink = document.getElementById("all-category");
    if (allCategoryLink) {
      allCategoryLink.addEventListener("click", (event) => {
        event.preventDefault();
        displayProjects(projects);
      });
    }
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});

// display the edit button

document.addEventListener("DOMContentLoaded", () => {
  const editButton = document.getElementById("edit-button");

  if (localStorage.getItem("userId") && localStorage.getItem("token")) {
    editButton.style.display = "block";
    updateNavText(true);
  } else {
    editButton.style.display = "none";
    updateNavText(false);
  }
});

// update login/logout

function updateNavText(isLoggedIn) {
  const loginNavItem = document.querySelector("nav ul li a");
  if (isLoggedIn) {
    loginNavItem.textContent = "logout";
    loginNavItem.href = "login.html";
  } else {
    loginNavItem.textContent = "login";
    loginNavItem.href = "login.html";
  }
}

// MODAL
let isInForm = false;

// close the modal with the cross
document.getElementById("cross").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("dialog-container").style.display = "none";
  isInForm ? resetWorkForm() : resetDialogContent();
});

// close the modal when clicking out
document.getElementById("dialog-container").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    console.log("clicked out");
    document.getElementById("dialog-container").style.display = "none";
    isInForm ? resetWorkForm() : resetDialogContent();
  }
});

// fetch projects
async function populateModalWithProjects() {
  try {
    openModal();
    const projectListUl = document.querySelector("#modal-project-list");
    projectListUl.innerHTML = "";

    if (!window.projects) {
      const response = await fetch(`${domainName}/api/works`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      window.projects = await response.json();
    }

    projects.forEach((project) => {
      const projectLi = document.createElement("li");

      projectLi.innerHTML = `
                <div class="project-container">
                    <img src="${project.imageUrl}" alt="${project.title}"/>
                    <button class="delete-project" data-id="${project.id}">🗑️</button>
                </div>
            `;

      projectLi
        .querySelector(".delete-project")
        .addEventListener("click", async (e) => {
          const projectId = e.target.getAttribute("data-id");
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
    const deleteButtons = document.querySelectorAll(".delete-project");
    deleteButtons.forEach((button) => {
      button.style.display = "block";
    });
  });
});

// hide delete buttons when one is clicked
async function hideDeleteButtons() {
  const deleteButtons = document.querySelectorAll(".delete-project");
  deleteButtons.forEach((button) => {
    button.style.display = "none";
  });
}

// go back to initial modal

function openModal() {
  const dialog = document.getElementById("dialog");
  const dialogContent = document.getElementById("dialog-content");
  const dialogContentClone = dialogContent.content.cloneNode(true);
  const contentContainer = document.getElementById("content-container");
  if (contentContainer) {
    contentContainer.remove();
  }
  dialog.appendChild(dialogContentClone);
  dialog.lastElementChild.style.display = "block";
  openExplorer();
}

function resetDialogContent() {
  const dialog = document.getElementById("dialog");
  document.getElementById("buttons-container").remove();
  document.getElementById("projects-list").remove();
  //   dialog.removeChild(buttonsContainer);
  //   dialog.removeChild(projectList);
  isInForm = false;
}

function resetWorkForm() {
  document.getElementById("work-form").remove();
  document.getElementById("back-arrow-container").remove();
  isInForm = false;
}


// open explorer
function openExplorer() {
  isInForm = true;
  document
    .getElementById("add-photo-button")
    .addEventListener("click", async () => {
      const dialog = document.getElementById("dialog");
      const buttonsContainer = document.getElementById("buttons-container");
      const projectList = document.getElementById("projects-list");
      dialog.remove(buttonsContainer);
      dialog.remove(projectList);

      const title = document.querySelector("#title > h3");
      title.innerText = "Ajouter une photo";

      const newWorkForm = document.getElementById("new-work-form");
      const newWorkFormContent = newWorkForm.content.cloneNode(true);

      const workCategories =
        newWorkFormContent.getElementById("work-categories");
      console.log(workCategories);

      try {
        const categories = await fetchCategories();

        for (let category of categories) {
          const categoryOption = document.createElement("option");
          categoryOption.innerText = category.name;
          categoryOption.value = category.id;
          workCategories.appendChild(categoryOption);
        }

        dialog.appendChild(newWorkFormContent);
        document
          .getElementById("back-arrow-container")
          .addEventListener("click", () => {
            console.log("clicked");
            resetWorkForm();
            openModal();
          });
          
        const workForm = document.getElementById("work-form");
        workForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          resetWorkForm();
          document.querySelectorAll('.filter-container > ul > *:not(template)').forEach((element) => element.remove());
    
          const formData = new FormData(workForm);
          const response = await fetch(`${domainName}/api/works`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          await fetchProjects();

          workForm.reset();
          document.getElementById("dialog-container").style.display = "none";
        });
      } catch (error) {
        console.error("An error occurred while opening the explorer: ", error);
      }
    });
}

// delete a project
async function deleteProject(id) {
    document.querySelectorAll('.filter-container > ul > *:not(template)').forEach((element) => element.remove());
    
  try {
    const response = await fetch(`${domainName}/api/works/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
  } catch (error) {
    console.error(`The project ${id} was not deleted:`, error);
  }
}

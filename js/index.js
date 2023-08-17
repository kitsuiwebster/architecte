
// PROJECTS PAGE

const domainName = 'http://localhost:5678'

async function fetchProjects(projects) {

    try{
    
    const galleryDiv = document.querySelector('#gallery');
    const projectTemplate = document.querySelector('#project-template');

    galleryDiv.querySelectorAll('*:not(template)').forEach((element) => element.remove());

    projects.forEach((project) => {
        const projectDiv = projectTemplate.content.cloneNode(true);

        const projectImg = projectDiv.querySelector('figure > img');
        projectImg.setAttribute('src', project.imageUrl);
        projectImg.setAttribute('alt', project.title);

        projectDiv.querySelector('figcaption').innerText = project.title;

        galleryDiv.appendChild(projectDiv);
    });
    }
    catch(error) {
        console.error("there was an error fetching the projects: ",error);
    }
}



function displayCategory(categoryLabel, projects, filter = true) {
    const categoryTemplate = document.querySelector('#category-template');

    const categoryDiv = categoryTemplate.content.cloneNode(true);
    const categoryLink = categoryDiv.querySelector('a');

    categoryLink.classList.add('filter-button');
    categoryLink.innerText = categoryLabel;

    categoryLink.addEventListener('click', (event) => {
        event.preventDefault();

        fetchProjects(
            filter ?
                projects.filter((project) => project.category.name === categoryLabel)
                : projects
        );
    });

    categoryTemplate.parentElement.appendChild(categoryDiv);
}




document.addEventListener('DOMContentLoaded', async () => {
    

	const response = await fetch(`${domainName}/api/works`);
    	if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    	const projects = await response.json();
		const categories = [...new Set(projects.map((project) => project.category.name))];
		const categoryTemplate = document.querySelector('#category-template');
		const categoryDiv = categoryTemplate.content.cloneNode(true);
		displayCategory('Tous', projects, false);
        categories.forEach((category) => displayCategory(category, projects));

		fetchProjects(projects);
});


// display the edit button

document.addEventListener('DOMContentLoaded', () => {
    const editButton = document.getElementById('edit-button');
    
    if (localStorage.getItem('userId') && localStorage.getItem('token')) {
        editButton.style.display = 'block'; 
        editButton.style.display = 'none';
    }
});



// MODAL

// open the modal

document.getElementById("edit-button").addEventListener("click", (e) => { e.preventDefault();
    document.getElementById("dialog-container").style.display = "flex";
});

// close the modal with the cross

document.getElementById("cross").addEventListener("click", (e) => { e.preventDefault();
    document.getElementById("dialog-container").style.display = "none";
});


// close the modal when clicking out
document.getElementById("dialog-container").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) { 
        document.getElementById("dialog-container").style.display = "none";
    }
});



// fetch projects 

async function populateModalWithProjects(projects) {
    try {
        const projectListUl = document.querySelector('#modal-project-list');
        projectListUl.innerHTML = ''; 

        projects.forEach((project) => {
            const projectLi = document.createElement('li');

            projectLi.innerHTML = `
                <img src="${project.imageUrl}" alt="${project.title}"/>
            `;

            projectListUl.appendChild(projectLi);
        });
    } catch (error) {
        console.error("Une erreur est survenue lors de l'ouverture de la modal: ", error);
    }
}

document.getElementById("edit-button").addEventListener("click", async (e) => {
    e.preventDefault();
    document.getElementById("dialog-container").style.display = "flex";

    if (!window.projects) {
        const response = await fetch(`${domainName}/api/works`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        window.projects = await response.json();
    }

    populateModalWithProjects(window.projects);
});


// open explorer onclick

document.getElementById("add-photo-button").addEventListener("click", () => {
    document.getElementById("photo-upload").click();
});


// send the photo to backend



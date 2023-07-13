
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



// MODAL

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("editButton");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

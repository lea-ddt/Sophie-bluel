async function WorksApi() {
    const url = "http://localhost:5678/api/works";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error.message);
    }
}


async function baseWorks(filter) {
    document.querySelector(".gallery").innerHTML = "";
    document.querySelector(".gallery-modal").innerHTML = "";
   
    try {
        const data = await WorksApi();
       
        let projets;
        if (filter) {
            projets = data.filter((item) => item.categoryId === filter);
        } else {
            projets = data;
        }
   
        projets.forEach(PhotoGallery);
        projets.forEach(PhotoGalleryModal);

        SuppTrashCan();

    } catch (error) {
        console.error(error.message);
    }
}
baseWorks();


function PhotoGallery(data) {
    const images = document.createElement("figure");
    images.setAttribute("data-id", data.id);
    images.innerHTML = `<img src=${data.imageUrl} alt=${data.title}><figcaption>${data.title}<figcaption>`;

    document.querySelector(".gallery").append(images);
}

function PhotoGalleryModal(data) {
    const images = document.createElement("figure");
    images.innerHTML = `<div class="icone-trash">
                        <img src=${data.imageUrl} alt=${data.title}>
                        <i id="${data.id}" class="fa-solid fa-trash-can overlay-icon"></i></div>`;

    document.querySelector(".gallery-modal").append(images);
}

async function CategoriesApi() {
    const url = "http://localhost:5678/api/categories";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        
        const categorySelect = document.getElementById("category")
        let option = document.createElement("option");
        option.value = "";
        option.textContent = "";
        option.selected = false
        categorySelect.appendChild(option);

        json.forEach((data) => {
            CategoriesFilter(data);
            option = document.createElement("option");
            option.value = data.id;
            option.textContent = data.name;
            option.selected = false
            categorySelect.appendChild(option);
        });

        categorySelect.addEventListener("change", (event) => {
            const selectedId = event.target.value;
            if (selectedId) {
                // console.log(`${selectedId}`);
            } else {
                console.log("Pas de catégorie selectionnée");
            }
        });
        

    } catch (error) {
        console.error(error.message);
    }
}
CategoriesApi();


function CategoriesFilter(data) {
    const categorie = document.createElement("div");
    categorie.className = data.id;
    categorie.addEventListener("click", () => baseWorks(data.id));
    categorie.addEventListener("click", (event) => filterhover(event));
    document.querySelector(".Tous").addEventListener("click", (event) => filterhover(event));
    categorie.innerHTML = `${data.name}`;
    document.querySelector(".categorie-div").append(categorie);
}

function filterhover(event){
    const container = document.querySelector(".categorie-div");
    Array.from(container.children).forEach((child) => child.classList.remove("active-filter"));
    event.target.classList.add("active-filter");
}
document.querySelector(".Tous").addEventListener("click", () => baseWorks());

function AdminMode() {
    if (sessionStorage.authtoken){
        const banner = document.createElement("div");
        banner.className = "edition"
        banner.innerHTML = '<p><i class="fa-regular fa-pen-to-square"></i>Mode édition</p>';
        document.body.prepend(banner);
        
        const projetsEdition = document.createElement("div");
        projetsEdition.className = "projets-edition"
        projetsEdition.innerHTML = '<button><i class="fa-regular fa-pen-to-square"></i>modifier</button>'
        document.querySelector(".mes-projets").append(projetsEdition);

        const categoryDiv = document.querySelector(".categorie-div")
        categoryDiv.style.display = "none"

        document.getElementById("logout").innerHTML = "logout";
        document.getElementById("logout").href = "index.html";
        document.getElementById("logout").addEventListener("click", () => sessionStorage.removeItem("authtoken"))
    }
}
AdminMode();

const projetsEdition = document.querySelector(".projets-edition")
if (projetsEdition){
    projetsEdition.addEventListener("click", toggleModal);
}

const modalClosing = document.querySelectorAll(".modal-trigger");
modalClosing.forEach(trigger => trigger.addEventListener("click", toggleModal))

function toggleModal() {
    document.querySelector(".modal-container").classList.toggle("active");
}


async function SuppPhoto(event) {
    const id = event.target.id;
    const SuppApi = `http://localhost:5678/api/works/${id}`;
    const token = sessionStorage.authtoken;

    try {
        let response = await fetch(SuppApi, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token,
            },
        });

        if (response.ok) {
            const modalFigure = event.target.closest("figure");
            if (modalFigure) {
                modalFigure.remove();
            }

            const galleryFigure = document.querySelector(`.gallery figure[data-id="${id}"]`);
            if (galleryFigure) {
                galleryFigure.remove();
            }
        } else {
            const errorMessage = await response.json();
            console.error(errorMessage);
            const errorDiv = document.createElement("div");
            errorDiv.className = "error";
            errorDiv.innerHTML = "Une erreur s'est produite, veuillez réessayer plus tard.";
            document.querySelector(".gallery").append(errorDiv);
        }
    } catch (error) {
        console.error("Erreur lors de la suppression de la photo:", error);
        const errorDiv = document.createElement("div");
        errorDiv.className = "error";
        errorDiv.innerHTML = "Une erreur s'est produite";
        document.querySelector(".gallery").append(errorDiv);
    }
}


const ajouterPhoto = document.querySelector(".ajouter-une-photo")
const boutonRetour = document.querySelector(".retour")

ajouterPhoto.addEventListener("click", switchModal);
boutonRetour.addEventListener("click", switchModal);

function switchModal() {
    const modalGallery = document.querySelector(".modal-gallery");
    const modalAddPhoto = document.querySelector(".modal-add-photo");

    if (modalGallery.style.display === "block" || modalGallery.style.display === "") 
    {
        modalGallery.style.display = "none";
        modalAddPhoto.style.display = "block";
    } else {
        modalGallery.style.display = "block";
        modalAddPhoto.style.display = "none";
    }
}

function SuppTrashCan() {
    const poubelle = document.querySelectorAll(".fa-trash-can");
    poubelle.forEach((e) => e.addEventListener("click", (event) => SuppPhoto(event)));
}

let img = document.createElement("img");
let file;

const fileInput = document.getElementById('file');
const previewContainer = document.getElementById('preview-container');

fileInput.addEventListener('change', function(event) {
    file = event.target.files[0];
    previewContainer.innerHTML = "";

    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
        const imgUrl = URL.createObjectURL(file);

        const imgElement = document.createElement('img');
        imgElement.src = imgUrl;
        imgElement.alt = "Aperçu de l'image";
        imgElement.style.maxWidth = "200px";
        imgElement.style.maxHeight = "200px";

        previewContainer.appendChild(imgElement);
        document.querySelector(".file-display").style.display = "none"

    } else {
        alert("Veuillez sélectionner un fichier JPG ou PNG valide.");
    }});


const titlePicture = document.getElementById("title");
let titleValue = "";

const categorySelect = document.getElementById("category");
categorySelect.addEventListener("change", (event) => {
    selectedValue = event.target.value;
});

titlePicture.addEventListener("input", function () {
    titleValue = titlePicture.value;
})


const imageForm = document.querySelector(".modal-form")
imageForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const validerImage = document.getElementById('preview-container').firstChild;
    if (!validerImage || !titleValue) {
        console.error("L'image ou le titre n'est pas valide.");
        return;
    }

    const formData = new FormData();
    if (file) {
        formData.append("image", file);
        console.log("Fichier ajouté au formulaire : ", file.name);
        document.querySelector(".validate-photo").style.background = '#1D6154';
    } else {
        console.error("Aucun fichier sélectionné.");
    }

    formData.append("title", titleValue);
    console.log("Titre : ", titleValue);

    formData.append("category", selectedValue);
    console.log("Catégorie : ", selectedValue);

    const token = sessionStorage.authtoken;
    if (!token) {
        console.error("Token manquant.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token,
                "accept": "application/json",
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Erreur lors de la requête`);
            return;
        }

        const result = await response.json();
        console.log("Réponse réussie :", result);

        addImageToDOM(result);

        imageForm.reset();
        previewContainer.innerHTML = "";
        document.querySelector(".file-display").style.display = "block";
        validateForm();

        switchModal();
        toggleModal();

    } catch (error) {
        console.error("Erreur lors de la requête POST : ", error);
    }
});

function addImageToDOM(data) {
    PhotoGallery(data);
    PhotoGalleryModal(data);
    SuppTrashCan();
}


const submitButton = document.querySelector(".validate-photo");

function validateForm() {
    const titleValue = titlePicture.value.trim();
    const selectedValue = categorySelect.value.trim();
    const hasImage = file && (file.type === "image/png" || file.type === "image/jpeg");

    if (titleValue && selectedValue && hasImage) {
        // Activer et changer la couleur du bouton
        submitButton.style.backgroundColor = "#1D6154";
        submitButton.disabled = false;
    } else {
        // Désactiver et restaurer la couleur par défaut
        submitButton.style.backgroundColor = "#ccc";
        submitButton.disabled = true;
    }
}

// Écouter les événements sur les champs du formulaire
titlePicture.addEventListener("input", validateForm);
categorySelect.addEventListener("change", validateForm);
fileInput.addEventListener("change", function (event) {
    file = event.target.files[0];
    validateForm();
});
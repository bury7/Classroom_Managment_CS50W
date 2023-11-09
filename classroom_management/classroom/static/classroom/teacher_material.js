const currentURL = window.location.href;
const urlParts = currentURL.split('/');
const valueIndex1 = urlParts.indexOf('classrooms') + 1; 
let valueIndex2 = urlParts.indexOf('assignments') + 1; 
const id = urlParts[valueIndex1];
const assignment_id = urlParts[valueIndex2];


document.addEventListener("DOMContentLoaded", () => { 
    if (document.querySelector("#deadline_div")) {
        if (document.querySelector("#deadline_div").innerHTML.trim().length > 0) {
            update_deadline()
        }}


    document.getElementById("create_assignment_file_input").addEventListener("change", () => {
        const fileInput = document.getElementById("create_assignment_file_input");
        const selectedFilesDiv = document.getElementById("selected-files-assignment");

        // Clear the previous file names
        selectedFilesDiv.innerHTML = "";

        // Check if files have been selected
        if (fileInput.files.length > 0) {
            for (let i = 0; i < fileInput.files.length; i++) {
                const fileName = fileInput.files[i].name;
                
                // Create the card structure
                const cardDiv = document.createElement("div");
                cardDiv.classList.add("card", "mb-2");

                const cardBodyDiv = document.createElement("div");
                cardBodyDiv.classList.add("card-body");

                const cardTitleDiv = document.createElement("div");
                cardTitleDiv.classList.add("d-flex", "justify-content-between", "align-items-center");

                const cardTitle = document.createElement("h5");
                cardTitle.classList.add("card-title", "col-lg-9");
                cardTitle.textContent = `${fileName}`; 

                // Append elements to create the card structure
                cardTitleDiv.appendChild(cardTitle);
                cardBodyDiv.appendChild(cardTitleDiv);
                cardDiv.appendChild(cardBodyDiv);

                // Append the card to the selectedFilesDiv
                selectedFilesDiv.appendChild(cardDiv);
            }
        } else {
            const noFilesElement = document.createElement("p");
            noFilesElement.textContent = "No files selected.";
            selectedFilesDiv.appendChild(noFilesElement);
        }
    });

    document.getElementById("clear-files-assignment").addEventListener("click", () => {
        const selectedFilesDiv = document.getElementById("selected-files-assignment");
        selectedFilesDiv.innerHTML = ""; 
        const fileInput = document.getElementById("create_assignment_file_input");
        fileInput.value = ""
    });


    document.querySelector("#add_assignment_link").addEventListener("click", () => {
        let div_link = document.querySelector("#create_assignment_links");
        let link = document.querySelector("#create_assignment_link");

        if (link.value) {
            if (!link.value.startsWith("http")) {
                link.value = "https://" + link.value;
            }

            let added_link = document.createElement("a");
            added_link.setAttribute("href", link.value);
    
            let h5 = document.createElement("h5");
            h5.classList.add("card-title","links-values-edit", "col-lg-9");
            h5.innerHTML = `${link.value}`;
    

            let linkContainer = document.createElement("div");
            linkContainer.classList.add("d-flex", "justify-content-between", "align-items-center");
    
            let deleteButton = document.createElement("button");
            deleteButton.classList.add("btn", "btn-danger", "col-lg-2"); 
            deleteButton.innerHTML = '<i class="fas fa-times"></i>'; 
    
            deleteButton.addEventListener("click", () => {
                div_link.removeChild(div_card);
            });

            added_link.append(h5)
            linkContainer.appendChild(added_link);
            linkContainer.appendChild(deleteButton);
    
            let div_body = document.createElement("div");
            div_body.classList.add("card-body");
    
            let div_card = document.createElement("div");
            div_card.classList.add("card");
    
            div_body.appendChild(linkContainer);
            div_card.appendChild(div_body);
    
            div_link.append(div_card);
    
            link.value = "";
        }
    })

    document.querySelector("#edit_button_assignment").addEventListener("click", () => {
        const main_info = document.querySelector("#info_assignment");
        const form_assignment = document.querySelector("#form_assignment");

        laod_information();
        load_existing_links();
        load_existing_files();    
    
        main_info.style.display = "none";
        form_assignment.style.display = "block";

    })

    document.querySelector("#delete_button_assignment").addEventListener("click", () => {
        fetch(`/classrooms/${id}/assignments/${assignment_id}/delete`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(result => {
            if (result.data) {
                window.location.href = `http://127.0.0.1:8000/classrooms/${id}`;
                document.querySelector("#message").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;

            } else {

                document.querySelector("#message").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                
            }
        })
    });

    document.querySelector("#save_button_assignment").addEventListener("click", async () => {
        let name_form = document.querySelector("#name_form_assignment");
        let description_form = document.querySelector("#description_form_assignment");
        const file_form = document.querySelector("#create_assignment_files")
        const links = [];
        document.querySelectorAll(".links-values-edit").forEach((text) => {
            links.push(text.textContent);
        } )
        const existing_links = [];
        document.querySelectorAll(".link_to_delete").forEach((link) => {
            existing_links.push(link.getAttribute('data-id'));
        } )
        const existing_files = [];
        document.querySelectorAll(".file_to_delete").forEach((text) => {
            existing_files.push(text.getAttribute("data-id"));
        } )
        


        if (existing_files.length > 0) {
            const response =  await fetch(`/classrooms/${id}/assignments/${assignment_id}/files/delete`, {
                method: 'DELETE',
                body: JSON.stringify({
                    "files": existing_files,
            }),
            })
            let result = response.json()
            result => {
                if (result.data) {               
                    
                } else {
                    document.querySelector("#message").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                }
            }
        }

        if (existing_links.length > 0) {
            const response =  await fetch(`/classrooms/${id}/assignments/${assignment_id}/links/delete`, {
                method: 'DELETE',
                body: JSON.stringify({
                    "links": existing_links,
            }),
            })
            let result = response.json()
            result => {
                if (result.data) {               
                    document.querySelector("#message").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                }
            }
        }

        if (file_form) {
            const formData = new FormData(file_form);

            const response =  await fetch(`/classrooms/${id}/create/material/${assignment_id}/files`, {
                method: 'POST',
                body: formData,
            })
            let result = response.json()
            result => {
                if (result.data) {               
                    document.querySelector("#message").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                } else {
                    document.querySelector("#message").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                }
            }
        }

        fetch(`/classrooms/${id}/assignments/${assignment_id}/edit`, {
            method: 'POST',
            body: JSON.stringify({
                "name": name_form.value,
                "links": links,
                "description": description_form.value,
        })
          })
          .then(response => response.json())
          .then(result => {
            console.log(result.details);
            
            if (result.data) {
                document.querySelector("#message").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                    
                const main_info = document.querySelector("#info_assignment");
                const form_assignment = document.querySelector("#form_assignment");
        
                document.querySelector("#name_info_assignment").innerHTML = result.data.name
                if (result.data.description) {
                    document.querySelector("#description_info_assignment").innerHTML = `<strong>Instructions:</strong> ${result.data.description}`
                } else {
                    document.querySelector("#description_info_assignment").innerHTML = ""
                }

                const link_div = document.querySelector("#links_div_in_info_assignment");
                link_div.innerHTML = "";
            
                for (let i = 0; i < result.data.links_and_id.length; i++) {
                    if (!link_div.querySelector('strong')) {
                        let tag = document.createElement("strong")
                        if (result.data.links_and_id.length === 1 ) {
                            tag.innerHTML = "Link:"
                        } else {
                            tag.innerHTML = "Links:"
                        }
                        link_div.append(tag)
                    }
                        let link = result.data.links_and_id[i];
                        let a = document.createElement("a")
                        a.classList.add("mb-3", "text-primary", "d-block", "links_a_info_assignment");
                        a.setAttribute("data-id", link.id);
                        a.setAttribute("href", link.link)
                        a.setAttribute("target", "_blank")
                        a.innerHTML = `<i class="fas fa-link"></i>${link.link}`

                        link_div.append(a)
                }

                const file_div = document.querySelector("#files_div_in_info_assignment");
                file_div.innerHTML = "";
            
                for (let i = 0; i < result.data.files_and_id.length; i++) {
                        if (!file_div.querySelector('strong')) {
                            let tag = document.createElement("strong")
                            if (result.data.files_and_id.length === 1 ) {
                                tag.innerHTML = "File:"
                            } else {
                                tag.innerHTML = "Files:"
                            }
                            file_div.append(tag)
                        }
                        let file = result.data.files_and_id[i];
                        let a = document.createElement("a")
                        a.classList.add("mb-3", "text-primary", "d-block", "files_a_info_assignment");
                        a.setAttribute("data-id", file.id);
                        a.setAttribute("href", file.file)
                        a.setAttribute("target", "_blank")
                        a.innerHTML = `<i class="fas fa-file"></i> ${file.file.replace("/media/uploads/", "")}`

                        file_div.append(a)
                }

                document.querySelector("#deadline_div").innerHTML = "";
                if (result.data.deadline != "None") {
                    document.querySelector("#deadline_div").style.display = "none";
                    document.querySelector("#deadline_div").innerHTML = `<strong>Deadline: </strong> ${result.data.deadline}+00:00`;
                    update_deadline()
                }

                main_info.style.display = "block";
                form_assignment.style.display = "none";

                
                laod_information();
                load_existing_links();
                load_existing_files(); 

            } else {

                document.querySelector("#message").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                
            }
        });
    })

    document.querySelector("#close_button_assignment").addEventListener("click", () => {
        const main_info = document.querySelector("#info_assignment");
        const form_assignment = document.querySelector("#form_assignment");

        laod_information();

        main_info.style.display = "block";
        form_assignment.style.display = "none";
    })
})


function load_existing_links() {
    document.querySelector("#create_existing_assignment_links").innerHTML = "";
    document.querySelectorAll(".links_a_info_assignment").forEach((link_) => {
        let link = link_.getAttribute("href")

        let added_link = document.createElement("a");
        added_link.setAttribute("href", link);
        added_link.setAttribute("data-id", link_.getAttribute("data-id"));

        let h5 = document.createElement("h5");
        h5.classList.add("card-title","links-values", "col-lg-9");
        h5.innerHTML = `${link}`;


        let linkContainer = document.createElement("div");
        linkContainer.classList.add("d-flex", "justify-content-between", "align-items-center");

        let deleteButton = document.createElement("button");
        deleteButton.classList.add("btn", "btn-danger", "col-lg-2"); 
        deleteButton.innerHTML = '<i class="fas fa-times"></i>'; 

        deleteButton.addEventListener("click", () => {
            added_link.classList.add("link_to_delete");
            div_card.style.display = "none";
        });

        added_link.append(h5)
        linkContainer.appendChild(added_link);
        linkContainer.appendChild(deleteButton);

        let div_body = document.createElement("div");
        div_body.classList.add("card-body");

        let div_card = document.createElement("div");
        div_card.classList.add("card");

        div_body.appendChild(linkContainer);
        div_card.appendChild(div_body);

        document.querySelector("#create_existing_assignment_links").append(div_card);
    })
}


function load_existing_files() {
    document.querySelector("#create_existing_assignment_files").innerHTML = "";
    document.querySelectorAll(".files_a_info_assignment").forEach((file_) => {
        let file = file_.getAttribute("href")

        let added_file = document.createElement("a");
        added_file.setAttribute("href", file);
        added_file.setAttribute("data-id", file_.getAttribute("data-id"));

        let h5 = document.createElement("h5");
        h5.classList.add("card-title", "col-lg-9");
        let filename = file.replace("/media/uploads/", "")
        h5.innerHTML = `${filename}`;


        let fileContainer = document.createElement("div");
        fileContainer.classList.add("d-flex", "justify-content-between", "align-items-center");

        let deleteButton = document.createElement("button");
        deleteButton.classList.add("btn", "btn-danger", "col-lg-2"); 
        deleteButton.innerHTML = '<i class="fas fa-times"></i>'; 

        deleteButton.addEventListener("click", () => {
            added_file.classList.add("file_to_delete");
            div_card.style.display = "none";
        });

        added_file.append(h5)
        fileContainer.appendChild(added_file);
        fileContainer.appendChild(deleteButton);

        let div_body = document.createElement("div");
        div_body.classList.add("card-body");

        let div_card = document.createElement("div");
        div_card.classList.add("card");

        div_body.appendChild(fileContainer);
        div_card.appendChild(div_body);

        document.querySelector("#create_existing_assignment_files").append(div_card);
    })
}

function laod_information() {
    document.querySelector("#name_form_assignment").value = document.querySelector("#name_info_assignment").textContent;
    document.querySelector("#description_form_assignment").value = document.querySelector("#description_info_assignment").textContent.replace("Instructions: ", "").trim();
    document.querySelector("#create_assignment_file_input").value = "";
    document.querySelector("#create_assignment_links").innerHTML = "";
    document.querySelector("#selected-files-assignment").innerHTML = "";
}


const currentURL = window.location.href;
const urlParts = currentURL.split('/');
const valueIndex1 = urlParts.indexOf('classrooms') + 1; 
let valueIndex2 = urlParts.indexOf('assignments') + 1; 
const id = urlParts[valueIndex1];
const assignment_id = urlParts[valueIndex2];


document.addEventListener("DOMContentLoaded", () => {

    document.querySelector("#submit_button_submit").addEventListener("click", () => {
        const main_info = document.querySelector("#info_assignment");
        const form_submit = document.querySelector("#submit_form");
        const submited = document.querySelector("#submited");

    
        main_info.style.display = "none";
        form_submit.style.display = "block";
        submited.style.display = "none";

    })

    document.querySelector("#close_button_submit_assignment").addEventListener("click", () => {
        const main_info = document.querySelector("#info_assignment");
        const form_submit = document.querySelector("#submit_form");
        const submited = document.querySelector("#submited");

        document.querySelector("#message_form_submit").value = "";
        document.querySelector("#submit_assignment_file_input").value = "";
        document.querySelector("#selected-files-assignment-submit").innerHTML = "";
        document.querySelector("#submit_assignment_links").innerHTML = "";
        document.querySelector("#submit_assignment_link").value = "";

        main_info.style.display = "block";
        form_submit.style.display = "none";
        submited.style.display = "block";

    })

    document.getElementById("submit_assignment_file_input").addEventListener("change", () => {
        const fileInput = document.getElementById("submit_assignment_file_input");
        const selectedFilesDiv = document.getElementById("selected-files-assignment-submit");

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


    document.getElementById("clear-files-assignment-submit").addEventListener("click", () => {
        const selectedFilesDiv = document.getElementById("selected-files-assignment-submit");
        selectedFilesDiv.innerHTML = ""; 
        const fileInput = document.getElementById("submit_assignment_file_input");
        fileInput.value = ""
    });
    
    document.querySelector("#add_submit_assignment_link").addEventListener("click", () => {
        let div_link = document.querySelector("#submit_assignment_links");
        let link = document.querySelector("#submit_assignment_link");

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
    
    document.querySelector("#save_button_submit_assignment").addEventListener("click", () => {
        const message = document.querySelector("#message_form_submit");
        const file_form = document.querySelector("#submit_assignment_files")
        const links = [];
        document.querySelectorAll(".links-values-edit").forEach((text) => {
            links.push(text.textContent);
        } )

        fetch(`/classrooms/${id}/assignments/${assignment_id}/create/submit`, {
            method: 'POST',
            body: JSON.stringify({
                "message": message.value,
                "links": links,
        }),
        })
        .then(response => response.json())
        .then(result => {
            if (result.data) {

                const formData = new FormData(file_form);
    
                fetch(`/classrooms/${id}/assignments/${assignment_id}/submits/${result.data.submit_id}/files`, {
                    method: 'POST',     
                    body: formData,
                })
                .then(response => response.json())
                .then(result => {
                    if (result.data) {               
                        
                        document.querySelector("#message").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                        window.location.href = `http://127.0.0.1:8000/classrooms/${id}/assignments/${assignment_id}`;
                    } else {
                        document.querySelector("#message").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                    }
                }
                )
                } else {

                document.querySelector("#message").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                
            }
        })
    });
})



    
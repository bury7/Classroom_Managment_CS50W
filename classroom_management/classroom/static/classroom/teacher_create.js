document.addEventListener("DOMContentLoaded", () => {
    const currentURL = window.location.href;
    const urlParts = currentURL.split('/');
    const valueIndex = urlParts.indexOf('classrooms') + 1; 
    const id = urlParts[valueIndex];

    document.querySelector("#create_material").addEventListener("click", () => {
        const main_info = document.querySelector("#main_info");
        const create_material_form = document.querySelector("#create_material_form");
    
        main_info.style.display = "none";
        create_material_form.style.display = "block";
    })

    document.querySelector("#create_material_close").addEventListener("click", () => {
        const main_info = document.querySelector("#main_info");
        const create_material_form = document.querySelector("#create_material_form");

        main_info.style.display = "block";
        create_material_form.style.display = "none";

        document.querySelector("#create_material_description").value = "";
        document.querySelector("#create_material_name").value = "";
        document.getElementById("selected-files-material").innerHTML = ""; 
        document.getElementById("create_material_file_input").value = ""
        document.querySelector("#create_material_links").innerHTML = "";
    })

    document.querySelector("#add_material_link").addEventListener("click", () => {
        let div_link = document.querySelector("#create_material_links");
        let link = document.querySelector("#create_material_link");

        if (link.value) {
            if (!link.value.startsWith("http")) {
                link.value = "https://" + link.value;
            }

            let added_link = document.createElement("a");
            added_link.setAttribute("href", link.value);
    
            let h5 = document.createElement("h5");
            h5.classList.add("card-title","links-values", "col-lg-9");
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

    document.getElementById("create_material_file_input").addEventListener("change", () => {
        const fileInput = document.getElementById("create_material_file_input");
        const selectedFilesDiv = document.getElementById("selected-files-material");

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

    document.getElementById("clear-files-material").addEventListener("click", () => {
        const selectedFilesDiv = document.getElementById("selected-files-material");
        selectedFilesDiv.innerHTML = ""; 
        const fileInput = document.getElementById("create_material_file_input");
        fileInput.value = ""
    });


    document.querySelector("#create_material_save").addEventListener("click", () => {
        const name = document.querySelector("#create_material_name");
        const description = document.querySelector("#create_material_description");
        const file_form = document.querySelector("#create_material_files")
        const links = [];
        document.querySelectorAll(".links-values").forEach((text) => {
            links.push(text.textContent);
        } )

        fetch(`/classrooms/${id}/create/material`, {
            method: 'POST',
            body: JSON.stringify({
                "name": name.value,
                "description": description.value,
                "links": links,
        })
        })
        .then(response => response.json())
        .then(result => {
            if (result.data) {               
                document.querySelector("#message").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                
                if (file_form) {
                    const formData = new FormData(file_form);
        
                    fetch(`/classrooms/${id}/create/material/${result.data.assignment_id}/files`, {
                        method: 'POST',
                        body: formData,
                    })
                    .then(response => response.json())
                    .then(result => {
                        if (result.data) {               
                            document.querySelector("#message").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                            window.location.href = `http://127.0.0.1:8000/classrooms/${id}`;
                        } else {
                            document.querySelector("#message").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                        }
                    })
                }
            } else {
                document.querySelector("#message").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
            }
        })
    })


    document.querySelector("#create_assignment").addEventListener("click", () => {
        const main_info = document.querySelector("#main_info");
        const create_assignment_form = document.querySelector("#create_assignment_form");
    
        main_info.style.display = "none";
        create_assignment_form.style.display = "block";
    })

    document.querySelector("#create_assignment_close").addEventListener("click", () => {
        const main_info = document.querySelector("#main_info");
        const create_material_form = document.querySelector("#create_assignment_form");

        main_info.style.display = "block";
        create_material_form.style.display = "none";

        document.querySelector("#create_assignment_description").value = "";
        document.querySelector("#create_assignment_name").value = "";
        document.getElementById("selected-files-assignment").innerHTML = ""; 
        document.getElementById("create_assignment_file_input").value = ""
        document.querySelector("#create_assignment_links").innerHTML = "";
        document.querySelector("#id_deadline").value = "";
        document.getElementById("nodeadline").checked = false;
       
    })

    document.querySelector("#add_assignment_link").addEventListener("click", () => {
        let div_link = document.querySelector("#create_assignment_links");
        let link = document.querySelector("#create_assignment_link");

        if (link.value) {
            if (!link.value.startsWith("www")) {
                link.value = "www." + link.value;
            }
            if (!link.value.startsWith("http")) {
                link.value = "https://" + link.value;
            }

            let added_link = document.createElement("a");
            added_link.setAttribute("href", link.value);
    
            let h5 = document.createElement("h5");
            h5.classList.add("card-title","links-values", "col-lg-9");
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


    document.querySelector("#create_assignment_save").addEventListener("click", () => {
        const name = document.querySelector("#create_assignment_name");
        const description = document.querySelector("#create_assignment_description");
        const file_form = document.querySelector("#create_assignment_files")
        const links = [];
        document.querySelectorAll(".links-values").forEach((text) => {
            links.push(text.textContent);
        } )
        let deadline = document.querySelector("#id_deadline").value;
        const nodeadline = document.querySelector("#nodeadline");
        if (nodeadline.checked) {
            deadline = ""
        }

        fetch(`/classrooms/${id}/create/assignment`, {
            method: 'POST',
            body: JSON.stringify({
                "name": name.value,
                "description": description.value,
                "links": links,
                "deadline": deadline,
        })
        })
        .then(response => response.json())
        .then(result => {
            if (result.data) {               
                document.querySelector("#message").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                
                if (file_form) {
                    const formData = new FormData(file_form);
        
                    fetch(`/classrooms/${id}/create/assignment/${result.data.assignment_id}/files`, {
                        method: 'POST',
                        body: formData,
                    })
                    .then(response => response.json())
                    .then(result => {
                        if (result.data) {               
                            document.querySelector("#message").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                            window.location.href = `http://127.0.0.1:8000/classrooms/${id}`;
                        } else {
                            document.querySelector("#message").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                        }
                    })
                }
            } else {
                document.querySelector("#message").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
            }
        })
    })

    document.getElementById("nodeadline").addEventListener("change", function () {
        if (document.getElementById("nodeadline").checked) {
            document.querySelector("#id_deadline").style.display = "none";
        } else {
            document.querySelector("#id_deadline").style.display = "block";
        }
    });
})

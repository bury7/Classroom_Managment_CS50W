const currentURL = window.location.href;
const urlParts = currentURL.split('/');
const valueIndex1 = urlParts.indexOf('classrooms') + 1; 
let valueIndex2 = urlParts.indexOf('assignments') + 1; 
const id = urlParts[valueIndex1];
const assignment_id = urlParts[valueIndex2];

var submit_id;

document.addEventListener("DOMContentLoaded", () => {
    load_submits()

    if (document.querySelector("#deadline_div")) {
        if (document.querySelector("#deadline_div").innerHTML.trim().length > 0) {
            update_deadline()
        }}

    document.getElementById("file_input_submit_edit_form").addEventListener("change", () => {
        const fileInput = document.getElementById("file_input_submit_edit_form");
        const selectedFilesDiv = document.getElementById("selected-files-submit-edit-form");

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

    document.getElementById("clear-files-submit-edit-form").addEventListener("click", () => {
        const selectedFilesDiv = document.getElementById("selected-files-submit-edit-form");
        selectedFilesDiv.innerHTML = ""; 
        document.getElementById("file_input_submit_edit_form").value = "";
    });


    document.querySelector("#add_link_submit_edit_form").addEventListener("click", () => {
        let div_link = document.querySelector("#links_submit_edit_form");
        let link = document.querySelector("#link_submit_edit_form");

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

    document.querySelector("#close_button_submit_edit_form").addEventListener("click", () => {
        const main_info = document.querySelector("#info_assignment");
        const form_edit_submit = document.querySelector("#submit_edit_form");
        const submited = document.querySelector("#submited");
        
        form_edit_submit.style.display = "none"
        main_info.style.display = "block";
        submited.style.display = "block";
    })


    document.querySelector("#save_button_submit_edit_form").addEventListener("click", async () => {
        let message_form = document.querySelector("#message_submit_edit_form");
        const file_form = document.querySelector("#files_submit_edit_form");
        const links = [];
        document.querySelectorAll(".links-values-edit").forEach((text) => {
            links.push(text.textContent);
        } )
        const existing_links = [];
        document.querySelectorAll(".link_to_delete_submit_form  ").forEach((link) => {
            existing_links.push(link.getAttribute('data-id'));
        } )
        const existing_files = [];
        document.querySelectorAll(".file_to_delete_submit_edit").forEach((text) => {
            existing_files.push(text.getAttribute("data-id"));
        } )

        

        if (existing_files.length > 0) {
            const response =  await fetch(`/classrooms/${id}/assignments/${assignment_id}/submits/${submit_id}/files/delete`, {
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
            const response =  await fetch(`/classrooms/${id}/assignments/${assignment_id}/submits/${submit_id}/links/delete`, {
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

            const response =  await fetch(`/classrooms/${id}/assignments/${assignment_id}/submits/${submit_id}/files`, {
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

        fetch(`/classrooms/${id}/assignments/${assignment_id}/submits/${submit_id}/edit`, {
            method: 'POST',
            body: JSON.stringify({
                "message": message_form.value,
                "links": links, 
        })
          })
          .then(response => response.json())
          .then(result => {
            console.log(result.details);
            
            if (result.data) {

                document.querySelector("#message").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                
            } else {

                document.querySelector("#message").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                
            }
        });

        load_submits()
                
        document.querySelector("#submit_edit_form").style.display = "none";
        document.querySelector("#info_assignment").style.display = "block";
        document.querySelector("#submited").style.display = "block";

    })

})

function update_deadline() {
    deadline_div = document.querySelector("#deadline_div");
    deadline = deadline_div.textContent.replace("Deadline:", "").trim()
    deadline_div.innerHTML = `<strong>Deadline: </strong>${formatDateString(deadline)}`
    const dateObject = new Date(Date.parse(deadline))
    deadline_div.setAttribute("data-time", dateObject.toISOString())
    deadline_div.style.display = "block";
}

function formatDateString(dateString) {
    const dateObject = new Date(Date.parse(dateString));
    const year = dateObject.getUTCFullYear();
    const month = String(dateObject.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObject.getUTCDate()).padStart(2, '0');
    const hours = String(dateObject.getUTCHours()).padStart(2, '0');
    const minutes = String(dateObject.getUTCMinutes()).padStart(2, '0');
    const seconds = String(dateObject.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function load_submits() {
    list = document.querySelector("#submits_list")
    list.innerHTML = "";
    
    fetch(`/classrooms/${id}/assignments/${assignment_id}/submits/student`, {
        method: 'GET',  
    })
    .then(response => response.json())
    .then(async result => {
        if (result.data) {
            submit_id = result.data.id;
            var li = document.createElement("li");
            li.classList.add("list-group-item")
            
            var div = document.createElement("div") 
            div.classList.add("d-flex", "align-items-center")    
            
            var content = document.createElement("div")
            content.classList.add("content")

            var h2 = document.createElement("h2")
            h2.classList.add("mb-0")
            h2.innerHTML = result.data.name

            content.append(h2)
            if (result.data.grade) {
                let label = document.createElement("label")
                label.classList.add("font-weight-bold")
                label.innerHTML = `Grade: ${result.data.grade}`
                content.append(label)
            }

            if (result.data.message) {
                var p = document.createElement("p")
                p.classList.add("mb-0")
                p.innerHTML = result.data.message
                content.append(p)
                var br = document.createElement("br")
                content.append(br)
            }

            if (result.data.links) {
                for (let i = 0; i < result.data.links.length; i++) {
                    let link = document.createElement("a");
                    let linkname = result.data.links[i]
                    link.innerHTML = `<i class="fas fa-link"></i> ${linkname}`;
                    link.classList.add("mb-3", "text-primary", "d-block");
                    link.setAttribute("href", result.data.links[i]);
                    link.setAttribute("target", "_blank")
                    content.append(link);
                }
            }

            if (result.data.files) {
                for (let i = 0; i < result.data.files.length; i++) {
                    let file = document.createElement("a");
                    let filename = result.data.files[i].replace("/media/uploads/", "")
                    file.innerHTML = `<i class="fas fa-file"></i> ${filename}`;
                    file.classList.add("mb-3", "text-primary", "d-block");
                    file.setAttribute("href", result.data.files[i]);
                    file.setAttribute("target", "_blank")
                    content.append(file);
                }
            }

            if (result.data.comments.length > 0) {
                let h3_ = document.createElement("label")
                h3_.innerHTML = "Teacher Comment: ";
                content.append(h3_);

                for (let i = 0; i < result.data.comments.length; i++) {
            
                    let comment = document.createElement("p");
                    comment.innerHTML = `${result.data.comments[i]}`
                    comment.classList.add("mb-3", "d-block");
                    content.append(comment)
                }
            }

            if (result.data.created_at){
                if (result.data.changed_at){
                    p_ = document.createElement("p")
                    p_.innerHTML = `Changed at ${formatDateString(result.data.changed_at)}`
                } else {
                    p_ = document.createElement("p")
                    p_.innerHTML = `Created at ${formatDateString(result.data.created_at)}`
                }
                content.append(p_)
            }

            button_div = document.createElement("div");
            button_div.classList.add("ml-auto");

            button = document.createElement("button");
            button.classList.add("btn", "btn-primary");
            button.innerHTML = "Edit";
            button.setAttribute("id", "button_submit_edit")
            button.addEventListener("click", () => {
                const main_info = document.querySelector("#info_assignment");
                const form_edit_submit = document.querySelector("#submit_edit_form");
                const submited = document.querySelector("#submited");

                document.querySelector("#existing_links_submit_edit_form").innerHTML = "";
                if (result.data.links_and_id) {
                result.data.links_and_id.forEach((link) => {        
                    let added_link = document.createElement("a");
                    added_link.setAttribute("href", link.link);
                    added_link.setAttribute("data-id", link.id);
            
                    let h5 = document.createElement("h5");
                    h5.classList.add("card-title","links-values", "col-lg-9");
                    h5.innerHTML = `${link.link}`;
            
            
                    let linkContainer = document.createElement("div");
                    linkContainer.classList.add("d-flex", "justify-content-between", "align-items-center");
            
                    let deleteButton = document.createElement("button");
                    deleteButton.classList.add("btn", "btn-danger", "col-lg-2"); 
                    deleteButton.innerHTML = '<i class="fas fa-times"></i>'; 
            
                    deleteButton.addEventListener("click", () => {
                        added_link.classList.add("link_to_delete_submit_form");
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
            
                    document.querySelector("#existing_links_submit_edit_form").append(div_card);
                        
                    })
                }

                document.querySelector("#existing_files_submit_edit_form").innerHTML = "";
                if (result.data.files_and_id) {
                    result.data.files_and_id.forEach((file) => {
                        let added_file = document.createElement("a");
                        added_file.setAttribute("href", file.file);
                        added_file.setAttribute("data-id", file.id);

                        let h5 = document.createElement("h5");
                        h5.classList.add("card-title", "col-lg-9");
                        let filename = file.file.replace("/media/uploads/", "")
                        h5.innerHTML = `${filename}`;


                        let fileContainer = document.createElement("div");
                        fileContainer.classList.add("d-flex", "justify-content-between", "align-items-center");

                        let deleteButton = document.createElement("button");
                        deleteButton.classList.add("btn", "btn-danger", "col-lg-2"); 
                        deleteButton.innerHTML = '<i class="fas fa-times"></i>'; 

                        deleteButton.addEventListener("click", () => {
                            added_file.classList.add("file_to_delete_submit_edit");
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

                        document.querySelector("#existing_files_submit_edit_form").append(div_card); 
                    })
                }

                if (result.data.message) {
                    document.querySelector("#message_submit_edit_form").value = result.data.message;
                }

                

                document.querySelector("#file_input_submit_edit_form").value = "";
                document.querySelector("#link_submit_edit_form").innerHTML = "";
                document.querySelector("#links_submit_edit_form").innerHTML = "";
                document.querySelector("#selected-files-submit-edit-form").innerHTML = "";
                
                form_edit_submit.style.display = "block"
                main_info.style.display = "none";
                submited.style.display = "none";
            })

            button_div.append(button)
            div.append(content)
            div.append(button_div)
            li.append(div)
            list.append(li)
           
        }
    })
}
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

    load_submits()

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
        let submited = document.querySelector("#submited");

        laod_information();
        load_existing_links();
        load_existing_files();    
    
        main_info.style.display = "none";
        form_assignment.style.display = "block";
        submited.style.display = "none";

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
        let submited = document.querySelector("#submited");
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

        let deadline = document.querySelector("#deadline-assginment-edit").value;
        const nodeadline = document.querySelector("#nodeadline");
        if (nodeadline.checked) {
            deadline = ""
        }
        


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
                "deadline": deadline, 
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
                submited.style.display = "block";

                
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
        const submited = document.querySelector("#submited");

        laod_information();

        submited.style.display = "block";
        main_info.style.display = "block";
        form_assignment.style.display = "none";
    })

    if (document.getElementById("nodeadline")){
        document.getElementById("nodeadline").addEventListener("change", function () {
            if (document.getElementById("nodeadline").checked) {
                document.querySelector("#deadline-assginment-edit").style.display = "none";
            } else {
                document.querySelector("#deadline-assginment-edit").style.display = "block";
            }
        });
        }
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
    if (document.querySelector("#deadline_div")) {
           if (document.querySelector("#deadline_div").innerHTML.trim().length > 0) {
        document.querySelector("#deadline-assginment-edit").value = document.querySelector("#deadline_div").getAttribute("data-time").slice(0, 16);
    }}
}

function update_deadline() {
    deadline_div = document.querySelector("#deadline_div");;
    deadline = deadline_div.textContent.replace("Deadline:", "").trim();
    deadline_div.innerHTML = `<strong>Deadline: </strong>${formatDateString(deadline)}`;
    const dateObject = new Date(Date.parse(deadline));
    deadline_div.setAttribute("data-time", dateObject.toISOString());
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
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}


function load_submits() {
    list = document.querySelector("#submits_list")
    list.innerHTML = "";
    
    fetch(`/classrooms/${id}/assignments/${assignment_id}/submits/teacher`, {
        method: 'GET',  
    })
    .then(response => response.json())
    .then(async result => {
        if (result.data.length > 0) {
            result.data.forEach((submit) => {
                submit_id = submit.id;
                var li = document.createElement("li");
                li.classList.add("list-group-item")
                
                var div = document.createElement("div") 
                div.classList.add("d-flex", "align-items-center")    
                
                var content = document.createElement("div")
                content.classList.add("content")

                var h2 = document.createElement("h2")
                h2.classList.add("mb-0")
                h2.innerHTML = submit.name

                content.append(h2)
                if (submit.grade) {
                    let label = document.createElement("label")
                    label.classList.add("font-weight-bold")
                    label.innerHTML = `Grade: ${submit.grade}`
                    content.append(label)
                }

                if (submit.message) {
                    var p = document.createElement("p")
                    p.classList.add("mb-0")
                    p.innerHTML = submit.message
                    content.append(p)
                    var br = document.createElement("br")
                    content.append(br)
                }

                if (submit.links) {
                    for (let i = 0; i < submit.links.length; i++) {
                        let link = document.createElement("a");
                        let linkname = submit.links[i]
                        link.innerHTML = `<i class="fas fa-link"></i> ${linkname}`;
                        link.classList.add("mb-3", "text-primary", "d-block");
                        link.setAttribute("href", submit.links[i]);
                        link.setAttribute("target", "_blank")
                        content.append(link);
                    }
                }

                if (submit.files) {
                    for (let i = 0; i < submit.files.length; i++) {
                        let file = document.createElement("a");
                        let filename = submit.files[i].replace("/media/uploads/", "")
                        file.innerHTML = `<i class="fas fa-file"></i> ${filename}`;
                        file.classList.add("mb-3", "text-primary", "d-block");
                        file.setAttribute("href", submit.files[i]);
                        file.setAttribute("target", "_blank")
                        content.append(file);
                    }
                }

                if (submit.comments.length > 0) {
                    
                    let h3_ = document.createElement("label")
                    h3_.innerHTML = "Teacher Comment: ";
                    content.append(h3_);
    
                    for (let i = 0; i < submit.comments.length; i++) {
                
                        let comment = document.createElement("p");
                        comment.innerHTML = `${submit.comments[i]}`
                        comment.classList.add("mb-3", "d-block");
                        content.append(comment)
                    }
                }

                if (submit.created_at){
                    if (submit.changed_at){
                        p_ = document.createElement("p")
                        p_.innerHTML = `Changed at ${formatDateString(submit.changed_at)}`
                    } else {
                        p_ = document.createElement("p")
                        p_.innerHTML = `Created at ${formatDateString(submit.created_at)}`
                    }
                    content.append(p_)
                }
                    

                button_div = document.createElement("div");
                button_div.classList.add("ml-auto");
    
                button = document.createElement("button");
                button.classList.add("btn", "btn-primary");
                button.innerHTML = "Grade";
                button.setAttribute("id", "button_submit_edit")
                button.addEventListener("click", () => {
                    document.querySelector("#info_assignment").style.display = "none";
                    document.querySelector("#form_grade_submit").style.display = "block";
                    document.querySelector("#submited").style.display = "none";


                    document.querySelector("#comment_form_submit").value = "";
                    document.querySelector("#grade_submit").value = submit.grade;
                    
                    document.querySelector("#student_id").innerHTML = submit.id
                    document.querySelector("#name_submit").innerHTML = `<strong>${submit.name}</strong>`;
                    
                    if (submit.message) {
                        document.querySelector("#message_submit").innerHTML = submit.message;
                    }

                    if (submit.links) {
                        for (let i = 0; i < submit.links.length; i++) {
                            let link = document.createElement("a");
                            let linkname = submit.links[i]
                            link.innerHTML = `<i class="fas fa-link"></i> ${linkname}`;
                            link.classList.add("mb-3", "text-primary", "d-block");
                            link.setAttribute("href", submit.links[i]);
                            link.setAttribute("target", "_blank")
                            document.querySelector("#link_submit").append(link);
                        }
                    }


                    if (submit.files) {
                        for (let i = 0; i < submit.files.length; i++) {
                            let file = document.createElement("a");
                            let filename = submit.files[i].replace("/media/uploads/", "")
                            file.innerHTML = `<i class="fas fa-file"></i> ${filename}`;
                            file.classList.add("mb-3", "text-primary", "d-block");
                            file.setAttribute("href", submit.files[i]);
                            file.setAttribute("target", "_blank")
                            document.querySelector("#files_submit").append(file);
                        }
                    }

                    if (submit.created_at){
                        if (submit.changed_at){
                            document.querySelector("#time_submit").innerHTML = `Changed at ${formatDateString(submit.changed_at)}`
                        } else {
                            document.querySelector("#time_submit").innerHTML = `Created at ${formatDateString(submit.created_at)}`
                        }
                    }
                        
                    document.querySelector("#close_button_submitt_grade").addEventListener("click", () => {
                        document.querySelector("#info_assignment").style.display = "block";
                        document.querySelector("#form_grade_submit").style.display = "none";
                        document.querySelector("#submited").style.display = "block";
    
                        document.querySelector("#student_id").innerHTML = "";
                        document.querySelector("#name_submit").innerHTML = "";
                        document.querySelector("#message_submit").innerHTML = "";
                        document.querySelector("#files_submit").innerHTML = "";
                        document.querySelector("#link_submit").innerHTML = "";

                        document.querySelector("#comment_form_submit").value = "";
                        document.querySelector("#grade_submit").value = submit.grade;
                    })

                    document.querySelector("#grade_button_submit").addEventListener("click", () => {

                        fetch(`/classrooms/${id}/assignments/${assignment_id}/submits/grade_student`, {
                            method: 'POST', 
                            body: JSON.stringify({
                                "id":document.querySelector("#student_id").innerHTML,
                                "comment": document.querySelector("#comment_form_submit").value,
                                "grade": document.querySelector("#grade_submit").value,
                        }), 
                        })
                        .then(response => response.json())
                        .then(result => {
                            if (result.data) {
                                document.querySelector("#message").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                                
                                document.querySelector("#info_assignment").style.display = "block";
                                document.querySelector("#form_grade_submit").style.display = "none";
                                document.querySelector("#submited").style.display = "block";
            
                                document.querySelector("#student_id").innerHTML = "";
                                document.querySelector("#name_submit").innerHTML = "";
                                document.querySelector("#message_submit").innerHTML = "";
                                document.querySelector("#files_submit").innerHTML = "";
                                document.querySelector("#link_submit").innerHTML = "";

                                document.querySelector("#comment_form_submit").value = "";
                                document.querySelector("#grade_submit").value = submit.grade;
                                window.location.href = `http://127.0.0.1:8000/classrooms/${id}/assignments/${assignment_id}`;
                            } 
                        })
                    })
                
                })

                button_div.append(button)
                div.append(content)
                div.append(button_div)
                li.append(div)
                list.append(li)
                list.append(document.createElement("hr"))
            })
        } else {
            document.querySelector("#submited").parentElement.innerHTML = "";
        }
    })
}

document.addEventListener("DOMContentLoaded", () => {
    const currentURL = window.location.href;
    const urlParts = currentURL.split('/');
    const valueIndex = urlParts.indexOf('classrooms') + 1; 
    const id = urlParts[valueIndex];

    document.querySelector("#edit_button").addEventListener("click", () => {
        const info = document.querySelector("#info_classroom");
        const form = document.querySelector("#form");


        info.style.display = "none";
        form.style.display = "block";
    })

    document.querySelector("#save_button").addEventListener("click", () => {
        const info = document.querySelector("#info_classroom");
        const form = document.querySelector("#form");

        const name_info = document.querySelector("#name_info_classroom");
        const theme_info = document.querySelector("#theme_info_classroom");
        const link_info = document.querySelector("#link_info_classroom");
        const description_info = document.querySelector("#description_info_classroom");

        const name_form = document.querySelector("#name_form_classroom");
        const theme_form = document.querySelector("#theme_form_classroom");
        const link_form = document.querySelector("#link_form_classroom");
        const description_form = document.querySelector("#description_form_classroom");


        fetch(`/classrooms/${id}/edit`, {
            method: 'POST',
            body: JSON.stringify({
                "name": name_form.value,
                "theme": theme_form.value,
                "link": link_form.value,
                "description": description_form.value,
        })
          })
          .then(response => response.json())
          .then(result => {
            console.log(result.details);
            
            if (result.data) {
                document.querySelector("#message").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;


                name_info.innerHTML = result.data.name;
                name_form.value = result.data.name;

                if (result.data.theme) {
                    theme_info.innerHTML = `<strong>Theme:</strong> ${result.data.theme}`;
                    theme_form.value = result.data.theme;
                } else {
                    theme_info.innerHTML = "";
                    theme_form.value = "";
                }
                
                if (result.data.description) {
                    description_info.innerHTML = `<strong>Description:</strong> ${result.data.description}`;
                    description_form.value = result.data.description;
                } else {
                    description_info.innerHTML = "";
                    description_form.value = "";
                }
                
                
                if (result.data.link) {
                    link_form.value = result.data.link;

                    if (link_info) {
                        link_info.href = result.data.link
                    } else {
                        let link = document.createElement("a");
                        link.setAttribute("id", "link_info_classroom");
                        link.setAttribute("href", result.data.link);
                        link.classList.add("btn");
                        link.classList.add("btn-info");
                        link.classList.add("btn-sm");
                        link.innerHTML = "<strong>Link to join meeting</strong>";
                        document.querySelector("#link_placeholder").appendChild(link);
                    }
                } else {
                    link_form.value = "";

                    if (link_info) {
                        link_info.remove()
                    } 
                }
            } else {

                document.querySelector("#message").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                close_edit_form();
            }
        });

        info.style.display = "block";
        form.style.display = "none";
    })

    document.querySelector("#close_button_classroom").addEventListener("click", close_edit_form);
    document.querySelector("#delete_button").addEventListener("click", () => {

        fetch(`/classrooms/${id}/delete`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(result => {
            if (result.data) {
                window.location.href = `http://127.0.0.1:8000/`;
                
                document.querySelector("#message").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                
            } else {

                document.querySelector("#message").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                
            }
        })
    })

    document.getElementById('qrcode').addEventListener('click', () => {
        var copiedTextElement = document.getElementById('copied-text');

        copiedTextElement.style.display = 'block';

        document.getElementById('qrcode').classList.add('clicked');

        setTimeout(() => {
            document.getElementById('qrcode').classList.remove('clicked');
            copiedTextElement.style.display = 'none';
        }, 666);
    });
})


function close_edit_form() {
    const info = document.querySelector("#info_classroom");
    const form = document.querySelector("#form");

    const name_info = document.querySelector("#name_info_classroom");
    const theme_info = document.querySelector("#theme_info_classroom");
    const link_info = document.querySelector("#link_info_classroom");
    const description_info = document.querySelector("#description_info_classroom");

    const name_form = document.querySelector("#name_form_classroom");
    const theme_form = document.querySelector("#theme_form_classroom");
    const link_form = document.querySelector("#link_form_classroom");
    const description_form = document.querySelector("#description_form_classroom");

    name_form.value = name_info.innerHTML;

    const themeText = theme_info.textContent.trim();
    const themeParts = themeText.split(':');
    if (themeParts.length === 2) {
        const themeName = themeParts[1].trim();
        theme_form.value = themeName;
    } else {
        theme_form.value = "";
    }


    const descriptionText = description_info.textContent.trim();
    const descriptionParts = descriptionText.split(':');
    if (descriptionParts.length === 2) {
        const descriptionName = descriptionParts[1].trim();
        description_form.value = descriptionName;
    } else {
        description_form.value = "";
    }
    


    if (link_info){
        link_form.value = link_info.href;
    } else {
        link_form.value = "";
    }


    info.style.display = "block";
    form.style.display = "none";
}
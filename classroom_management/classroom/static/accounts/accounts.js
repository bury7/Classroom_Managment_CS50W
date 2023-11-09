document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#change_button").addEventListener("click", () => {
        let form = document.querySelector("#form_info");
        let info = document.querySelector("#info");
        let first_name_form = document.querySelector("#firstname_form");
        let last_name_form = document.querySelector("#lastname_form");
        let email_form = document.querySelector("#email_form");
        let phone_form = document.querySelector("#phone_form");
        let first_name_info = document.querySelector("#firstname_info");
        let last_name_info = document.querySelector("#lastname_info");
        let email_info = document.querySelector("#email_info");
        let phone_info = document.querySelector("#phone_info");
        let form_picture = document.getElementById("form_picture");

        first_name_form.value = first_name_info.innerHTML;
        last_name_form.value = last_name_info.innerHTML;
        email_form.value = email_info.innerHTML;
        phone_form.value = phone_info.innerHTML;

        form_picture.style.display = "block";
        form.style.display = "block";
        info.style.display = "none";
    });
    


    document.querySelector("#save_button").addEventListener("click", () => {
        let form = document.querySelector("#form_info");
        let info = document.querySelector("#info");
        let first_name_form = document.querySelector("#firstname_form");
        let last_name_form = document.querySelector("#lastname_form");
        let email_form = document.querySelector("#email_form");
        let phone_form = document.querySelector("#phone_form");
        let first_name_info = document.querySelector("#firstname_info");
        let last_name_info = document.querySelector("#lastname_info");
        let email_info = document.querySelector("#email_info");
        let phone_info = document.querySelector("#phone_info");
        let form_picture = document.getElementById("form_picture");
        let form_picture_form = document.getElementById("form_picture_form");
    
        fetch('/accounts/update/', {
            method: 'POST',
            body: JSON.stringify({"first_name": first_name_form.value, "last_name": last_name_form.value,"email": email_form.value,"phone": phone_form.value, })
          })
          .then(response => response.json())
          .then(result => {
            console.log(result.details)
            if (result.data) {
                first_name_form.value, first_name_info.innerHTML = result.data.first_name, result.data.first_name;
                last_name_form.value, last_name_info.innerHTML = result.data.last_name, result.data.last_name;
                email_form.value, email_info.innerHTML = result.data.email, result.data.email;
                phone_form.value, phone_info.innerHTML = result.data.phone, result.data.phone;
                document.querySelector("#message").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
            } else {
                document.querySelector("#message").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
            }
            });
        
        if (form_picture_form) {
        const formData = new FormData(form_picture_form);
            
        fetch('/accounts/update/picture/', {
            method: 'POST',
            body: formData,
            })
            .then(response => response.json())
            .then(result => {
                if (result.data) {
                    document.querySelector("#message").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                    document.querySelector("#id_profile_picture").value = ""

                    img = document.createElement("img");
                    img.setAttribute("src", result.data.profile_picture);
                    img.setAttribute("id", "profile_picture_img");
                    img.setAttribute("alt", "User Image");
                    img.classList.add("user-icon")

                    document.querySelector("#profile_picture_img").remove()
                    document.querySelector("#profile_picture_big").append(img)

                    img_small = document.createElement("img");
                    img_small .setAttribute("src", result.data.profile_picture);
                    img_small .setAttribute("id", "profile_picture_small_img");
                    img_small .setAttribute("alt", "User Image");
                    img_small .classList.add("user-icon-small")

                    document.querySelector("#profile_picture_small_img").remove()
                    document.querySelector("#profile_picture_small").append(img_small)
                    console.log(result.data.picture)

                } else {
                    document.querySelector("#message").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                }
            })
        }
        
        form_picture.style.display = "none";
        form.style.display = "none";
        info.style.display = "block";
          
    });

    document.querySelector("#delete_profile_picture").addEventListener("click", () => {
        let form = document.querySelector("#form_info");
        let info = document.querySelector("#info");
        fetch('/accounts/delete/picture/', {
            method: 'POST',
            body: "",
            })
            .then(response => response.json())
            .then(result => {
                if (result.data) {
                    document.querySelector("#message").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                    document.querySelector("#id_profile_picture").value = ""

                    i = document.createElement("i");
                    i.classList.add("fas");
                    i.classList.add("fa-regular");
                    i.classList.add("fa-user");
                    i.classList.add("custom-icon");
                    i.setAttribute("id", "profile_picture_img");
                    i.style.color = "#000000";

                    document.querySelector("#profile_picture_img").remove()
                    document.querySelector("#profile_picture_big").append(i)

                    i_small = document.createElement("i");
                    i_small.classList.add("fas");
                    i_small.classList.add("fa-regular");
                    i_small.classList.add("fa-user");
                    i_small.classList.add("custom-icon-small");
                    i_small.setAttribute("id", "profile_picture_small_img");
                    i_small.style.color = "#000000";

                    document.querySelector("#profile_picture_small_img").remove()
                    document.querySelector("#profile_picture_small").append(i_small)
                } else {
                    document.querySelector("#message").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
                }
            })

            form_picture.style.display = "none";
            form.style.display = "none";
            info.style.display = "block";
    })

    document.getElementById("id_profile_picture").addEventListener("change", () => {
        const fileInput = document.getElementById("id_profile_picture");
        const label = document.querySelector(".custom-file-label");

        if (fileInput.files.length > 0) {
            label.textContent = fileInput.files[0].name;
        } else {
            label.textContent = "Choose file";
        }
    });
});


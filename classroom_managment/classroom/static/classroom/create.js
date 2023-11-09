document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#create_button").addEventListener("click", () => {
        const classrom_form = document.querySelector("#create_form");
        const classroom_list = document.querySelector("#classroom_main");

        classrom_form.style.display = "block";
        classroom_list.style.display = "none";
    })

    document.querySelector("#close_form").addEventListener("click", () => {
            const classrom_form = document.querySelector("#create_form");
            const classroom_list = document.querySelector("#classroom_main");

            classrom_form.style.display = "none";
            classroom_list.style.display = "block";

            const name_form = document.querySelector("#name_form");
            const theme_form = document.querySelector("#theme_form");
            const link_form = document.querySelector("#link_form");
            const description_form = document.querySelector("#description_form");

            name_form.value = "";
            theme_form.value = "";
            link_form.value = "";
            description_form = "";

    })

    document.querySelector("#create_form_button").addEventListener("click", () => {

        const name_form = document.querySelector("#name_form");
        const theme_form = document.querySelector("#theme_form");
        const link_form = document.querySelector("#link_form");
        const description_form = document.querySelector("#description_form");

        fetch('/create/', {
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
            console.log(result.details)
            if (result.data) {
            window.location.href = `http://127.0.0.1:8000/classrooms/${result.data.id}`;

            document.querySelector("#message").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;

            } else {
                document.querySelector("#message").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.details}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`;
            }
        });
    })
})
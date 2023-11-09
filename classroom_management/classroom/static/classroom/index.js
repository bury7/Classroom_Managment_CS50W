document.addEventListener("DOMContentLoaded", () => {
    fetch('/classlists/')
    .then(response => response.json())
    .then(classrooms => {
        let classroom_tag = document.querySelector("#classrooms")

        if (classrooms.length !== 0) {
            classrooms.forEach(classroom => {

                const h2 = document.createElement("h2");
                h2.innerHTML = classroom.name;

                const p = document.createElement("p");
                p.innerHTML = `Teacher: ${classroom.teacher}`;


                const li = document.createElement("li");
                li.classList.add("list-group-item");
                li.classList.add("inner-container");
                li.addEventListener("click", () => {
                    window.location.href = `http://127.0.0.1:8000/classrooms/${classroom.id}`;
                })

                li.append(h2);
                li.append(p);

                classroom_tag.append(li);
        
            });
        } else {
            const h2_ = document.createElement("h2");
            h2_.innerHTML = "No classrooms available.";
            h2_.classList.add("inner-container");

            classroom_tag.append(h2_);
        }
    });
})
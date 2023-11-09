document.addEventListener("DOMContentLoaded", () => {
    load_assignments()
})

function load_assignments() {
    const currentURL = window.location.href;
    const urlParts = currentURL.split('/');
    const valueIndex = urlParts.indexOf('classrooms') + 1; 
    const id = urlParts[valueIndex];

    fetch(`/classlists/${id}/assignmentslist`)
    .then(response => response.json())
    .then(assignments => {
        let assignments_tag = document.querySelector("#assignments")

        if (assignments.length !== 0) {
            assignments.forEach(assignment => {
                const div_2 = document.createElement("div");
                div_2.classList.add("content")

                const h2 = document.createElement("h2");
                h2.innerHTML = assignment.name;
                h2.classList.add("mb-0", "pointer");
                h2.addEventListener("click", () => {
                    window.location.href = `http://127.0.0.1:8000/classrooms/${id}/assignments/${assignment.id}`;
                })



                const p = document.createElement("p");
                p.innerHTML = assignment.description;
                p.classList.add("mb-0");

                div_2.append(h2);
                
                if (assignment.deadline != "None") {
                    console.log(assignment.deadline)
                    let deadline = document.createElement("p")
                    const dateObject = new Date(Date.parse(assignment.deadline))
                    deadline.setAttribute("data-time", dateObject.toISOString())
                    deadline.innerHTML = `Deadline: ${formatDateString(assignment.deadline)}`
                    div_2.append(deadline)
                }
                
                div_2.append(p);


                if (assignment.links) {
                    for (let i = 0; i < assignment.links.length; i++) {
                        let link = document.createElement("a");
                        let linkname = assignment.links[i]
                        link.innerHTML = `<i class="fas fa-link"></i> ${linkname}`;
                        link.classList.add("mb-3", "text-primary", "d-block");
                        link.setAttribute("href", assignment.links[i]);
                        link.setAttribute("target", "_blank")
                        div_2.append(link);
                    }
                }

                if (assignment.files) {
                    for (let i = 0; i < assignment.files.length; i++) {
                        let file = document.createElement("a");
                        let filename = assignment.files[i].replace("/media/uploads/", "")
                        file.innerHTML = `<i class="fas fa-file"></i> ${filename}`;
                        file.classList.add("mb-3", "text-primary", "d-block");
                        file.setAttribute("href", assignment.files[i]);
                        file.setAttribute("target", "_blank")
                        div_2.append(file);
                    }
                }


                const i = document.createElement("i")
                if (assignment.type === "material") {
                    i.classList.add("fas", "fa-book", "fa-3x", "mr-3");
                } else {
                    i.classList.add("fas", "fa-pen", "fa-3x", "mr-3");
                }

                const div_1 = document.createElement("div");
                div_1.classList.add("d-flex", "align-items-cent");


                div_1.append(i)
                div_1.append(div_2)


                const li = document.createElement("li");
                li.classList.add("list-group-item","inner-container");
        
                li.append(div_1);

                const br = document.createElement("br");

                assignments_tag.append(li);
                assignments_tag.append(br);
            });
        } else {
            const h2_ = document.createElement("h2");
            h2_.innerHTML = "No available assigments.";
            h2_.classList.add("inner-container")

            assignments_tag.append(h2_);
        }
    });
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

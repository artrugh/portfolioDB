const formPost = document.querySelector('#post-img');

formPost.style.backgroundColor = 'yellow';

const send = async (e, form) => {

    e.preventDefault();

    console.log(form);

    // console.log(e);
    // console.log(form);
    const dataInputs = document.querySelectorAll('.mb-3 input');

    // console.log([...dataInputs].map(x => x.name));

    let formData = new FormData()

    const entriesForm = () => [...dataInputs].map(input => {

        input.name === "file" ?
            formData.append(input.name, input.files[0]) :
            formData.append(input.name, input.value)
    });

    entriesForm()

    const data = new URLSearchParams();

    for (const pair of formData) {
        console.log(pair[0], pair[1]);

        data.append(pair[0], pair[1]);
    }



    // formData.append(entry[0], entry[1])
    // await setAction(request(formData))

    await fetch('http://localhost:4000/upload', {

        method: 'POST',
        mode: 'cors',
        body: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    // .then((res) => res.json())
    // .then((data) => console.log(data))
    // .catch((error) => console.error('Error:', error));

    console.log('We send post asynchronously (AJAX)');

    // return response.json()
    //     .then((data) => {
    //         console.log(data); // JSON data parsed by `response.json()` call
    //     })
    //     .catch((error) => {
    //         console.error('Error:', error);
    //     });

}

formPost.onsubmit = (e) => send(e, this)


    .querySelector('#<%= file._id %>')

action = "/files/<%= document.getElementById('file._id').value %>?_method=DELETE" -- >
    enctype="application/json"
method = "POST"

method = "POST"
action = "/files/<%= file._id + 'lolo'%> ?_method=DELETE"


onsubmit = "async (e) => {
e.preventDefault();
const password = document.getElementById('<%= file._id %>').value;
console.log('/files/<%= file._id %> + password ?_method=DELETE') 
    }"


onsubmit = "async (e) => {
e.preventDefault();
const password = document.getElementById('<%= file._id %>').value;
console.log('/files/<%= file._id %> + password ?_method=DELETE');
const url = `http://localhost:4000/files/<%= file._id %>`
await fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'multipart/form-data'
    }
})

  // .redirect(url.format({
                        //     pathname: '/dashboard',
                        //     query: { "id": id }
                        // }));


method = "POST" action = "/files/<%= file._id + 'lolo'%> ?_method=DELETE"

action = "func1('<%= file._id %>')"

action =<% deleteURL(func1(file._id)) %>

    onchange=" func0('<%= file._id %>') "


onchange = "<% onChange(file._id, password) %>"

onclick = "console.log(document.getElementById('delete-form'))"

action = "/files/<%= file._id%> ?_method=DELETE"



    < !-- <% if (file.isImage) { %>
        <img src="image/<%= file.filename %>" alt="">
            <% } else { %> -->
      < !-- < a href="/files/<%= project.generic_name %>" target="_blank"><%= project.generic_name %></a> -->
      < !-- <% } %> -->
// client-side js
// run by the browser each time your view template referencing it is loaded

const archives = [];

const form = document.forms[0];
const list = document.getElementById("archives");

(()=>{
  const date = new Date();
  var yyyy = date.getFullYear();
  var mm = ("0"+(date.getMonth()+1)).slice(-2);
  var dd = ("0"+date.getDate()).slice(-2);
  form.elements["date"].value=yyyy+'-'+mm+'-'+dd;
})();
const formatDate = datestr => {
  const result = datestr.match(/(\d+)-(\d+)-(\d+)/);
  return [result[2],result[3],result[1]].join("/");
};
const appendRecord = record => {
  const newListItem = document.createElement("li");
  newListItem.innerText = formatDate(record.date) + "(" + record.name + "):" + record.content;
  list.insertBefore(newListItem, list.firstChild);
};

form.onsubmit = event => {
  event.preventDefault();

  const data = {
    name: form.elements["name"].value,
    date: form.elements["date"].value,
    content: form.elements["content"].value
  };
  
  if(data.name === "" && data.content === "") { return; }
  fetch("/addRecord", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      console.log(JSON.stringify(response));
    });
  archives.push(Object.create(data));
  appendRecord(data);

  form.reset();
};

fetch("/getRecords", {})
  .then(res => res.json())
  .then(response => {
    response.forEach(row => {
      appendRecord(row);
    });
  });

// Author: Luis Souza
// REMEMBRALL App - just a simple app that saves
// reminders and shows them using Local Notifications

let app = {
  pages: [],
  init: function () {
    document.addEventListener('deviceready', app.ready, false);
  },
  ready: function () {
    app.addListeners();
  },
  ftw: function () {
    console.log("OK");
  },
  wtf: function (err) {
    console.warn('failure');
    console.error(err);
  },
  addListeners: function () {
    document.addEventListener('pause', () => {
      console.log('system paused');
    });
    document.addEventListener('resume', () => {
      console.log('system resumed');
    });
    document.querySelector('#rem-add').addEventListener('click', app.add);
    document.querySelector('#lblCancel').addEventListener('click', app.cancel);
    document.querySelector('#lblDone').addEventListener('click', app.save);
    app.loadEvents();
  },
  loadEvents: function () {
    let remList = document.querySelector("#remList");
    remList.innerHTML = "";
    let notification = cordova.plugins.notification.local;
    notification.getAll(elements => {
      elements.sort((a, b) => {
        return a.at - b.at;
      }).forEach(item => {
        let listLine = document.createElement("li");
        listLine.setAttribute("class", "remind-item");
        listLine.setAttribute("id", item.id);
        let h4Line = document.createElement("h4");
        h4Line.setAttribute("class", "remind-lbl");
        h4Line.setAttribute("id", item.id);
        h4Line.textContent = item.title;
        let h5Line = document.createElement("h5");
        h5Line.setAttribute("class", "remind-dt");
        h5Line.setAttribute("id", item.id);
        let ndate = new Date(item.at);
        let newDate = ndate.toISOString().slice(0, 10);
        let newTime = ndate.getUTCHours() + ':' + ndate.getUTCMinutes();
        h5Line.textContent = moment(newDate).format('ll') + " @ " + newTime;
        let btnDel = document.createElement("input");
        btnDel.setAttribute("type", "button");
        btnDel.setAttribute("class", "remind-del");
        btnDel.setAttribute("id", item.id);

        remList.appendChild(listLine);
        listLine.appendChild(h4Line);
        listLine.appendChild(h5Line);
        listLine.appendChild(btnDel);
        remList.addEventListener("click", app.update);
        btnDel.addEventListener("click", app.delete);
      });
    })

  },
  add: function (e) {
    e.stopPropagation();
    e.preventDefault();
    app.switchPages();
    document.querySelector("#rem-lbl").focus();
  },
  update: function (e) {
    e.stopPropagation();
    e.preventDefault();
    let notification = cordova.plugins.notification.local;
    notification.get(e.target.id, function (notifications) {
      let ndate = new Date(notifications.at);
      let newDate = ndate.toISOString().slice(0, 10);
      let newTime = ndate.getUTCHours() + ':' + ndate.getUTCMinutes();
      document.querySelector("#lblDone").dataset.id = notifications.id;
      document.querySelector("#rem-lbl").value = notifications.title;
      document.querySelector("#rem-date").value = newDate;
      document.querySelector("#rem-time").value = newTime;
    });
    app.switchPages();
  },
  cancel: function (e) {
    e.stopPropagation();
    e.preventDefault();
    app.clearForm();
    app.switchPages();
  },
  save: function (e) {
    e.stopPropagation();
    e.preventDefault();
    let notification = cordova.plugins.notification.local;
    let newId = new Date().getTime();
    if (e.target.dataset.id != "") {
      cordova.plugins.notification.local.cancel(e.target.dataset.id, app.doNothing, this);
    }
    let remDt = JSON.parse(moment(document.querySelector("#rem-date").value + "T" + document.querySelector("#rem-time").value + ":00.000Z").format("x"));
    let newDt = new Date(remDt);

    notification.schedule({
      id: newId,
      title: document.querySelector("#rem-lbl").value,
      at: newDt * 1000
    }, app.loadEvents);
    document.querySelector("#lblDone").dataset.id = "";
    app.clearForm();
    app.switchPages();
  },
  delete: function (e) {
    e.stopPropagation();
    e.preventDefault();
    let lblTitle = "Delete Event?";
    let lblMessage = "Deleting this reminder will also remove it from the list";
    let btnLabels = ["Cancel", "Delete"];
    navigator.notification.confirm(lblMessage, function (btnIndex) {
      if (btnIndex == 2) {
        cordova.plugins.notification.local.cancel(parseInt(e.target.id), app.loadEvents, this);
      }
    }, lblTitle, btnLabels);
  },
  switchPages: function (e) {
    pages = document.querySelectorAll(".top-banner");
    pages[0].classList.toggle("hide");
    pages[1].classList.toggle("hide");
    pages = document.querySelectorAll(".pages");
    pages[0].classList.toggle("hide");
    pages[1].classList.toggle("hide");
  },
  clearForm: function () {
    document.querySelector("#frmForm").reset();
  },
  doNothing: function () { console.log("ID Deleted"); }
};

app.init();

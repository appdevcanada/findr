// Author: Luis Souza
// FINDR App - just a simple app that shows Google Maps
// and saves tapped locations for the user
/* globals API_KEY_FOR_IOS */

let app = {
  map: null,
  points: [],
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
    app.injectScript();
    app.loadEvents();
  },
  loadEvents: function () {
    if (navigator.geolocation) {
      let giveUp = 30 * 1000;
      let tooOld = 60 * 60 * 1000;
      let options = {
        enableHighAccuracy: true,
        timeout: giveUp,
        maximumAge: tooOld
      }
      map = new google.maps.Map(document.querySelector("#map"), {
        center: new google.maps.LatLng(45.4215, -75.6972),
        zoom: 14
      });
      var infoWindow = new google.maps.InfoWindow();

      navigator.geolocation.getCurrentPosition(function (position) {
        let pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        map.setCenter(pos);
        let marker = new google.maps.Marker({
          position: new google.maps.LatLng(pos.lat, pos.lng),
          map: map
        });
        infoWindow.setPosition(marker.position);
        infoWindow.setContent("You are HERE!");
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
        map.addListener('dblclick', function (e) {
          app.saveLS(map, e.latLng);
          // e.preventDefault();
        });
      }, function () {
        app.handleLocationError(true, infoWindow, map.getCenter());
      }, options);
      app.loadLS();
    } else { app.handleLocationError(false, infoWindow, map.getCenter()); }
  },
  injectScript: function () {
    // let doc = document.createElement("script");
    // doc.addEventListener("load", app.loadEvents);
    // doc.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY_FOR_IOS}`;
    // document.head.appendChild(doc);
  },
  handleLocationError: function (browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
  },
  loadLS: function () {
    let lsPoint = localStorage.getItem("Points");
    if (lsPoint != null) {
      app.points = JSON.parse(lsPoint);
      for (let i = 0; i < app.points.length; i++) {
        let marker = new google.maps.Marker({
          position: app.points[i]["position"],
          map: map
        });
        infoWindow = new google.maps.InfoWindow();
        infoWindow.setPosition(app.points[i]["position"]);
        infoWindow.setContent(app.points[i]["title"]);
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          return false;
        });
        marker.addListener('dblclick', () => {
          marker.setMap(null);
          return false;
        });
      };
    }
  },
  saveLS: function (map, pos) {
    map.panTo(pos);
    let newPin = window.prompt("Type a comment:");
    if (newPin != "") {
      let newPoint = {
        position: pos,
        title: newPin
      };
      var marker = new google.maps.Marker({
        position: pos,
        map: map
      });
      infoWindow = new google.maps.InfoWindow();
      infoWindow.setPosition(marker.position);
      infoWindow.setContent(newPin);
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
      if (localStorage['Points']) {
        app.points = JSON.parse(localStorage['Points']);
      }
      if (app.points != null) {
        app.points.push(newPoint);
      } else {
        app.points = [newPoint];
      }
      localStorage.setItem("Points", JSON.stringify(app.points));
      console.log(localStorage['Points']);
    }
  }
};

app.init();

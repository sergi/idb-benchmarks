if (!window.indexedDB) {
  window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}

var db;
var req = indexedDB.deleteDatabase('BenchDB');
req.onsuccess = function () {
  console.log("Deleted database successfully");
  generateAll();
};
req.onerror = function () {
  console.log("Couldn't delete database");
  generateAll();
}

function generateAll() {
  console.log('Generating contacts and inserting them in database');

  var request = window.indexedDB.open("BenchDB", 3);

  request.onerror = function(event) {
    alert("Unable to open database");
  };

  request.onupgradeneeded = function(event) {
    db = event.target.result;
    var objectStore = db.createObjectStore("contacts", { autoIncrement: true });

    objectStore.createIndex("info", "info", { unique: false });

    objectStore.transaction.oncomplete = function(event) {
      var customerObjectStore = db.transaction("contacts", "readwrite").objectStore("contacts");
      for (var i=0; i<2000; i++) {
        var contact = [];
        contact.push(
          Faker.Name.firstName(),
          Faker.Name.lastName(),
          Faker.Name.lastName(),
          Faker.PhoneNumber.phoneNumber(),
          Faker.Internet.email(),
          Faker.Company.companyName());

          console.log(contact.join(' '))
          customerObjectStore.add({ info: contact.join(' ') });
      }
      console.log(i + ' contacts inserted successfully.');
    };
  };
}

//function search(txt) {
//var objectStore = db.transaction("contacts").objectStore("contacts");
//var index = objectStore.index("info");
//var lowerBoundKeyRange = IDBKeyRange.lowerBound(txt);
//index.openCursor(lowerBoundKeyRange).onsuccess = function(event) {
//var cursor = event.target.result;
//if (cursor) {
//console.log(cursor)
//// Do something with the matches.
//cursor.continue();
//}
//};
//}

var incrementalBtn = document.getElementById('incremental');
var contents = document.getElementById('contents');

function search(str) {
  var time = Date.now();

  var results = [];
  var reStr = new RegExp(str, 'i');
  var store = db.transaction("contacts") .objectStore("contacts");

  function appendResult(res) {
    if (incrementalBtn.checked) {
      contents.innerHTML += res + '<br>';
    } else {
      results.push(res);
    }
  }

  var request = store.openCursor();
  request.onsuccess = function(evt) {
    var cursor = evt.target.result;
    if (cursor) {
      if (reStr.test(cursor.value.info)) {
        appendResult(cursor.value.info)
      }
      cursor.continue();
    } else {
      console.log('Time spent searching and traversing the whole database:', Date.now() - time + 'ms');
      document.getElementById('contents').innerHTML += results.join('<br/>');
    }
  };
}

document.getElementById('searchBtn').addEventListener('click', function(ev) {
  document.getElementById('contents').innerHTML = '';
  search(document.getElementById('searchBox').value);
});

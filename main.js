/*global Faker */
if (!window.indexedDB) {
  window.alert("Your browser doesn't support a stable version of IndexedDB.");
}

var ctArray = [];
function generateContacts() {
  console.log('Generating contacts...');
  for (var i = 0; i < 2000; i ++) {
    ctArray.push([
      Faker.Name.firstName(),
      Faker.Name.lastName(),
      Faker.PhoneNumber.phoneNumber(),
      Faker.Internet.email(),
      Faker.Company.companyName()
    ].join(' '));
  }
  resetDB(function() {
    searchBtn.disabled = false;
    console.log("Contacts generated");
  });
}

var db;
function resetDB(cb) {
  var req = indexedDB.deleteDatabase('BenchDB');
  req.onsuccess = function () {
    console.log("Deleted database successfully");
    insertContactsInDB(cb);
  };
  req.onerror = function () {
    console.log("Couldn't delete database");
    insertContactsInDB(cb);
  };
}

function insertContactsInDB(cb) {
  var request = window.indexedDB.open("BenchDB", 3);

  request.onerror = function(event) {
    alert("Unable to open database");
  };

  request.onupgradeneeded = function(event) {
    db = event.target.result;
    var objectStore = db.createObjectStore("contacts", {
      autoIncrement: true
    });

    objectStore.createIndex("info", "info", { unique: false });

    objectStore.transaction.oncomplete = function(event) {
      var customerObjectStore =
        db.transaction("contacts", "readwrite").objectStore("contacts");

      for (var i = 0, l = ctArray.length; i < l; i ++) {
        customerObjectStore.add({ info: ctArray[i] });
      }
      console.log(i + ' contacts inserted successfully.');
      cb();
    };
  };
}

function searchIndexedDB(str) {
  var results = [];

  var transaction = db.transaction("contacts", 'readonly');
  var store = transaction.objectStore("contacts");
  var index = store.index('info');
  var request = index.openCursor(IDBKeyRange.lowerBound(0), 'next');

  var time = Date.now();
  request.onsuccess = function(evt) {
    var cursor = request.result;
    if (cursor) {
      if (cursor.value.info.indexOf(str) !== -1) {
        results.push(cursor.value.info);
      }
      cursor.continue();
    } else {
      totalTime.textContent = Date.now() - time + 'ms';
      populateList(results);
    }
  };
}

function search(str) {
  var time = Date.now();

  var results = [];
  if (method === 'array') {
    results = ctArray.filter(function(c) { return c.indexOf(str) !== -1; })
    totalTime.textContent = Date.now() - time + 'ms';
    populateList(results);
  }
  else if (method === 'indexeddb') {
    ctArray = [];
    searchIndexedDB(str);
  }
}

// DOM manipulation, listeners, etc.

function populateList(array) {
  var frag = document.createDocumentFragment();
  for (var i = 0, l = array.length; i < l; i ++) {
    var li = document.createElement('li');
    li.textContent = array[i];
    frag.appendChild(li);
    contents.appendChild(frag);
  }
}

generateContactsBtn.addEventListener('click', generateContacts);

var method;
var radios = document.querySelectorAll('input[name="method"]');
for(var i = 0, max = radios.length; i < max; i++) {
  radios[i].onclick = function() {
    method = this.value;
  };

  if (radios[i].checked) {
    method = radios[i].value;
  }
}
searchBtn.addEventListener('click', function(ev) {
  contents.innerHTML = '';
  search(searchBox.value);
});


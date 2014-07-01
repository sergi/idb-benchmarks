if (!window.indexedDB) {
  window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}

var ctArray = [];
function generateContacts() {
  console.log('Generating contacts...');

  ctArray = [];
  for (var i=0; i<2000; i++) {
    var ct = [];
    ct.push(
      Faker.Name.firstName(),
      Faker.Name.lastName(),
      Faker.PhoneNumber.phoneNumber(),
      Faker.Internet.email(),
      Faker.Company.companyName()
    );
    ctArray.push(ct.join(' '));
  }
  console.log(i + ' contacts generated successfully.');
};
generateContacts();

document.getElementById('generateContacts')
.addEventListener('click', function() {
  generateContacts();
});
/////////

var allText = [];
var method;

var radios = document.querySelectorAll('input[name="method"]');
for(var i = 0, max = radios.length; i < max; i++) {
  radios[i].onclick = function() {
    resetDB();
    method = this.value;
  }

  if (radios[i].checked) {
    method = radios[i].value;
  }
}

var db;
function resetDB() {
  var req = indexedDB.deleteDatabase('BenchDB');
  req.onsuccess = function () {
    console.log("Deleted database successfully");
    generateAll();
  };
  req.onerror = function () {
    console.log("Couldn't delete database");
    generateAll();
  }
}

function generateAll() {

  if (method !== 'indexeddb') {
    return;
  }

  var request = window.indexedDB.open("BenchDB", 3);

  request.onerror = function(event) {
    alert("Unable to open database");
  };

  request.onupgradeneeded = function(event) {
    db = event.target.result;
    var objectStore = db.createObjectStore("contacts", { autoIncrement: true });

    objectStore.createIndex("info", "info", { unique: false });

    objectStore.transaction.oncomplete = function(event) {
      var customerObjectStore =
        db.transaction("contacts", "readwrite").objectStore("contacts");

      for (var i = 0, l = ctArray.length; i < l; i ++) {
        customerObjectStore.add({ info: ctArray[i] });
      }
      console.log(i + ' contacts inserted successfully.');
    };
  };
}

var incrementalBtn = document.getElementById('incremental');
var contents = document.getElementById('contents');
var totalTime = document.getElementById('totalTime');

function search(str) {
  var time = Date.now();

  var results = [];
  if (method === 'array') {
    for (var i = 0, l = ctArray.length; i < l; i ++) {
      var v = ctArray[i];

      if (v.indexOf(str) !== -1) {
        appendResult(v);
      }
    }
    totalTime.textContent = Date.now() - time + 'ms';
    results.forEach(function(res) {
      contents.innerHTML += '<li>' + res + '</li>';
    });
    return;
  }

  //var reStr = new RegExp(str, 'i');
  var store = db.transaction("contacts").objectStore("contacts");

  function appendResult(res) {
    if (incrementalBtn.checked) {
      contents.innerHTML += '<li>' + res + '</li>';
    } else {
      results.push(res);
    }
  }

  var index = store.index('info');
  var request = index.openCursor(IDBKeyRange.lowerBound(0), 'next');
  request.onsuccess = function(evt) {
    var cursor = request.result;
    if (cursor) {
      //if (reStr.test(cursor.value.info)) {
      if (cursor.value.info.indexOf(str) !== -1) {
        appendResult(cursor.value.info);
      }
      cursor.continue();
    } else {
      totalTime.textContent = Date.now() - time + 'ms';
      document.getElementById('contents').innerHTML += results.join('<br/>');
    }
  };
}

document.getElementById('searchBtn').addEventListener('click', function(ev) {
  contents.innerHTML = '';
  search(document.getElementById('searchBox').value);
});

resetDB();

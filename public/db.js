// TODO: open  indexedDB
const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;
const request = indexedDB.open("budget", 1);

// TODO: create an object store in the open db
request.onupgradeneeded = (event) => {
  db = event.target.result;

  const budgetStore = db.createObjectStore("pending", {
    keypath: "id",
    autoIncrement: true
  });
};

request.onsuccess = function (event) {
  db = event.target.result;
  console.log(db);

  if (navigator.onLine) {
    checkDatabase();
  }
};

// TODO: log any indexedDB errors
request.onerror = function (err) {
  console.log(err.message);
};

// TODO: add code so that any transactions stored in the db
// are sent to the backend if/when the user goes online
// Hint: learn about "navigator.onLine" and the "online" window event.
function checkDatabase() {
  const transaction = db.transaction("pending", "readwrite");
  const objStore = transaction.objectStore("pending");
  const getAll = objStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then((response) => response.json())
        .then(() => {
          const trans = db.transaction("pending", "readwrite");
          const objStore = trans.objectStore("pending");

          const delRequest = objStore.clear();
          delRequest.onsuccess = (event) =>
            console.log("All records deleted", event.target);
          delRequest.onerror = (err) => console.log(err.message);
        });
    }
  };
}

// TODO: add code to saveRecord so that it accepts a record object for a
// transaction and saves it in the db. This function is called in index.js
// when the user creates a transaction while offline.
function saveRecord(record) {
  // add your code here
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction("pending", "readwrite");
  // access your pending object store
  const objStore = transaction.objectStore("pending");
  // add record to your store with add method.
  objStore.add(record);
}

window.addEventListener("online", checkDatabase);

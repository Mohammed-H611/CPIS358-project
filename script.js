// External script shared by all pages of Smart Car Maintenance & Expense Tracker.
// This is a static website with no server, so all data stays in the browser (localStorage).
// localStorage saves text only, so JSON turns our lists into text and back.

var USERS_KEY = "sct_accounts";
var SESSION_KEY = "sct_session";
var VEHICLES_KEY = "sct_vehicles";
var RECORDS_KEY = "sct_records";

// Shown in the expense table until the user saves a first record of their own.
var SAMPLE_RECORDS = [
    { date: "2026-03-12", service: "Oil Change", vehicle: "", odometer: 80000, cost: 180 },
    { date: "2026-06-05", service: "Tires", vehicle: "", odometer: 84500, cost: 1200 },
    { date: "2026-09-20", service: "Brakes", vehicle: "", odometer: 88200, cost: 350 }
];

/* ---------- Helper functions ---------- */

function readList(key) {
    var list = JSON.parse(localStorage.getItem(key));
    if (list == null) {
        return [];
    }
    return list;
}

function saveList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
}

function getSession() {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
}

function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
}

function totalCost(records) {
    var sum = 0;
    for (var i = 0; i < records.length; i++) {
        sum = sum + records[i].cost;
    }
    return Math.round(sum * 100) / 100;
}

function showMessage(id, text, color, background) {
    var message = document.getElementById(id);
    message.innerHTML = text;
    message.style.color = color;
    message.style.backgroundColor = background;
}

function showError(id, text) {
    showMessage(id, text, "#a31515", "#fdecea");
}

function showDone(id, text) {
    showMessage(id, text, "#1e6b34", "#e6f4ea");
}

// Stops typed text such as <b> from being read as HTML when it is put in innerHTML.
function safeText(text) {
    var result = "";
    for (var i = 0; i < text.length; i++) {
        var letter = text.charAt(i);
        if (letter == "<") {
            result = result + "&lt;";
        } else if (letter == "&") {
            result = result + "&amp;";
        } else {
            result = result + letter;
        }
    }
    return result;
}

/* ---------- Master page ---------- */

function setupUserMenu() {
    var session = getSession();
    if (session == null) {
        return;
    }
    document.getElementById("menu-login").style.display = "none";
    document.getElementById("menu-signup").style.display = "none";
    document.getElementById("menu-user").style.display = "inline-block";
    document.getElementById("menu-logout").style.display = "inline-block";
    document.getElementById("user-name").innerHTML = "Hi, " + safeText(session.name);
}

function logOut() {
    localStorage.removeItem(SESSION_KEY);
    window.location = "index.html";
}

/* ---------- Login and sign up ---------- */

function togglePasswords() {
    var type = "password";
    if (document.getElementById("show-password").checked) {
        type = "text";
    }
    document.getElementById("password").type = type;
    var confirmBox = document.getElementById("confirm_password");
    if (confirmBox != null) {
        confirmBox.type = type;
    }
}

// Demo only: the password is saved as plain text in this browser, which is why
// the login and sign up pages tell the user not to use a real password.
// A real website would check passwords on a server.
function signUp() {
    var name = document.getElementById("full_name").value;
    var email = document.getElementById("email").value.toUpperCase();
    var password = document.getElementById("password").value;
    var users = readList(USERS_KEY);

    if (password != document.getElementById("confirm_password").value) {
        showError("signup-msg", "The two passwords do not match.");
        return false;
    }
    for (var i = 0; i < users.length; i++) {
        if (users[i].email == email) {
            showError("signup-msg", "This email already has an account. Please log in.");
            return false;
        }
    }
    var user = { name: name, email: email, password: password };
    users[users.length] = user;
    saveList(USERS_KEY, users);
    saveSession(user);
    window.location = "tracker.html";
    return false;
}

function logIn() {
    var email = document.getElementById("email").value.toUpperCase();
    var password = document.getElementById("password").value;
    var users = readList(USERS_KEY);

    for (var i = 0; i < users.length; i++) {
        if (users[i].email == email && users[i].password == password) {
            saveSession(users[i]);
            window.location = "tracker.html";
            return false;
        }
    }
    showError("login-msg", "Wrong email or password.");
    return false;
}

/* ---------- Tracker ---------- */

function showVehicles() {
    var vehicles = readList(VEHICLES_KEY);
    var rows = "";
    var options = "<option value=\"\">Not specified</option>";

    for (var i = 0; i < vehicles.length; i++) {
        var brand = safeText(vehicles[i].brand);
        var plate = safeText(vehicles[i].plate);
        rows = rows + "<tr><td>" + brand + "</td><td>" + vehicles[i].year + "</td>" +
            "<td><span class=\"swatch\" style=\"background-color: " + vehicles[i].color + ";\"></span></td>" +
            "<td>" + plate + "</td>" +
            "<td><button type=\"button\" class=\"delete-btn\" onclick=\"deleteVehicle(" + i + ")\">Delete</button></td></tr>";
        options = options + "<option>" + brand + " (" + plate + ")</option>";
    }

    document.getElementById("vehicle-rows").innerHTML = rows;
    document.getElementById("vehicle").innerHTML = options;
    if (vehicles.length == 0) {
        document.getElementById("vehicle-table").style.display = "none";
    } else {
        document.getElementById("vehicle-table").style.display = "table";
    }
}

function showExpenses() {
    var saved = readList(RECORDS_KEY);
    var usingSamples = saved.length == 0;
    var records = saved;
    if (usingSamples) {
        records = SAMPLE_RECORDS;
    }

    var rows = "";
    for (var i = 0; i < records.length; i++) {
        var vehicle = "-";
        if (records[i].vehicle != "") {
            vehicle = safeText(records[i].vehicle);
        }
        var action = "-";
        if (!usingSamples) {
            action = "<button type=\"button\" class=\"delete-btn\" onclick=\"deleteRecord(" + i + ")\">Delete</button>";
        }
        rows = rows + "<tr><td>" + records[i].date + "</td><td>" + records[i].service + "</td>" +
            "<td>" + vehicle + "</td><td>" + records[i].odometer + "</td>" +
            "<td>" + records[i].cost + "</td><td>" + action + "</td></tr>";
    }

    document.getElementById("expense-rows").innerHTML = rows;
    document.getElementById("expense-total").innerHTML = totalCost(records);
    if (usingSamples) {
        document.getElementById("expense-caption").innerHTML = "Sample Maintenance Expenses (example data)";
    } else {
        document.getElementById("expense-caption").innerHTML = "Your Maintenance Expenses";
    }
}

// Makes a new list that has every item except the one at the given position.
function removeItem(list, position) {
    var kept = [];
    for (var i = 0; i < list.length; i++) {
        if (i != position) {
            kept[kept.length] = list[i];
        }
    }
    return kept;
}

function deleteVehicle(position) {
    saveList(VEHICLES_KEY, removeItem(readList(VEHICLES_KEY), position));
    showVehicles();
}

function deleteRecord(position) {
    saveList(RECORDS_KEY, removeItem(readList(RECORDS_KEY), position));
    showExpenses();
}

function saveVehicle() {
    var plate = document.getElementById("plate_number").value.toUpperCase();
    var vehicles = readList(VEHICLES_KEY);

    for (var i = 0; i < vehicles.length; i++) {
        if (vehicles[i].plate == plate) {
            showError("vehicle-msg", "A vehicle with this plate number is already saved.");
            return false;
        }
    }
    vehicles[vehicles.length] = {
        brand: document.getElementById("car_brand").value,
        year: document.getElementById("car_year").value,
        color: document.getElementById("car_color").value,
        plate: plate
    };
    saveList(VEHICLES_KEY, vehicles);

    document.getElementById("car_brand").value = "";
    document.getElementById("plate_number").value = "";
    showVehicles();
    showDone("vehicle-msg", "Vehicle saved.");
    return false;
}

function saveRecord() {
    var records = readList(RECORDS_KEY);
    records[records.length] = {
        date: document.getElementById("service_date").value,
        service: document.getElementById("service_type").value,
        vehicle: document.getElementById("vehicle").value,
        odometer: parseFloat(document.getElementById("odometer").value),
        cost: parseFloat(document.getElementById("cost").value),
        location: document.getElementById("record-form").service_location.value,
        notes: document.getElementById("notes").value
    };
    saveList(RECORDS_KEY, records);

    document.getElementById("service_date").value = "";
    document.getElementById("odometer").value = "";
    document.getElementById("cost").value = "";
    document.getElementById("notes").value = "";
    showExpenses();
    showDone("record-msg", "Record saved. See the Expense Summary below.");
    return false;
}

setupUserMenu();

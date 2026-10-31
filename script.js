// External script shared by all pages of Smart Car Maintenance & Expense Tracker.
// This is a static website with no server, so all data stays in the browser (localStorage).

var KEYS = {
    users: "sct_users",
    session: "sct_session",
    vehicles: "sct_vehicles",
    records: "sct_records"
};

// Shown in the expense table until the user saves a first record of their own.
var SAMPLE_RECORDS = [
    { date: "2026-03-12", service: "Oil Change", vehicle: "", odometer: 80000, cost: 180 },
    { date: "2026-06-05", service: "Tires", vehicle: "", odometer: 84500, cost: 1200 },
    { date: "2026-09-20", service: "Brakes", vehicle: "", odometer: 88200, cost: 350 }
];

function readList(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
        return [];
    }
}

function saveList(key, list) {
    try {
        localStorage.setItem(key, JSON.stringify(list));
        return true;
    } catch (e) {
        return false;
    }
}

function getSession() {
    try {
        return JSON.parse(localStorage.getItem(KEYS.session));
    } catch (e) {
        return null;
    }
}

function formatNumber(value) {
    return Number(value).toLocaleString("en-US");
}

function totalCost(records) {
    return records.reduce(function (sum, record) {
        return sum + Number(record.cost);
    }, 0);
}

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = "msg " + type;
}

// Demo only: a real website would check passwords on a server, not in the browser.
function hashPassword(email, password) {
    var text = email + ":" + password;
    var hash = 5381;
    for (var i = 0; i < text.length; i++) {
        hash = ((hash * 33) ^ text.charCodeAt(i)) >>> 0;
    }
    return hash.toString(16);
}

/* ---------- Master page ---------- */

function markActiveLink() {
    var page = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("nav .menu > li > a").forEach(function (link) {
        if (link.getAttribute("href") === page) {
            link.classList.add("active");
        }
    });
}

function setupUserMenu() {
    var session = getSession();
    document.querySelectorAll(".guest-only").forEach(function (item) {
        item.hidden = Boolean(session);
    });
    document.querySelectorAll(".user-only").forEach(function (item) {
        item.hidden = !session;
    });
    if (!session) {
        return;
    }
    document.getElementById("user-name").textContent = "Hi, " + session.name;
    document.getElementById("logout").addEventListener("click", function () {
        localStorage.removeItem(KEYS.session);
        location.href = "index.html";
    });
}

/* ---------- Login and sign up ---------- */

function setupPasswordToggles() {
    document.querySelectorAll(".show-password").forEach(function (box) {
        box.addEventListener("change", function () {
            box.form.querySelectorAll(".password").forEach(function (input) {
                input.type = box.checked ? "text" : "password";
            });
        });
    });
}

function setupSignup() {
    var form = document.getElementById("signup-form");
    if (!form) {
        return;
    }
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var message = document.getElementById("signup-msg");
        var name = form.full_name.value.trim();
        var email = form.email.value.trim().toLowerCase();
        var users = readList(KEYS.users);

        if (form.password.value !== form.confirm_password.value) {
            showMessage(message, "The two passwords do not match.", "error");
            return;
        }
        var exists = users.some(function (user) {
            return user.email === email;
        });
        if (exists) {
            showMessage(message, "This email already has an account. Please log in.", "error");
            return;
        }
        users.push({ name: name, email: email, hash: hashPassword(email, form.password.value) });
        saveList(KEYS.users, users);
        localStorage.setItem(KEYS.session, JSON.stringify({ name: name, email: email }));
        location.href = "tracker.html";
    });
}

function setupLogin() {
    var form = document.getElementById("login-form");
    if (!form) {
        return;
    }
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var email = form.email.value.trim().toLowerCase();
        var hash = hashPassword(email, form.password.value);
        var user = readList(KEYS.users).find(function (item) {
            return item.email === email && item.hash === hash;
        });
        if (!user) {
            showMessage(document.getElementById("login-msg"), "Wrong email or password.", "error");
            return;
        }
        localStorage.setItem(KEYS.session, JSON.stringify({ name: user.name, email: user.email }));
        location.href = "tracker.html";
    });
}

/* ---------- Tracker ---------- */

function addCell(row, text) {
    var cell = row.insertCell();
    cell.textContent = text;
    return cell;
}

function addDeleteButton(row, label, onDelete) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "delete-btn";
    button.textContent = "Delete";
    button.setAttribute("aria-label", "Delete " + label);
    button.addEventListener("click", onDelete);
    row.insertCell().appendChild(button);
}

function renderVehicles() {
    var vehicles = readList(KEYS.vehicles);
    var body = document.getElementById("vehicle-rows");
    body.textContent = "";
    document.getElementById("vehicle-table").hidden = vehicles.length === 0;

    vehicles.forEach(function (vehicle) {
        var row = body.insertRow();
        addCell(row, vehicle.brand);
        addCell(row, vehicle.year);
        var swatch = document.createElement("span");
        swatch.className = "swatch";
        swatch.style.backgroundColor = vehicle.color;
        row.insertCell().appendChild(swatch);
        addCell(row, vehicle.plate);
        addDeleteButton(row, vehicle.plate, function () {
            var kept = readList(KEYS.vehicles).filter(function (item) {
                return item.plate !== vehicle.plate;
            });
            saveList(KEYS.vehicles, kept);
            renderVehicles();
        });
    });

    var select = document.getElementById("vehicle");
    select.length = 1;
    vehicles.forEach(function (vehicle) {
        select.add(new Option(vehicle.brand + " (" + vehicle.plate + ")"));
    });
}

function renderExpenses() {
    var saved = readList(KEYS.records);
    var usingSamples = saved.length === 0;
    var records = (usingSamples ? SAMPLE_RECORDS : saved).slice().sort(function (a, b) {
        return a.date < b.date ? -1 : 1;
    });
    var body = document.getElementById("expense-rows");
    body.textContent = "";

    records.forEach(function (record) {
        var row = body.insertRow();
        addCell(row, record.date);
        addCell(row, record.service);
        addCell(row, record.vehicle || "-");
        addCell(row, formatNumber(record.odometer));
        addCell(row, formatNumber(record.cost));
        if (usingSamples) {
            addCell(row, "-");
            return;
        }
        addDeleteButton(row, record.service + " on " + record.date, function () {
            saved.splice(saved.indexOf(record), 1);
            saveList(KEYS.records, saved);
            renderExpenses();
        });
    });

    document.getElementById("expense-caption").textContent = usingSamples
        ? "Sample Maintenance Expenses (example data)"
        : "Your Maintenance Expenses";
    document.getElementById("expense-total").textContent = formatNumber(totalCost(records));
}

function setupTracker() {
    var vehicleForm = document.getElementById("vehicle-form");
    if (!vehicleForm) {
        return;
    }
    var recordForm = document.getElementById("record-form");

    vehicleForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var message = document.getElementById("vehicle-msg");
        var plate = vehicleForm.plate_number.value.trim().toUpperCase();
        var vehicles = readList(KEYS.vehicles);
        var exists = vehicles.some(function (item) {
            return item.plate === plate;
        });
        if (exists) {
            showMessage(message, "A vehicle with this plate number is already saved.", "error");
            return;
        }
        vehicles.push({
            brand: vehicleForm.car_brand.value.trim(),
            year: vehicleForm.car_year.value,
            color: vehicleForm.car_color.value,
            plate: plate
        });
        saveList(KEYS.vehicles, vehicles);
        vehicleForm.reset();
        renderVehicles();
        showMessage(message, "Vehicle saved.", "ok");
    });

    recordForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var records = readList(KEYS.records);
        records.push({
            date: recordForm.service_date.value,
            service: recordForm.service_type.value,
            vehicle: recordForm.vehicle.value,
            odometer: Number(recordForm.odometer.value),
            cost: Number(recordForm.cost.value),
            location: recordForm.service_location.value,
            notes: recordForm.notes.value.trim()
        });
        saveList(KEYS.records, records);
        recordForm.reset();
        renderExpenses();
        showMessage(document.getElementById("record-msg"), "Record saved. See the Expense Summary below.", "ok");
    });

    renderVehicles();
    renderExpenses();
}

markActiveLink();
setupUserMenu();
setupPasswordToggles();
setupSignup();
setupLogin();
setupTracker();

function validateLogin() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var msg = document.getElementById("login-msg");
    
    if (email === "" || password === "") {
        if (msg) {
            msg.innerHTML = "Please fill in all required fields.";
            msg.style.color = "red";
            msg.style.backgroundColor = "#fdecea";
        }
        alert("Please fill in all fields.");
        return false;
    }
    
    var validDomain = false;
    var allowedDomains = [".com", ".sa", ".org", ".net"];
    for (var i = 0; i < allowedDomains.length; i++) {
        if (email.indexOf(allowedDomains[i]) !== -1) {
            validDomain = true;
            break;
        }
    }

    if (!validDomain) {
        if (msg) {
            msg.innerHTML = "Please enter a valid email domain.";
            msg.style.color = "red";
        }
        return false;
    }

    if (msg) {
        msg.innerHTML = "Logged in successfully!";
        msg.style.color = "green";
        msg.style.backgroundColor = "#eef4fb";
    }
    alert("Logged in successfully!");
    return false; 
}
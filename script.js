function validateLogin() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var msg = document.getElementById("login-msg");
    var loginImg = document.getElementById("login-img");

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

   if (loginImg) {
        loginImg.style.border = "3px solid green";
        loginImg.style.boxShadow = "0 0 10px green";
    }

    alert("Logged in successfully!");
    return false; 
}
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
function validateLogin() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    
    if (email === "" || password === "") {
        alert("Please fill in all fields.");
        return false;
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
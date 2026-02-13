function validating() {

 

    let valid = true;
    let email = document.getElementById("dlsuEmail");

    let emailreg = /^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/;;

    if (!emailreg.test(email.value)) {
        valid = false;
    }

    if (valid == true) {
       window.location.href = 'student.html';
       return false;
    }
    else {
        alert("Please input a valid email!");
        return true;
    }
    
}
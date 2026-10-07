function startStudy() {
    let subject = document.getElementById("subject").value;

    if (subject == "") {
        document.getElementById("result").innerText = "Please enter a subject";
    } else {
        document.getElementById("result").innerText =
            "You chose " + subject + "! Let's study " + subject + "!";
    }
}
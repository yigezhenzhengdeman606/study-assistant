function startStudy(){
    if("") {
        let subject = document.getElementById("subject").value
        document.getElementById("result").innerText = "pls enter a subjct"
    }else{
        let subject = document.getElementById("subject").value
        document.getElementById("result").innerText = "you chose "+subject+"学吧，反正也学不会"
    }



}
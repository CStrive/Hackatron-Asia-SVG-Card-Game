function storeNickname(nickname) {
    // Check browser support
    if (typeof(Storage) != "undefined") {
        // Store
        localStorage.setItem("nickname", nickname);
        // Retrieve
        // alert(localStorage.getItem("nickname"));
    } else {
        document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
    }

    window.location.href='/game';
    console.log(window.location.href);
    alert("ok");
}

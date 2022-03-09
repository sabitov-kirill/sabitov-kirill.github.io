let mouseWheelPos = 0;

document.addEventListener('DOMContentLoaded', () => {
    let ava = document.getElementById("avatar");
    ava.src = "https://www.gravatar.com/avatar/" + CryptoJS.MD5("sabkirul@gmail.com").toString() + "?s=200";

    let background = document.getElementById("background");
    window.addEventListener('wheel', (event) => {
        mouseWheelPos += event.deltaY * 0.3; 
        mouseWheelPos = Math.min(mouseWheelPos, 1500);
        mouseWheelPos = Math.max(mouseWheelPos, 0);
        background.style.backgroundPositionX = -mouseWheelPos + "px";
    });
});
ROOT_URL = "http://localhost:8000";
API_URL = ROOT_URL + "/chatbot/api/get_answer";
message = document.getElementById("message-input");
gridMessage = document.getElementsByClassName("grid-message")[0];
submitBtn = document.getElementById("submit-btn");
content = document.getElementsByClassName("col-content")[0];

function scrollToEnd(element) {
    console.log(element.scrollTop, element.scrollHeight);
    element.scrollTop = element.scrollHeight;
}

function addMessage2Grid(element) {
    gridMessage.appendChild(element);
    scrollToEnd(content);
}

// Tạo ra message, mcase = 0 hoặc 1
// mcase = 1: received
// mcase = 0: sent
CASE_RECEIVED = 1;
CASE_SENT = 0;
function createMessage(message, mcase) {
    let tmp = document.createElement("div");
    let className = mcase ? "received" : "sent";
    // TO-DO: Lam mo doi voi tin nhan gui di chua phan hoi
    tmp.className = `col-message-${className}`;
    tmp.innerHTML = `<div class="message-${className}">
                <p>${message}</p>
            </div>`;
    addMessage2Grid(tmp);
}

function sendMessage() {
    let mess = message.value;
    createMessage(mess, CASE_SENT);
    message.value = "";
    // TO-DO: Lam mo khung nhap tin nhan
    submitBtn.style.opacity = "0.1";
    submitBtn.style.cursor = "not-allowed";

    // TO-DO: Lam tin nhan dong cho phan hoi
    return mess;
}

// Xử lý csrf token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === name + "=") {
                cookieValue = decodeURIComponent(
                    cookie.substring(name.length + 1)
                );
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie("csrftoken");
// ----------------------------------------------------------------------------

function getMessage(sent) {
    console.log("pre", sent);
    fetch(API_URL, {
        method: "POST",
        headers: { "X-CSRFToken": csrftoken },
        mode: "same-origin",
        body: JSON.stringify({
            message: sent,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            if (data.status) {
                createMessage(data.message, CASE_RECEIVED);

                // Cho phep gui tin nhan tiep theo sau khi nhan tin nhan
                submitBtn.style.opacity = "1";
                submitBtn.style.cursor = "pointer";
            } else {
                console.log(data.error_message);
                alert(error_message);
                // TO_DO: Xoa tin nhan cuoi cung
            }
        })
        .catch((err) => console.error(err));
}

function submitEvent(e) {
    if (message.value) {
        let mess = sendMessage();
        getMessage(mess);
    }
}

scrollToEnd(content);
submitBtn.addEventListener("click", submitEvent);

// Event "Enter" send mess
document.addEventListener("keyup", function(e) {
    if (e.keyCode === 13) {
        if (message.value) {
            let mess = sendMessage();
            getMessage(mess);
        }
    }
});
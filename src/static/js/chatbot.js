ROOT_URL = "http://localhost:8000";
API_URL = ROOT_URL + "/chatbot/api/get_answer";
messeage = document.getElementById("message-input");
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
// mcase = 0: sent
// mcase = 1: received
CASE_RECEIVED = 0;
CASE_SENT = 1;
function createMessage(message, mcase) {
    let tmp = document.createElement("div");
    let className = mcase ? "received" : "sent";
    // TO-DO: Lam mo doi voi tin nhan gui di chua phan hoi
    tmp.className = `col-message-${className}`;
    tmp.innerHTML = `<div class="message-${className}">
                <p>${message}</p>
            </div>`;
    console.log("hjjhhjjhj");
    console.log(tmp);
    addMessage2Grid(tmp);
}

function sendMessage() {
    let mess = messeage.value;
    createMessage(mess, CASE_SENT);
    messeage.value = "";
    // TO-DO: Lam mo khung nhap tin nhan
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
    const csrftoken = getCookie("csrftoken");
    fetch(API_URL, {
        method: "POST",
        headers: { "X-CSRFToken": csrftoken },
        body: JSON.stringify({
            message: sent,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            if (data.status) {
                createMessage(data.message, CASE_SENT);
            } else {
                console.log(data.error_message);
                alert(error_message);
                // TO_DO: Xoa tin nhan cuoi cung
            }
        })
        .catch((err) => console.error(err));
}

function submitEvent(event) {
    if (messeage.value) {
        let mess = sendMessage();
        getMessage(mess);
    }
}

scrollToEnd(content);
submitBtn.addEventListener("click", submitEvent);

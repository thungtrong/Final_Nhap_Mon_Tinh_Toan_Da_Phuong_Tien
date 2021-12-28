ROOT_URL = "http://localhost:8000";
API_URL = ROOT_URL + "/chatbot/api/get_answer";
messageInput = document.getElementById("message-input");
gridMessage = document.getElementsByClassName("grid-message")[0];
submitBtn = document.getElementById("submit-btn");
content = document.getElementsByClassName("col-content")[0];

// Get userName in localStorage
const nameUser = localStorage.getItem("userName");
// Định dạng: [[message, mcase], ...]
var listMessage = JSON.parse(localStorage.getItem("listMessage"));
listMessage = listMessage ? listMessage : [];

if (listMessage) {
    listMessage.forEach((element) => {
        createMessage(element[0], element[1], false);
    });
}

if (nameUser) {
    document.getElementById("nameUser").innerHTML = nameUser;

    createWaitMessage();
    setTimeout(function () {
        removeWaitMessage();
        let message = "Xin chào, " + nameUser;
        if (nameUser === "incognito")
            message = "Xin chào bạn";
        createMessage(message, CASE_RECEIVED);
    }, 1000);
}

function scrollToEnd(element) {
    // console.log(element.scrollTop, element.scrollHeight);
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
function createMessage(message, mcase, addList = true) {
    let tmp = document.createElement("div");
    let className = mcase ? "received" : "sent";

    tmp.className = `col-message-${className}`;
    tmp.innerHTML = `<div class="message-${className}">
                <p>${message}</p>
            </div>`;
    if (addList) listMessage.push([message, mcase]);
    addMessage2Grid(tmp);
    return tmp;
}

function createWaitMessage() {
    tmp = document.createElement("div");
    tmp.className = "col-message-received";
    tmp.id = "message-wait";
    tmp.innerHTML = `<div class="col-message-received">
        <div class="message-received message-wait">
            <p>
                <span class="middot">&#8226;</span>
                <span class="middot">&#8226;</span>
                <span class="middot">&#8226;</span>
            </p>
        </div>
    </div>`;
    addMessage2Grid(tmp);
}

function removeWaitMessage() {
    let dom = document.getElementById("message-wait");
    if (dom) dom.remove();
}

function getLastMessageSent() {
    let lastMessSent = document.getElementsByClassName("message-sent");
    return lastMessSent[lastMessSent.length - 1];
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
// ---------------------------------------------------------------

function sendMessage() {
    let mess = messageInput.value;
    let csrftoken = getCookie("csrftoken");

    // Gửi tin nhắn, tạo Promise để hàm nhận sẽ xử lý kết quả
    let promise = fetch(API_URL, {
        method: "POST",
        headers: { "X-CSRFToken": csrftoken },
        body: JSON.stringify({
            message: mess,
        }),
    });
    // Thêm vào danh sách

    createMessage(mess, CASE_SENT).firstChild.style.opacity = "0.5";
    messageInput.value = "";

    // Disable
    messageInput.disabled = true;
    // Lam mo khung nhap tin nhan
    submitBtn.style.opacity = "0.5";
    submitBtn.style.cursor = "not-allowed";

    return promise;
}

function getMessage(data) {
    console.log(data);
    if (data.status) {
        // Delay 1s vì quá nhanh
        setTimeout(function () {
            // Xoá bỏ tin nhắn chờ
            removeWaitMessage();

            createMessage(data.message, CASE_RECEIVED);

            // Cho phep gui tin nhan tiep theo sau khi nhan tin nhan
            messageInput.disabled = false;
            submitBtn.style.opacity = "1";
            submitBtn.style.cursor = "pointer";
        }, 1000);
    } else {
        console.log(data.error_message);
        alert(data.error_message);

        // Chuyen tin nhan cuoi sang class error
        getLastMessageSent().className += " message-error";
    }
}

function submitEvent(e) {
    if (messageInput.value) {
        sendMessage()
            .then((res) => {
                getLastMessageSent().style.opacity = 1;
                // Tin nhắn động chờ phản hồi

                createWaitMessage();
                return res.json();
            })
            .then(getMessage)
            .catch((err) => {
                console.log("Loi");
                removeWaitMessage();
                listMessage.pop();
                // Chuyen tin nhan cuoi sang class error
                getLastMessageSent().className += " message-error";
            });
    }
}

scrollToEnd(content);
submitBtn.addEventListener("click", submitEvent);

// Event "Enter" send mess
document.addEventListener("keyup", function (e) {
    if (e.keyCode === 13) {
        submitEvent(e);
    }
});

window.addEventListener("beforeunload", function (e) {
    e.preventDefault();
    localStorage.setItem("listMessage", JSON.stringify(listMessage));
    if (messageInput.value) {
        e.returnValue = "";
    }
});

// 
var modal = document.getElementById('modalDel');


// Lấy phần button mở modalDel
var btn = document.getElementById("delete-icon"); 

// Lấy phần span đóng modalDel 
var span = document.getElementsByClassName("close")[0]; 

// Khi button được click thì mở modalDel 

btn.onclick = function() {
    modal.style.display = "block"; 
    document.getElementById("yesBtn").addEventListener("click", cleanChat);
    document.getElementById("noBtn").addEventListener("click", cancel);
}


function cleanChat() {
    listMessage = [];
    localStorage.removeItem("listMessage");
    localStorage.removeItem("userName");
    window.location.href = "/";
}
function cancel() {
    window.location.href = "/chatbot/"
}

// Khi span được click thì đóng modalDel
span.onclick = function() {
    modal.style.display = "none"; 
}

// Khi click ngoài modalDel thì đóng modal 
window.onclick = function(event) { 
    if (event.target == modal) {
        modal.style.display = "none"; 
    }
}
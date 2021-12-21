ROOT_URL = "http://localhost:8000";
API_URL = ROOT_URL + "/chatbot/api/get_answer";
message = document.getElementById("message-input");
gridMessage = document.getElementsByClassName("grid-message")[0];
submitBtn = document.getElementById("submit-btn");
content = document.getElementsByClassName("col-content")[0];

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

function createWaitMessage() {
    tmp = document.createElement("div");
    tmp.className = "col-message-received";
    tmp.innerHTML = `<div class="col-message-received" id="message-wait">
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
    let mess = message.value;
    // Gửi tin nhắn, tạo Promise để hàm nhận sẽ xử lý kết quả
    let csrftoken = getCookie("csrftoken");

    let promise = fetch(API_URL, {
        method: "POST",
        headers: { "X-CSRFToken": csrftoken },
        body: JSON.stringify({
            message: mess,
        }),
    });

    createMessage(mess, CASE_SENT);
    message.value = "";
    // Lam mo khung nhap tin nhan
    submitBtn.style.opacity = "0.1";
    submitBtn.style.cursor = "not-allowed";

    // Lam tin nhan dong cho phan hoi
    createWaitMessage();
    return promise;
}

function getMessage(promise) {
    promise
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            if (data.status) {
                // Delay 1s vì quá nhanh
                setTimeout(function () {
                    // Xoá bỏ tin nhắn chờ
                    document.getElementById("message-wait").remove();

                    createMessage(data.message, CASE_RECEIVED);

                    // Cho phep gui tin nhan tiep theo sau khi nhan tin nhan
                    submitBtn.style.opacity = "1";
                    submitBtn.style.cursor = "pointer";
                }, 1000);
            } else {
                console.log(data.error_message);
                alert(data.error_message);
                // Chuyen tin nhan cuoi sang class error
                let tmp = document.getElementsByClassName("message-sent");
                tmp[tmp.length - 1].className.concat(" message-error");
            }
        })
        .catch((err) => {
            console.error(err);
            // Chuyen tin nhan cuoi sang class error
            let tmp = document.getElementsByClassName("message-sent");
            tmp[tmp.length - 1].className.concat(" message-error");
        });
}

function submitEvent(e) {
    if (message.value) {
        let promise = sendMessage();
        getMessage(promise);
    }
}

scrollToEnd(content);
submitBtn.addEventListener("click", submitEvent);

// Event "Enter" send mess
document.addEventListener("keyup", function (e) {
    if (e.keyCode === 13) {
        if (message.value) {
            let promise = sendMessage();
            getMessage(promise);
        }
    }
});

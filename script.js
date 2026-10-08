let studyInProgress = false;
let chatHistory = [];

function addMessage(role, text) {
    const chat = document.getElementById("chat");
    const message = document.createElement("div");

    message.className = "message " + role;
    message.textContent = (role === "user" ? "你：\n" : "AI：\n") + text;

    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;

    return message;
}

function setBusy(busy) {
    studyInProgress = busy;
    document.getElementById("sendButton").disabled = busy;
    document.getElementById("newChatButton").disabled = busy;
    document.getElementById("sendButton").textContent =
        busy ? "回答中……" : "发送";
}

function newChat() {
    if (studyInProgress) return;

    chatHistory = [];
    document.getElementById("chat").replaceChildren();
    document.getElementById("result").textContent = "";
    document.getElementById("subject").value = "";
    document.getElementById("subject").focus();
}

async function startStudy() {
    if (studyInProgress) return;

    const input = document.getElementById("subject");
    const status = document.getElementById("result");
    const message = input.value.trim();

    if (!message) {
        status.textContent = "请输入问题。";
        return;
    }

    if (message.length > 6000) {
        status.textContent = "请将问题控制在 6000 字以内。";
        return;
    }

    // 仅发送最近的完整问答，避免上下文过长。
    const history = chatHistory.slice(-20).map(item => ({ ...item }));

    while (
        history.length &&
        history.reduce((sum, item) => sum + item.content.length, 0)
            + message.length > 12000
    ) {
        history.splice(0, 2);
    }

    const userBubble = addMessage("user", message);
    input.value = "";
    status.textContent = "AI 正在思考，请稍等……";
    setBusy(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 55000);

    try {
        const response = await fetch(
            "https://study-atant-api-qbcyyhbgtl.cn-beijing.fcapp.run/api/chat",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, history }),
                signal: controller.signal
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "请求失败，请稍后重试。");
        }

        if (typeof data.reply !== "string" || !data.reply.trim()) {
            throw new Error("AI 没有返回回答，请重试。");
        }

        addMessage("assistant", data.reply);
        chatHistory = [
            ...history,
            { role: "user", content: message },
            { role: "assistant", content: data.reply }
        ];

        status.textContent = "可以继续追问。";
    } catch (error) {
        userBubble.remove();

        // 保留等待期间新输入的文字。
        if (!input.value) input.value = message;

        status.textContent = error.name === "AbortError"
            ? "等待超时，请重新发送。"
            : error instanceof TypeError
                ? "连接失败，请检查网络后重试。"
                : error.message;
    } finally {
        clearTimeout(timer);
        setBusy(false);
    }
}

document.getElementById("newChatButton").disabled = false;

document.getElementById("subject").addEventListener("keydown", event => {
    if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.isComposing
    ) {
        event.preventDefault();
        startStudy();
    }
});

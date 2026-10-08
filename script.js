let studyInProgress = false;

async function startStudy() {
    if (studyInProgress) return;

    const subject = document.getElementById("subject").value.trim();
    const result = document.getElementById("result");

    result.style.whiteSpace = "pre-wrap";

    if (!subject) {
        result.textContent = "请输入想学习的主题或问题。";
        return;
    }

    if (subject.length > 6000) {
        result.textContent = "请将问题控制在 6000 字以内。";
        return;
    }

    studyInProgress = true;
    result.textContent = "AI 正在思考，请稍等……";

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 55000);

    try {
        const response = await fetch(
            "https://study-atant-api-qbcyyhbgtl.cn-beijing.fcapp.run/api/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: subject }),
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

        result.textContent = data.reply;
    } catch (error) {
        result.textContent = error.name === "AbortError"
            ? "等待超时，请稍后重试。"
            : error instanceof TypeError
                ? "连接失败，请检查网络后重试。"
                : error.message;
    } finally {
        clearTimeout(timer);
        studyInProgress = false;
    }
}

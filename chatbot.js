// 브라우저 음성 인식 → GPT 프록시 서버 호출 → TTS 응답

function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "ko-KR";
  recognition.start();

  // 🎤 듣는 중 표시
  document.getElementById("question").innerText = "🎤 듣는 중이에요...";

  recognition.onresult = async function (event) {
    const userSpeech = event.results[0][0].transcript;
    document.getElementById("question").innerText = "🙋 질문: " + userSpeech;

    // 🤖 GPT 응답 대기 메시지
    document.getElementById("answer").innerText = "🤖 답변을 생성 중입니다...";

    const gptAnswer = await askGPT(userSpeech);
    document.getElementById("answer").innerText = "🤖 답변: " + gptAnswer;

    // ✅ 답변 듣기 버튼 보여주기
    const playButton = document.getElementById("play-answer");
    playButton.style.display = "inline-block";
    playButton.onclick = function () {
      speak(gptAnswer);
    };
  };

  // 🎤 마이크 종료 시 처리
  recognition.onend = function () {
    if (!document.getElementById("question").innerText.includes("🙋 질문:")) {
      document.getElementById("question").innerText = "🛑 마이크가 꺼졌어요.";
    }
  };

  // 🎤 오류 발생 시 알림
  recognition.onerror = function (event) {
    document.getElementById("question").innerText = "⚠️ 오류 발생: " + event.error;
  };
}

async function askGPT(question) {
  console.log("질문 전달:", question);

  const response = await fetch("https://gpt-proxy-fawn.vercel.app/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: question }]
    })
  });

  const data = await response.json();
  console.log("GPT 응답 데이터:", data);

  return data.choices?.[0]?.message?.content || "죄송해요. 답변을 가져오지 못했어요.";
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  speechSynthesis.speak(utterance);
}

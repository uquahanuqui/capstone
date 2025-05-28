// 브라우저 음성 인식 → GPT 프록시 서버 호출 → TTS 응답

function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "ko-KR";
  recognition.start();

  recognition.onresult = async function (event) {
    const userSpeech = event.results[0][0].transcript;
    document.getElementById("question").innerText = "🙋 질문: " + userSpeech;

    const gptAnswer = await askGPT(userSpeech);
    document.getElementById("answer").innerText = "🤖 답변: " + gptAnswer;

    speak(gptAnswer);
  };
}

async function askGPT(question) {
  console.log("질문 전달:", question); // 🔍 로그 확인용

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
  console.log("GPT 응답 데이터:", data); // 🔍 응답 확인용

  return data.choices?.[0]?.message?.content || "죄송해요. 답변을 가져오지 못했어요.";
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  speechSynthesis.speak(utterance);
}

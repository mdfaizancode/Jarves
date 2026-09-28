import "dotenv/config";

const GoogleAiApi = async(message) =>{
    
  const options = {
    method: "POST",
    headers: {  
      "Content-Type": "application/json",
      "x-goog-api-key": `${process.env.GEMINI_API_KEY}`
    },
    body: JSON.stringify({
      model:    "gemini-3.6-flash", //"gemini-3.5-flash-lite",
      input: message,
    })
  };

try {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", options);
  const data = await response.json();

  // Pehle dekho API ne asal me kya bheja
  if (!response.ok) {
    console.log("Gemini error:", JSON.stringify(data, null, 2));
    throw new Error(data.error?.message || "Gemini API failed");
  }

  const modelStep = data.steps?.find(step => step.type === "model_output");
  const replyText = modelStep?.content?.[0]?.text;

  console.log(replyText);
  return replyText;
} catch (err) {
  console.log(err);
  throw err;
}
};

export default GoogleAiApi;
// import "dotenv/config";

// const GoogleAiApi = async (message) => {
//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "x-goog-api-key": process.env.GEMINI_API_KEY,
//     },
//     body: JSON.stringify({
//       model: "gemini-3.5-flash-lite",
//       input: message,
//       tools: [{ type: "google_search" }], // live web search ON
//     }),
//   };

//   try {
//     const response = await fetch(
//       "https://generativelanguage.googleapis.com/v1beta/interactions",
//       options
//     );
//     const data = await response.json();

//     if (!response.ok) {
//       console.log("Gemini error:", JSON.stringify(data, null, 2));
//       throw new Error(data.error?.message || "Gemini API failed");
//     }

//     // Search ke saath multiple steps aate hain, isliye saare model_output ka text jodo
//     const replyText = data.steps
//       ?.filter((step) => step.type === "model_output")
//       .flatMap((step) => step.content || [])
//       .filter((c) => c.type === "text")
//       .map((c) => c.text)
//       .join("\n");

//     console.log(replyText);
//     return replyText;
//   } catch (err) {
//     console.log(err);
//     throw err;
//   }
// };

// export default GoogleAiApi;











//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


import "dotenv/config";

const GoogleAiApi = async(message, signal) =>{
    
  const options = {
    method: "POST",
    signal,
    headers: {  
      "Content-Type": "application/json",
      "x-goog-api-key": `${process.env.GEMINI_API_KEY}`
    },
    body: JSON.stringify({
      model:    "gemini-3.6-flash", //"gemini-3.5-flash-lite",
      input: message,
      system_instruction: "For current or time-sensitive questions, use Google Search and cite sources when available.",
      tools: [{ type: "google_search" }],
    })
  };

try {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", options);
  const data = await response.json();

  // Pehle dekho API ne asal me kya bheja
  if (!response.ok) {
    console.log("Gemini error:", JSON.stringify(data, null, 2));
    const error = new Error(data.error?.message || "Gemini API failed");
    error.status = response.status;
    error.code = data.error?.code;
    throw error;
  }

  const outputBlocks = data.steps
    ?.filter(step => step.type === "model_output")
    .flatMap(step => step.content || [])
    .filter(block => block.type === "text") || [];
  const replyText = outputBlocks
    .map(block => block.text)
    .filter(Boolean)
    .join("\n")
    .trim();

  const sources = [...new Map(
    outputBlocks
      .flatMap(block => block.annotations || [])
      .filter(annotation => annotation.type === "url_citation" && /^https?:\/\//i.test(annotation.url || ""))
      .map(annotation => [annotation.url, annotation])
  ).values()];
  const sourceList = sources.length
    ? `\n\nSources:\n${sources.map((source, index) => {
      const url = source.url.replace(/[()]/g, "\\$&");
      const label = (source.title || new URL(source.url).hostname).replace(/[\\[\\]]/g, "\\$&");
      return `- [${label}](${url})`;
    }).join("\n")}`
    : "";

  const responseText = `${replyText}${sourceList}`.trim();
  console.log(responseText);
  return responseText;
} catch (err) {
  if (signal?.aborted) throw err;
  console.log(err);
  throw err;
}
};

export default GoogleAiApi;
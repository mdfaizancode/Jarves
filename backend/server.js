import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import dns from "dns";
import chatRouter from "./routes/Chat.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const PORT = 'https://jarves6-o.onrender.com';

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  connectDB();
});

app.use("/api", chatRouter);


const connectDB = async()=>{
  try{
   await mongoose.connect(process.env.MONGO_URL);
   console.log("Database connected Successfully");

  }catch (err){
    console.log("This is error -> ", err);
  }
}

// app.post("/test", async (req, res) => {
//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "x-goog-api-key": `${process.env.GEMINI_API_KEY}`
//     },
//     body: JSON.stringify({
//       model: "gemini-3.6-flash",
//       input: message,
//     })
//   };

//   try {
//     const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions",options );
//     const data = await response.json();
//     console.log(data.steps[1].content[0].text);
//     res.send(data.steps[1].content[0].text);
//   } catch (err) {
//     console.log(err);
//     res.status(500).send(err);
//   }
// });

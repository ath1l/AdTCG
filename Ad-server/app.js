const express = require('express');
const app = express();
const path = require('path');
const fs = require("fs");
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');
const mongoose = require('mongoose');
const Ad = require('./models/Ad');

// Ensure .env is loaded
dotenv.config();

mongoose.connect('mongodb://localhost:27017/adDB')
.then(() => {
    console.log("Mongo Connection open")
})
.catch(err=>{
    console.log("Mongo Error bhaayi")
    console.log(err)
});

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.set('views', path.join(__dirname, 'views'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: "10mb" }));

app.get('/', async (req, res) => {
  const allAds = await Ad.find({});

   // Count each rarity type
  const rarityCounts = {
    common: await Ad.countDocuments({ rarity: 'common' }),
    rare: await Ad.countDocuments({ rarity: 'rare' }),
    epic: await Ad.countDocuments({ rarity: 'epic' }),
    legendary: await Ad.countDocuments({ rarity: 'legendary' }),
    mythic: await Ad.countDocuments({ rarity: 'mythic' }),
  };

  res.render('index',{ads:allAds , rarityCounts });
});

app.post("/upload", async (req, res) => {
  console.log("POST request received");
  const { image } = req.body;

  if (!image) {
    console.warn("⚠️ No image field in body");
    return res.status(400).send("No image received");
  }

  const buffer = Buffer.from(image, "base64");
  const filename = `yt-ad-${Date.now()}.png`;
  const filepath = path.join(__dirname, "uploads", filename);

  fs.writeFile(filepath, buffer, async (err) => {
    if (err) {
      console.error("Error saving image:", err);
      return res.status(500).send("Failed to save image");
    }

    console.log("Image saved:", filename);

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_API_KEY,
      });

      const base64ImageFile = fs.readFileSync(filepath, {
        encoding: "base64",
      });

      const contents = [
        {
          inlineData: {
            mimeType: "image/png",
            data: base64ImageFile,
          },
        },
        { text:   `This is a YouTube ad. Generate a JSON object with the following structure: dont always give common ,give legendarymnythic and epic in ever 1 in 8 th request
                {
                  "title": "a short, creative and goofy title for the ad",
                  "description": "a 1-2 line summary of the ad",
                  "rarity": "one of ['common', 'rare', 'epic', 'legendary', 'mythic']"
                }
                Only return the JSON. No explanation.`},
        ];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
      });

       // Extract the JSON string from the response
      let jsonString = response.text;
       console.log("AI-generated JSON string:", jsonString);

       // Clean the string by removing the markdown code fences
      jsonString = jsonString.replace(/```json\n|```/g, '').trim();

       // Parse the JSON string into a JavaScript object
       const parsedData = JSON.parse(jsonString);

       // Store the values in separate variables
       const { title, description, rarity } = parsedData;

      

       // Log the variables to confirm they are stored correctly
       console.log("Title:", title);
       console.log("Description:", description);
       console.log("Rarity:", rarity);
       //filename

       const newAd = new Ad({
        title: title,
        description: description,
        rarity: rarity,
        filename: filename,
      });

      await newAd.save();
      console.log("Ad data saved to MongoDB successfully!");
      
      res.json({ message: "Image saved", filename, caption: response.text });
    } catch (err) {
      console.error("Gemini API error or DB saving error:", err);
      res.status(500).send("Failed to caption image");
    }
  });
});

app.listen(3000, () => {
  console.log("Listening on port 3000!");
});



const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = 4000;
app.use(
  cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization', 'x-gemini-key'],
  })
);
const mongoose = require('mongoose');

app.use(express.static('public'));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aiarch').then(() => {
  console.log("Connected to MongoDB");
}).catch(err => {
  console.warn("MongoDB connection failed:", err.message);
});

const ProjectSchema = new mongoose.Schema({
  name: { type: String, default: 'Untitled Project' },
  promptHistory: [String],
  coordinates: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Project = mongoose.model('Project', ProjectSchema);

app.get('/', (req, res) => {
  res.send('AI Arch API is running...');
});

app.post('/projects', async (req, res) => {
  try {
    const { name } = req.body;
    const project = new Project({ name: name || 'New Project', coordinates: {}, promptHistory: [] });
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/generate', async (req, res) => { 
  const geminiApiKeyHeader = req.headers['x-gemini-key'];
  if (!geminiApiKeyHeader) {
    return res.status(401).send('Gemini API Key missing from headers. Please set it in Profile Preferences.');
  }

  const { prompt, projectId, history } = req.body;
  if (!prompt) return res.status(400).send('Prompt is required');

  const googleAI = new GoogleGenerativeAI(geminiApiKeyHeader);
  const geminiModel = googleAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const systemInstructions = `You are an AI architect converting natural language into a JSON layout for a 10m x 10m room.
Available items: Bed, Chair, Table, TV, Sofa, Plant, Shelf, Window, Door, Desk, Lamp, Rug, Console.
Output format MUST be a valid JSON object mapping item name/ID to an [x, y] array, where x and y are integers between 1 and 10.
For example: {"Bed_1": [2, 3], "TV_1": [2, 7], "Chair_1": [5, 5], "Plant_1": [1, 9]}.
Do not output markdown code blocks. Output ONLY the raw JSON object.
Consider realistic placements (e.g., chairs near tables, TV across from beds/sofas).
If there is a history, modify the existing layout according to the new prompt.`;

  let fullPrompt = `${systemInstructions}\n\n`;
  if (history && history.length > 0) {
    fullPrompt += `History of prompts:\n${history.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n\n`;
  }
  fullPrompt += `Current Request: ${prompt}\n\nPlease provide ONLY the raw JSON mapping.`;

  try {
    const result = await geminiModel.generateContent(fullPrompt);
    let tosend = result.response.text().trim();
    // Strip markdown code blocks if gemini included them
    if (tosend.startsWith('\`\`\`')) {
      tosend = tosend.replace(/^\`\`\`(json)?/, '').replace(/\`\`\`$/, '').trim();
    }
    
    let coordinates = {};
    try {
      coordinates = JSON.parse(tosend);
    } catch (parseError) {
      console.error("JSON Parsing failed:", tosend);
      return res.status(500).json({ error: "AI produced invalid JSON output", raw: tosend });
    }

    // If it's a known project, update it
    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        project.coordinates = coordinates;
        project.promptHistory.push(prompt);
        project.updatedAt = Date.now();
        await project.save();
      }
    }

    res.json({ coordinates, projectId });
  } catch (err) {
    console.error("AI Generation Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/verify-key', async (req, res) => {
  const key = req.headers['x-gemini-key'];
  if(!key) return res.status(401).json({ valid: false, error: "No key provided" });
  try {
     const googleAI = new GoogleGenerativeAI(key);
     // Use gemini-2.5-flash for faster/more reliable verification instead of gemini-pro (which could be deprecated depending on API version)
     const model = googleAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
     await model.generateContent("test");
     return res.json({ valid: true });
  } catch(e) {
     console.error("Key Verification Error:", e);
     return res.status(401).json({ valid: false, error: e.message });
  }
});

app.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

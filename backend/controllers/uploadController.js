const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const config = require('../config');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { parseBankStatement } = require('../utils/statementMapper');
const { User } = require('../models/models');

const fs = require('fs');
const path = require('path');

const debugLog = (msg) => {
  try {
    const logPath = 'c:\\Users\\ganes\\Downloads\\perFin-main_final\\perfin-main\\backend\\debug.log';
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
  } catch (err) {
    // Silence logger errors to prevent core logic failure
  }
};

const cleanJSON = (text) => {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch (err) {
    debugLog(`JSON Parse failed for: ${text.substring(0, 100)}...`);
    return null;
  }
};

// Multer with memory storage to populate req.file.buffer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /xlsx?|pdf|jpe?g|png/;
    if (allowedTypes.test(file.mimetype) || file.originalname.match(/\.(xlsx|xls|pdf|jpg|jpeg|png)$/i)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Invalid file type'), false);
    }
  }
});

const getGeminiClient = () => {
  if (!config.gemini.apiKey) {
    throw new ApiError(500, "Gemini API Key not configured");
  }
  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
};

const extractWithGroq = async (text) => {
  if (!config.groq.apiKey) return null;
  const groq = new Groq({ apiKey: config.groq.apiKey });

  const prompt = `Analyze financial document text and extract to JSON matching this exact nested schema: 
  {
    "name": "",
    "metrics": {
      "avg_monthly_income": 0,
      "current_savings": 0,
      "total_deductions": 0
    },
    "expenses": {
      "housing": 0,
      "food": 0,
      "transport": 0,
      "utilities": 0,
      "entertainment": 0,
      "others": 0,
      "investments": {
        "stocks": 0,
        "mutual_funds": 0,
        "crypto": 0,
        "provident_fund": 0
      }
    }
  }
  Output ONLY raw JSON. Use 0 for missing. TEXT: ${text}`;

  try {
    debugLog(`Groq extraction started for text length: ${text.length}`);
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });
    const resultText = chatCompletion.choices[0].message.content.trim();
    const data = cleanJSON(resultText);
    if (!data) debugLog("Groq failed to return valid JSON");
    return data;
  } catch (error) {
    debugLog(`Groq Error: ${error.message}`);
    return null;
  }
};

const uploadFile = catchAsync(async (req, res) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "No file uploaded");
    }

    const filename = req.file.originalname.toLowerCase();
    debugLog(`Upload request received: ${filename}`);

    // Excel Bank Statement (primary path)
    if (filename.match(/\.(xlsx|xls)$/i) || req.file.mimetype.includes('spreadsheet')) {
      const extractedData = await parseBankStatement(req.file.buffer);

      // Fix: Update matching model schema paths (nested objects)
      if (req.user && req.user.id) {
        await User.findByIdAndUpdate(req.user.id, {
          $inc: {
            'income.monthly_income': extractedData.metrics.avg_monthly_income || 0,
            'expenses.housing': extractedData.expenses.housing || 0,
            'expenses.food': extractedData.expenses.food || 0,
            'expenses.transport': extractedData.expenses.transport || 0,
            'expenses.utilities': extractedData.expenses.utilities || 0,
            'expenses.entertainment': extractedData.expenses.entertainment || 0,
            'expenses.other': extractedData.expenses.others || 0,
            'assets.stocks': extractedData.expenses.investments?.stocks || 0,
            'assets.mutual_funds': extractedData.expenses.investments?.mutual_funds || 0,
            'assets.crypto': extractedData.expenses.investments?.crypto || 0,
            'assets.provident_fund': extractedData.expenses.investments?.provident_fund || 0,
          },
          $set: {
            'assets.savings': extractedData.metrics.current_savings || 0,
            updated_at: new Date()
          }
        });
      }

      return res.json(extractedData);
    }

    // PDF/Image - Text extraction + AI
    let extractedData = null;

    if (filename.endsWith('.pdf')) {
      try {
        const pdfData = await pdf(req.file.buffer);
        if (pdfData.text && pdfData.text.trim().length > 50) {
          extractedData = await extractWithGroq(pdfData.text);
          if (extractedData) return res.json(extractedData);
        }
      } catch (err) {
        debugLog(`PDF Parse fallback triggered: ${err.message}`);
      }
    }

    debugLog(`Gemini Vision path for file: ${filename} (${req.file.mimetype})`);
    const model = getGeminiClient();
    const prompt = `Extract financial profile to raw JSON matching this exact nested schema: 
    {
      "name": "",
      "metrics": {
        "avg_monthly_income": 0,
        "current_savings": 0,
        "total_deductions": 0
      },
      "expenses": {
        "housing": 0,
        "food": 0,
        "transport": 0,
        "utilities": 0,
        "entertainment": 0,
        "others": 0,
        "investments": {
          "stocks": 0,
          "mutual_funds": 0,
          "crypto": 0,
          "provident_fund": 0
        }
      }
    }
    Use 0 for missing.`;

    const result = await model.generateContent([
      { inlineData: { data: req.file.buffer.toString('base64'), mimeType: req.file.mimetype } },
      { text: prompt }
    ]);

    const resultText = result.response.text().trim();
    const data = cleanJSON(resultText);
    if (!data) {
      debugLog("Gemini failed to return valid JSON");
      throw new Error("Invalid format from AI");
    }
    debugLog("Gemini extraction successful");
    return res.json(data);
  } catch (err) {
    debugLog(`CRITICAL UPLOAD ERROR: ${err.message}`);
    throw new ApiError(500, `Upload Error: ${err.message}`);
  }
});

module.exports = {
  uploadFile,
  uploadMiddleware: upload.single('file')
};


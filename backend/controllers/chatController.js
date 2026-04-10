const { ChatHistory } = require('../models/models');
const { getChatResponse } = require('../utils/aiAdvisor');
const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');

const sendMessage = catchAsync(async (req, res) => {
  const { message, profile, conversation_id } = req.body;
  const user_id = req.user.id;

  // 1. Identify or create conversation
  let activeConvId = conversation_id || crypto.randomUUID();
  let isNew = !conversation_id;

  // 2. Fetch history for this conversation (limit to last 10 for AI context)
  const historyRecords = await ChatHistory.find({ conversation_id: activeConvId })
    .sort({ timestamp: 1 })
    .limit(10);

  const history = historyRecords.map(h => ({
    user: h.user_message,
    ai: h.ai_response
  }));

  // 3. Get AI Response with memory
  const aiResponse = await getChatResponse(message, profile, history);

  // 4. Determine Title (use first message if new)
  let title = "New Chat";
  if (isNew) {
    title = message.length > 30 ? message.substring(0, 30) + "..." : message;
  } else {
    const firstMsg = await ChatHistory.findOne({ conversation_id: activeConvId }).sort({ timestamp: 1 });
    if (firstMsg) title = firstMsg.title;
  }

  // 5. Save message
  const chatDoc = new ChatHistory({
    user_id,
    conversation_id: activeConvId,
    title,
    user_message: message,
    ai_response: aiResponse,
  });

  await chatDoc.save();

  res.json({ 
    response: aiResponse, 
    conversation_id: activeConvId,
    title 
  });
});

const getConversations = catchAsync(async (req, res) => {
  const user_id = req.user.id;
  
  // Group by conversation_id to get the list of unique threads
  // Note: For simple scale, we use aggregate.
  const threads = await ChatHistory.aggregate([
    { $match: { user_id } },
    { $sort: { timestamp: -1 } },
    { $group: {
        _id: "$conversation_id",
        title: { $first: "$title" },
        last_message: { $first: "$user_message" },
        updated_at: { $first: "$timestamp" }
    }},
    { $sort: { updated_at: -1 } },
    { $limit: 5 } // Only show last 5 as requested
  ]);

  res.json(threads);
});

const getThreadMessages = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const messages = await ChatHistory.find({ conversation_id: id, user_id })
    .sort({ timestamp: 1 });

  res.json(messages);
});

const deleteConversation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  await ChatHistory.deleteMany({ conversation_id: id, user_id });

  res.json({ message: "Conversation deleted successfully" });
});

module.exports = {
  sendMessage,
  getConversations,
  getThreadMessages,
  deleteConversation
};

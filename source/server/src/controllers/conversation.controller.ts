import { Request, Response } from 'express';
import * as ConversationService from '../services/conversation.service';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { ConversationLog } from '../types/entities';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const getConversations = async (req: Request, res: Response) => {
  try {
    const history_uuid = req.params.history_uuid;
    const data: ConversationLog[] = await ConversationService.fetchConversations(history_uuid);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const saveConversation = async (req: Request, res: Response) => {
  try {
    const log: ConversationLog = {
      uuid: uuidv4(),
      number_sentence: req.body.number_sentence,
      sentences: req.body.sentences,
      history_uuid: req.body.history_uuid,
      created_at: new Date(),
      role: 'user',
    };
    // Save user message
    await ConversationService.createConversation(log);
    // Request OpenAI with JSON response instruction
    const prompt = `Answer the question below, and then return 3 follow-up question suggestions to continue the conversation.\nFormat your response as a JSON object with two fields: \"answer\" and \"suggestions\".\n\nExample:\n{\n  \"answer\": \"Sure, here is the explanation...\",\n  \"suggestions\": [\"Can you give me an example?\", \"How does this apply in real life?\", \"What are the benefits?\"]\n}\n\nQuestion: ${log.sentences}`;
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    const aiRawResponse = chatCompletion.choices[0].message.content || '';
    let aiAnswer = '';
    let suggestions: string[] = [];
    try {
      const parsed = JSON.parse(aiRawResponse);
      aiAnswer = parsed.answer || '';
      suggestions = parsed.suggestions || [];
    } catch (err) {
      console.error('Failed to parse AI JSON:', err);
      aiAnswer = aiRawResponse;
      suggestions = [];
    }
    // Save bot reply
    const botLog: ConversationLog = {
      uuid: uuidv4(),
      number_sentence: log.number_sentence,
      sentences: aiAnswer,
      history_uuid: log.history_uuid,
      created_at: new Date(),
      role: 'system',
    };
    await ConversationService.createConversation(botLog);
    res.json({
      success: true,
      message: aiAnswer,
      suggestions,
      userMessage: log,
    });
  } catch (err) {
    console.error('conversation/save', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const translate = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `Translate the following English text to Vietnamese: "${text}"`
        }
      ],
      model: 'gpt-3.5-turbo'
    });
    const translationText = chatCompletion.choices[0].message.content;
    res.json({ success: true, translatedText: translationText });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}; 
export const textToSpeech = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text content is required for TTS.' });
    }

    const speechFile = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
      response_format: "mp3",
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');

    const buffer = Buffer.from(await speechFile.arrayBuffer());
    res.send(buffer);

  } catch (error) {
    console.error("Error in /api/conversation/text-to-speech:", error);
    res.status(500).json({ success: false, error: 'Failed to generate speech from text.' });
  }
};

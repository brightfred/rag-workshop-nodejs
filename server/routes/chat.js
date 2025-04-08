// Chat completions endpoint
const express = require('express');
const axios = require('axios');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load the hardcoded knowledge base
const knowledgeBase = require('../data/knowledgeBase');

// Use the knowledgeBase directly for now to simplify debugging
const database = knowledgeBase;

router.post('/', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                error: "Query is required"
            });
        }
        
        // Search the database
        const searchResult = database.find(item =>
            item.question.toLowerCase().includes(query.toLowerCase())
        );
        
        // Build prompt with context if available
        let ragPrompt = query;
        if (searchResult) {
            ragPrompt = `
Context information:
Question: ${searchResult.question}
Answer: ${searchResult.answer}

Based on the above context, please answer this question: ${query}
`;
        }
        
        try {
            // Check if API key exists
            if (!process.env.OPENAI_API_KEY) {
                console.warn("Missing OpenAI API key, using fallback");
                
                if (searchResult) {
                    return res.json({
                        success: true,
                        answer: `From our knowledge base: ${searchResult.answer}`,
                        source: searchResult.question,
                        isFromFallback: true
                    });
                } else {
                    return res.status(500).json({
                        success: false,
                        error: "No API key and no matching answer in knowledge base"
                    });
                }
            }
            
            // Send to OpenAI
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant.' },
                        { role: 'user', content: ragPrompt }
                    ],
                    temperature: 0.7,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );
            
            return res.json({
                success: true,
                answer: response.data.choices[0].message.content,
                source: searchResult ? searchResult.question : null,
                usage: response.data.usage
            });
        } catch (apiError) {
            // Log the actual error
            console.error('OpenAI API Error:', apiError.message);
            
            // Fallback to database answer if OpenAI fails
            if (searchResult) {
                return res.json({
                    success: true,
                    answer: `From our knowledge base: ${searchResult.answer}`,
                    source: searchResult.question,
                    isFromFallback: true
                });
            } else {
                return res.status(500).json({
                    success: false,
                    error: "API error and no matching answer found in knowledge base"
                });
            }
        }
    } catch (error) {
        console.error('General error:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
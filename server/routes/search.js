// TODO: Extract query from request
// TODO: Search knowledgeBase for a match
// TODO: Return result or 404
/**
 * Route: POST /api/search
 * - Accepts a query string
 * - Searches knowledgeBase for a matching question
 * - Returns the matching item or a message if not found
 */

const express = require('express');
const router = express.Router();
const knowledgeBase = require('../data/knowledgeBase');

// POST endpoint to search the knowledge base
router.post('/', (req, res) => {
  const query = req.body.query?.toLowerCase();

  if (!query) {
    return res.status(400).json({ error: "Query is required." });
  }

  // Find first match in the knowledge base
  const result = knowledgeBase.find(item =>
    item.question.toLowerCase().includes(query)
  );

  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ message: "No matching result found." });
  }
});

module.exports = router;
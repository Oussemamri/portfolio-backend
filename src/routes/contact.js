const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/contact');

const router = express.Router();

// Submit contact form
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').notEmpty().withMessage('Message is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, message } = req.body;
      const contact = new Contact({
        name,
        email,
        message
      });

      await contact.save();
      res.status(201).json({ message: 'Message sent successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
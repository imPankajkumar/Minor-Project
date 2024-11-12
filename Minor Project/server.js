const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware to parse JSON and URL-encoded form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// 1. Nodemailer Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // Your email
        pass: 'your-app-password',    // App password (not your regular password)
    },
});

// 2. Route to Handle Form Submission and Send Email
app.post('/submit', (req, res) => {
    const { name, email, message } = req.body;

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: 'your-email@gmail.com', // The recipient email (can be the same as sender)
        subject: 'New Contact Form Submission',
        text: `You have a new contact form submission:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).send('Error sending message.');
        } else {
            console.log('Email sent:', info.response);
            res.status(200).send('Thank you for submitting the form!');
        }
    });
});

// 3. Route to Fetch Testimonials
app.get('/testimonials', (req, res) => {
    fs.readFile('testimonials.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading testimonials.');
        }
        res.send(JSON.parse(data));
    });
});

// 4. Route to Add a New Testimonial
app.post('/testimonials', (req, res) => {
    const { name, message } = req.body;
    if (!name || !message) {
        return res.status(400).send('Name and message are required.');
    }

    // Read the current testimonials
    fs.readFile('testimonials.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading testimonials.');
        }
        const testimonials = JSON.parse(data);
        const newTestimonial = { name, message, date: new Date().toISOString() };
        testimonials.push(newTestimonial);

        // Write the updated testimonials to the file
        fs.writeFile('testimonials.json', JSON.stringify(testimonials), (err) => {
            if (err) {
                return res.status(500).send('Error saving testimonial.');
            }
            res.status(201).send(newTestimonial);
        });
    });
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

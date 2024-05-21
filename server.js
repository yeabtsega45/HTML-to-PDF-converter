const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const cors = require("cors"); // Import the cors package
import { Router } from "itty-router";

const app = express();
const port = 3001;
const router = Router();

app.use(cors()); // Use the CORS middleware
app.use(bodyParser.json({ limit: "10mb" })); // Increase limit for large HTML content

router.post("/export/pdf", async (req, res) => {
  const { html } = req.body;

  if (!html) {
    return res.status(400).send("HTML content is required");
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({ format: "A4" });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=exported.pdf",
    });

    res.send(pdf);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

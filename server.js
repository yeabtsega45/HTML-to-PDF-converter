const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const cors = require("cors"); // Import the cors package
require("dotenv").config();

const app = express();
const port = 3001;

app.use(cors()); // Use the CORS middleware
app.use(bodyParser.json({ limit: "10mb" })); // Increase limit for large HTML content

app.post("/export/pdf", async (req, res) => {
  const { html } = req.body;

  if (!html) {
    return res.status(400).send("HTML content is required");
  }

  try {
    const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

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

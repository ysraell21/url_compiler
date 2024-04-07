const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs-extra");
const csv = require("csv-parser");
const path = require("path");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const app = express();
const port = 1747;

app.use(bodyParser.json());
app.use(express.static(".")); // Serve your static files
app.get("/favicon.ico", (req, res) => res.status(204));
// Function to append data to a CSV file or create a new one if it doesn't exist
async function appendDataToCsv(fileName, records) {
  const filePath = `./generated_csv/${fileName}.csv`;
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: "local_id", title: "Local ID" },
      { id: "campaign_name", title: "Campaign Name" },
      { id: "content_type", title: "Content Type" },
      { id: "asset_id", title: "Asset ID" },
      { id: "catalog_id", title: "Catalog ID" },
      { id: "stg_url", title: "Stg URL" },
      { id: "year", title: "Year" },
    ],
    append: await fs.pathExists(filePath), // Append if file exists
  });

  await csvWriter.writeRecords(records);
}
app.get("/favicon.ico", (req, res) => res.status(204));

// CRUD Operation: Create/Update
app.post("/api/data", async (req, res) => {
  const data = req.body;
  const fileName = data.campaign_name.replace(/ /g, "_"); // Replace spaces with underscores for filename

  try {
    await appendDataToCsv(fileName, [data]);
    res.status(200).send("Data successfully saved to CSV.");
  } catch (error) {
    console.error("Failed to save data to CSV:", error);
    res.status(500).send("Failed to save data.");
  }
});

// Endpoint to fetch available years
app.get("/api/years", async (req, res) => {
  const csvFolder = path.join(__dirname, "generated_csv");
  const years = new Set(); // Using a Set to automatically handle unique years

  try {
    const files = await fs.promises.readdir(csvFolder);

    for (const file of files) {
      const filePath = path.join(csvFolder, file);
      const fileContent = await fs.promises.readFile(filePath, "utf-8");

      // Split the file content into lines and skip the header line
      const lines = fileContent.trim().split(/\r?\n/).slice(1);

      for (const line of lines) {
        const [localId, campaignName, contentType, assetId, catalogId, stgUrl, year] = line.split(",");
        if (year) {
          years.add(year.trim()); // Add the year to the set
        }
      }
    }

    res.json([...years]);
  } catch (error) {
    console.error("Error reading CSV files:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to fetch available campaign names
app.get("/api/campaigns", (req, res) => {
  const csvFolder = path.join(__dirname, "generated_csv");

  fs.readdir(csvFolder, (err, files) => {
    if (err) {
      console.error("Error reading CSV folder:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    // Extract campaign names from filenames (remove .csv extension)
    const campaigns = files.map((file) => {
      return file.replace(".csv", "");
    });

    res.json(campaigns);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

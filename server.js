const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const twilio = require("twilio");

// Configure middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Configure Twilio API credentials
const twilioAccountSid = "ACf3aef78b0d27d078f6316a421e4e5ec6";
const twilioAuthToken = "ef979d9bcc3fbc5833a8e94a1838af07";
const twilioPhoneNumber = "+18444598674";
const twilioClient = require("twilio")(twilioAccountSid, twilioAuthToken);

// Define route for JotForm form submission
app.post("/jotform-submission", upload.single("input_8"), async (req, res) => {
  // Check if the file was received
  if (!req.file) {
    return res.status(400).json({ error: "Voicemail file is missing" });
  }

  // Extract form data from JotForm submission
  const customerAreaCode = req.body["input_9_area"];
  const customerPhoneNumber = req.body["input_9_phone"];
  const areaCode = req.body["input_5_area"];
  const phoneNumber = req.body["input_5_phone"];
  const voicemailUrl = req.body["input_8"]; // Voicemail URL from the webhook data

  // Create a Date object from the extracted date and time
  const rvmDate = `${req.body["month_7"]}/${req.body["day_7"]}/${req.body["year_7"]}`;
  const rvmTime = `${req.body["hour_7"]}:${req.body["min_7"]} ${req.body["ampm_7"]}`;
  const scheduledDateTime = new Date(`${rvmDate} ${rvmTime}`);

  const payload = {
    machineDetection: "DetectMessageEnd",
    from: twilioPhoneNumber,
    to: `+1${areaCode}${phoneNumber}`,
    method: "GET",
    statusCallback: "https://twilio2-ydey.onrender.com/twilio-callback",
    statusCallbackEvent: ["completed", "answered", "failed"],
    mediaUrl: [voicemailUrl],
    startTime: scheduledDateTime.toISOString(),
  };

  const quantity1RVMCalls = parseInt(req.body["input_17_1000"]);
  await sendRVM(payload, quantity1RVMCalls);

  // Handle other quantities if needed

  res.status(200).json({ message: "RVM scheduled successfully" });
});

// Function to send an RVM using Twilio (voicemail)
async function sendRVM(payload, quantity) {
  for (let i = 0; i < quantity; i++) {
    try {
      const response = await twilioClient.messages.create(payload);
      console.log("RVM scheduled successfully:", response.sid);
    } catch (error) {
      console.error("Failed to schedule RVM:", error);
      throw error;
    }
  }
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

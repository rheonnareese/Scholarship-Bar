const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const os = require("os"); // os module add karein

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// VERCEL FIX: Writable directory sirf "/tmp" hoti hai
const uploadDir = os.tmpdir(); 

// Multer configuration ko update karein
const upload = multer({ dest: uploadDir });

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

app.post("/send-email", upload.single("Resume"), async (req, res) => {
  let file = req.file;

  try {
    const data = req.body;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "rheonna.reese@gmail.com",
        pass: "zccf xqev gwlj sffv"
      }
    });

    // ... (Aapka formatted emailHtml yahan rahega)
      const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #16202e; max-width: 600px; margin: auto; border: 1px solid #e3ddd2; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f2747; padding: 24px; text-align: center; border-bottom: 4px solid #b08328;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 1px;">Convention Access Scholarship</h1>
          <p style="color: #caa23f; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; font-weight: bold;">New Application Received</p>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <!-- Section 1 -->
          <h3 style="color: #0f2747; border-bottom: 1px solid #e3ddd2; padding-bottom: 8px; margin-top: 0;">1. Applicant Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 40%;">Full Legal Name:</td><td style="padding: 8px 0;">${escapeHtml(data["Full legal name"])}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Preferred Name:</td><td style="padding: 8px 0;">${escapeHtml(data["Preferred name"] || "N/A")}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${data["Email"]}" style="color: #b08328; text-decoration: none;">${escapeHtml(data["Email"])}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td style="padding: 8px 0;">${escapeHtml(data["Phone"])}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Location:</td><td style="padding: 8px 0;">${escapeHtml(data["City, State"])}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Law School:</td><td style="padding: 8px 0;">${escapeHtml(data["Law school"])}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Graduation Date:</td><td style="padding: 8px 0;">${escapeHtml(data["Graduation (Mo/Yr)"])}</td></tr>
          </table>

          <!-- Section 2 -->
          <h3 style="color: #0f2747; border-bottom: 1px solid #e3ddd2; padding-bottom: 8px;">2. Commitments & Status</h3>
          <p style="background-color: #f6f4ef; padding: 12px; border-radius: 6px; border-left: 4px solid #b08328;">
            <b>Confirmed Status:</b> ${escapeHtml(data["commitments"] || "All 5 confirmed")}
          </p>

          <!-- Section 3 -->
          <h3 style="color: #0f2747; border-bottom: 1px solid #e3ddd2; padding-bottom: 8px;">3. Statement of Interest</h3>
          <div style="background-color: #fafafa; padding: 15px; border-radius: 6px; font-style: italic; margin-bottom: 20px; white-space: pre-line;">
            ${escapeHtml(data["Statement of interest"])}
          </div>

          <h3 style="color: #0f2747; border-bottom: 1px solid #e3ddd2; padding-bottom: 8px;">4. Leadership & Involvement</h3>
          <div style="background-color: #fafafa; padding: 15px; border-radius: 6px; font-style: italic; white-space: pre-line;">
            ${escapeHtml(data["Leadership & involvement"])}
          </div>

          <!-- Section 4 -->
          <h3 style="color: #0f2747; border-bottom: 1px solid #e3ddd2; padding-bottom: 8px; margin-top: 25px;">5. Additional Details</h3>
          <p><b>Roommate Names:</b> ${escapeHtml(data["Roommate names"] || "None Provided")}</p>
          <p><b>Special Considerations:</b> ${escapeHtml(data["Additional considerations"] || "None")}</p>

          <!-- Footer/Signature -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #0f2747; font-size: 13px;">
            <p style="margin: 0;"><b>Digitally Signed By:</b> ${escapeHtml(data["Signature"])}</p>
            <p style="margin: 4px 0 0 0;"><b>Date:</b> ${escapeHtml(data["Date signed"])}</p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Scholarship Application" <shahzadumar.it01@gmail.com>`,
       to: "lawstudents@nationalbar.org",
      subject: `Scholarship App: ${data["Full legal name"] || "New Applicant"}`,
      html: emailHtml,
      attachments: file ? [{ filename: file.originalname, path: file.path }] : []
    };

    await transporter.sendMail(mailOptions);

    // File delete karein /tmp se
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.json({ success: true, message: "Application sent successfully!" });
  } catch (error) {
    console.error("Email Error:", error);
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(500).json({ success: false, message: "Could not send application." });
  }
});

// Bar Exam Route Fix
const barExamUploads = upload.fields([
  { name: 'Resume', maxCount: 1 },
  { name: 'Transcript', maxCount: 1 },
  { name: 'Letter of recommendation', maxCount: 1 },
  { name: 'Photo', maxCount: 1 }
]);

app.post("/send-bar-exam-email", barExamUploads, async (req, res) => {
  try {
    const data = req.body;
    const files = req.files;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "rheonna.reese@gmail.com",
        pass: "zccf xqev gwlj sffv"
      }
    });

    const attachments = [];
    ['Resume', 'Transcript', 'Letter of recommendation', 'Photo'].forEach(fieldName => {
      if (files[fieldName]) {
        attachments.push({
          filename: files[fieldName][0].originalname,
          path: files[fieldName][0].path
        });
      }
    });

    // ... (Aapka formatted emailHtmlBarLaw yahan rahega)
       const emailHtmlBarLaw = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #16202e; max-width: 600px; margin: auto; border: 1px solid #e3ddd2; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #1c3a63; padding: 24px; text-align: center; border-bottom: 4px solid #caa23f;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 1px;">Bar Exam Scholarship Application</h1>
          <p style="color: #caa23f; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; font-weight: bold;">July 2026 Cycle</p>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <!-- Section 1 -->
          <h3 style="color: #0f2747; border-bottom: 1px solid #e3ddd2; padding-bottom: 8px; margin-top: 0;">1. Personal & Academic Profile</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 40%;">Full Legal Name:</td><td style="padding: 8px 0;">${escapeHtml(data["Full legal name"])}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${data["Email"]}" style="color: #b08328; text-decoration: none;">${escapeHtml(data["Email"])}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">City, State, ZIP:</td><td style="padding: 8px 0;">${escapeHtml(data["City, State, ZIP"])}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Law School:</td><td style="padding: 8px 0;">${escapeHtml(data["Law school"])}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Graduation Date:</td><td style="padding: 8px 0;">${escapeHtml(data["Graduation (Mo/Yr)"])}</td></tr>
          </table>

          <!-- Section 2 -->
          <h3 style="color: #0f2747; border-bottom: 1px solid #e3ddd2; padding-bottom: 8px;">2. Bar Exam Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 40%;">Jurisdiction:</td><td style="padding: 8px 0;">${escapeHtml(data["Bar exam jurisdiction"])}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Expected Date:</td><td style="padding: 8px 0;">${escapeHtml(data["Bar exam date"])}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">NBA LSD Member Since:</td><td style="padding: 8px 0;">${escapeHtml(data["NBA LSD member since"] || "Not provided")}</td></tr>
          </table>

          <!-- Section 3 -->
          <h3 style="color: #0f2747; border-bottom: 1px solid #e3ddd2; padding-bottom: 8px;">3. Financial Need Statement</h3>
          <div style="background-color: #fdfaf2; padding: 15px; border-radius: 6px; border: 1px solid #e6d49f; font-size: 14px; white-space: pre-line;">
            ${escapeHtml(data["Statement of financial need"])}
          </div>

          <h3 style="color: #0f2747; border-bottom: 1px solid #e3ddd2; padding-bottom: 8px; margin-top: 20px;">4. Personal Statement</h3>
          <div style="background-color: #fafafa; padding: 15px; border-radius: 6px; font-size: 14px; white-space: pre-line;">
            ${escapeHtml(data["Personal statement"])}
          </div>

          <!-- Section 4 -->
          <div style="margin-top: 25px; padding: 12px; background-color: #f6f4ef; border-radius: 6px;">
            <p style="margin: 0; font-size: 13px;"><b>Announcement Consent:</b> ${escapeHtml(data["Announcement consent"])}</p>
          </div>

          <!-- Signature -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #1c3a63; font-size: 13px;">
            <p style="margin: 0;"><b>Applicant Signature:</b> ${escapeHtml(data["Signature"])}</p>
            <p style="margin: 4px 0 0 0;"><b>Date Submitted:</b> ${escapeHtml(data["Date signed"])}</p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Bar Exam App" <rheonna.reese@gmail.com>`,
        to: "lawstudents@nationalbar.org",
      subject: `Bar Exam Scholarship: ${data["Full legal name"] || "New Applicant"}`,
      html: emailHtmlBarLaw,
      attachments: attachments
    };

    await transporter.sendMail(mailOptions);

    // Cleanup files from /tmp
    Object.values(files).forEach(fileArray => {
      fileArray.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    });

    res.json({ success: true, message: "Bar Exam application sent successfully!" });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ success: false, message: "Could not send Bar Exam application." });
  }
});


app.get("/NBA_LSD_Bar_Exam_Scholarship", (req, res) => {
  res.sendFile(path.join(__dirname, "bar.html"));
});

app.get("/LSD_NBA_Convention_Access_Scholarship", (req, res) => {
  res.sendFile(path.join(__dirname, "final.html"));
});


// 1. NBA LSD Scholarship Route
// Frontend mein submit() function isi endpoint ko hit karega

// Multer config: Resume aur Photo dono ke liye
const uploadFields = upload.fields([
  { name: 'Resume', maxCount: 1 },
  { name: 'Photo', maxCount: 1 }
]);

app.post("/send-nba-lsd", uploadFields, async (req, res) => {
  try {
    const data = req.body;
    const files = req.files;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "rheonna.reese@gmail.com",
        pass: "zccf xqev gwlj sffv" 
      }
    });

    const emailSubject = data["_subject"] || "NBA LSD Scholarship - New Application";

    // Email Layout
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
        <div style="background: #1a237e; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">101st NBA Convention Scholarship Application</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">Nashville, Tennessee - 2026</p>
        </div>
        
        <div style="padding: 25px; background: #ffffff;">
          <!-- Applicant Info -->
          <h3 style="color: #1a237e; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px;">1. Applicant Information</h3>
          <p><strong>Name:</strong> ${escapeHtml(data["Full legal name"])} (${escapeHtml(data["Preferred name"] || "No preferred name")})</p>
          <p><strong>Email:</strong> ${escapeHtml(data["Email"])}</p>
          <p><strong>Phone:</strong> ${escapeHtml(data["Phone"])}</p>
          <p><strong>Location:</strong> ${escapeHtml(data["City, State"])}</p>
          <p><strong>School:</strong> ${escapeHtml(data["Law school"])} (Grad: ${escapeHtml(data["Graduation (Mo/Yr)"])})</p>
          <p><strong>Availability:</strong> ${data["Can attend full week"] === 'Yes' ? 'Full Week' : (data["Available days"] || "Not specified")}</p>

          <!-- Commitments -->
          <h3 style="color: #1a237e; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px; margin-top: 25px;">2. Commitments & Preferences</h3>
          <p><strong>All Commitments Confirmed:</strong> ${escapeHtml(data["commitments"])}</p>
          <p><strong>Direct Flight Purchase:</strong> ${data["Pref: NBA purchase flight directly"] ? "Yes" : "No"}</p>
          <p><strong>Roommate Request:</strong> ${data["Roommate names"] ? escapeHtml(data["Roommate names"]) : "None"}</p>

          <!-- Essays -->
          <h3 style="color: #1a237e; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px; margin-top: 25px;">3. Statement of Interest</h3>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #1a237e;">
            ${escapeHtml(data["Statement of interest"])}
          </div>

          <h3 style="color: #1a237e; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px; margin-top: 25px;">4. Leadership & Involvement</h3>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #1a237e;">
            ${escapeHtml(data["Leadership & involvement"])}
          </div>

          <!-- Final Details -->
          <h3 style="color: #1a237e; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px; margin-top: 25px;">5. Final Details</h3>
          <p><strong>Additional Notes:</strong> ${escapeHtml(data["Additional considerations"] || "N/A")}</p>
          <p><strong>Consent to Announce:</strong> ${escapeHtml(data["Announcement consent"])}</p>
          <p><strong>Digital Signature:</strong> ${escapeHtml(data["Signature"])} (Signed: ${escapeHtml(data["Date signed"])})</p>

          <div style="margin-top: 30px; font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
            Submitted on: ${new Date().toLocaleString()}
          </div>
        </div>
      </div>
    `;

    // Attachments handle karna (Resume + Photo)
    const attachments = [];
    if (files['Resume']) {
      attachments.push({ filename: files['Resume'][0].originalname, path: files['Resume'][0].path });
    }
    if (files['Photo']) {
      attachments.push({ filename: files['Photo'][0].originalname, path: files['Photo'][0].path });
    }

    const mailOptions = {
      from: `"NBA Scholarship Portal" <rheonna.reese@gmail.com>`,
      to: "lawstudents@nationalbar.org",
            // to: "shahzad890.it@gmail.com ",
      subject: emailSubject,
      html: emailHtml,
      attachments: attachments
    };

    await transporter.sendMail(mailOptions);

    // Cleanup Files
    Object.values(files).forEach(fileArray => {
      fileArray.forEach(f => { if (fs.existsSync(f.path)) fs.unlinkSync(f.path); });
    });

    return res.status(200).json({ success: true, message: "Application submitted!" });

  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ errors: [{ message: "Server error." }] });
  }
});


module.exports = app;
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

// end of file
// module.exports = app;
const FormSchema = require("../models/FormSchema");
const FormSubmission = require("../models/FormSubmission");
const Event = require("../models/Event");
const ExcelJS = require("exceljs");
const sendEmail = require("../utils/sendEmail");

/* ================= ADMIN: SAVE FORM SCHEMA ================= */
exports.saveFormSchema = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { fields } = req.body;

    if (!fields || !Array.isArray(fields)) {
      return res.status(400).json({ message: "Fields array required" });
    }

    const form = await FormSchema.findOneAndUpdate(
      { event: eventId },
      { event: eventId, fields },
      { upsert: true, new: true, runValidators: true }
    );

    res.json(form);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= PUBLIC: GET FORM SCHEMA ================= */
exports.getFormSchema = async (req, res) => {
  try {
    const { eventId } = req.params;
    const form = await FormSchema.findOne({ event: eventId });

    if (!form) {
      return res.status(404).json({ message: "No form found for this event" });
    }

    res.json(form);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= PUBLIC: SUBMIT FORM ================= */
exports.submitForm = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { responses } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const now = new Date();
    if (now < new Date(event.registrationStartAt)) {
      return res.status(403).json({ message: "Registration not started yet" });
    }
    if (now > new Date(event.registrationEndAt)) {
      return res.status(403).json({ message: "Registration closed" });
    }

    const formSchema = await FormSchema.findOne({ event: eventId });
    if (!formSchema) {
      return res.status(404).json({ message: "Form not configured for this event" });
    }

    for (const field of formSchema.fields) {
      if (field.required && !responses?.[field.name]) {
        return res.status(400).json({ message: `${field.label} is required` });
      }
    }

    const submission = await FormSubmission.create({ event: eventId, responses });

    /* ================= EMAIL ================= */
    const emailVal = responses?.email || responses?.Email;
    const userName = responses?.name || responses?.Name || responses?.full_name || responses?.fullName || "there";

    if (emailVal) {

      // Form fields ki summary banao
      const fieldRows = formSchema.fields
        .sort((a, b) => a.order - b.order)
        .map((f) => {
          const val = responses?.[f.name];
          const displayVal = Array.isArray(val) ? val.join(", ") : (val || "—");
          return `
            <tr>
              <td style="padding:10px 16px;color:#888;font-size:13px;border-bottom:1px solid #1e1e1e;white-space:nowrap;">
                ${f.label}
              </td>
              <td style="padding:10px 16px;color:#fff;font-size:13px;border-bottom:1px solid #1e1e1e;">
                <strong>${displayVal}</strong>
              </td>
            </tr>
          `;
        })
        .join("");

      sendEmail({
        email: emailVal,
        subject: `Registration Confirmed – ${event.title}`,
        message: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">

  <div style="max-width:580px;margin:40px auto;background:#111111;border:1px solid #1e1e1e;border-radius:20px;overflow:hidden;">

    <!-- TOP ORANGE BAR -->
    <div style="background:#f97316;padding:28px 32px;">
      <p style="margin:0;color:#000;font-size:11px;font-weight:900;letter-spacing:3px;text-transform:uppercase;">
        Evolvera Club
      </p>
      <h1 style="margin:8px 0 0;color:#000;font-size:26px;font-weight:900;line-height:1.2;">
        Registration Confirmed ✅
      </h1>
    </div>

    <!-- BODY -->
    <div style="padding:36px 32px;">

      <p style="margin:0 0 24px;color:#ccc;font-size:15px;line-height:1.6;">
        Hi <strong style="color:#fff;">${userName}</strong>, you're all set! 🎉<br/>
        Your registration for the following event has been confirmed.
      </p>

      <!-- EVENT CARD -->
      <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-left:4px solid #f97316;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
        <p style="margin:0 0 4px;color:#f97316;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
          Event
        </p>
        <h2 style="margin:0 0 16px;color:#fff;font-size:20px;font-weight:900;">
          ${event.title}
        </h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#888;font-size:13px;padding:4px 0;width:120px;">📅 Date</td>
            <td style="color:#fff;font-size:13px;padding:4px 0;">
              ${new Date(event.eventStartAt).toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        })}
            </td>
          </tr>
          <tr>
            <td style="color:#888;font-size:13px;padding:4px 0;">🕐 Time</td>
            <td style="color:#fff;font-size:13px;padding:4px 0;">
              ${new Date(event.eventStartAt).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })}
            </td>
          </tr>
          ${event.location ? `
          <tr>
            <td style="color:#888;font-size:13px;padding:4px 0;">📍 Location</td>
            <td style="color:#fff;font-size:13px;padding:4px 0;">${event.location}</td>
          </tr>` : ""}
          ${event.description ? `
          <tr>
            <td style="color:#888;font-size:13px;padding:8px 0 4px;vertical-align:top;">📝 About</td>
            <td style="color:#ccc;font-size:13px;padding:8px 0 4px;line-height:1.6;">
              ${event.description.slice(0, 300)}${event.description.length > 300 ? "..." : ""}
            </td>
          </tr>` : ""}
        </table>
      </div>

      <!-- SUBMISSION DETAILS -->
      <p style="margin:0 0 12px;color:#f97316;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
        Your Submission
      </p>
      <table style="width:100%;border-collapse:collapse;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden;">
        ${fieldRows}
      </table>

      <!-- NOTE -->
      <p style="margin:28px 0 0;color:#555;font-size:12px;line-height:1.6;">
        If you have any questions, feel free to reach out to us.<br/>
        Keep this email as your registration confirmation.
      </p>

    </div>

    <!-- FOOTER -->
    <div style="background:#0d0d0d;border-top:1px solid #1e1e1e;padding:20px 32px;text-align:center;">
      <p style="margin:0;color:#333;font-size:12px;">
        Sent by <span style="color:#f97316;font-weight:900;">Evolvera Club</span>
        &nbsp;•&nbsp; Do not reply to this email
      </p>
    </div>

  </div>

</body>
</html>
        `
      }).catch((err) => console.error("Email failed:", err.message));
    }

    res.status(201).json({ message: "Registration successful", submission });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You have already registered for this event" });
    }
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADMIN: GET SUBMISSIONS ================= */
exports.getSubmissions = async (req, res) => {
  try {
    const { eventId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [submissions, total, formSchema] = await Promise.all([
      FormSubmission.find({ event: eventId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FormSubmission.countDocuments({ event: eventId }),
      FormSchema.findOne({ event: eventId })
    ]);

    res.json({
      fields: formSchema?.fields || [],
      submissions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADMIN: DELETE SUBMISSION ================= */
exports.deleteSubmission = async (req, res) => {
  try {
    const sub = await FormSubmission.findByIdAndDelete(req.params.id);
    if (!sub) return res.status(404).json({ message: "Submission not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADMIN: TOGGLE APPROVAL ================= */
exports.toggleApproval = async (req, res) => {
  try {
    const sub = await FormSubmission.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: "Submission not found" });
    sub.isApproved = !sub.isApproved;
    await sub.save();
    res.json({ isApproved: sub.isApproved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADMIN: EXPORT EXCEL ================= */
exports.exportSubmissionsExcel = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [event, formSchema, submissions] = await Promise.all([
      Event.findById(eventId),
      FormSchema.findOne({ event: eventId }),
      FormSubmission.find({ event: eventId }).lean()
    ]);

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!formSchema) return res.status(404).json({ message: "Form not found" });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Registrations");

    // Dynamic columns from form fields
    const fields = formSchema.fields.sort((a, b) => a.order - b.order);

    sheet.columns = [
      { header: "Submitted At", key: "__createdAt", width: 20 },
      { header: "Status", key: "__status", width: 12 },
      ...fields.map((f) => ({
        header: f.label,
        key: f.name,
        width: 25
      }))
    ];

    submissions.forEach((sub) => {
      const row = {
        __createdAt: new Date(sub.createdAt).toLocaleString(),
        __status: sub.isApproved ? "Approved" : "Pending"
      };
      fields.forEach((f) => {
        const val = sub.responses?.[f.name];
        row[f.name] = Array.isArray(val) ? val.join(", ") : (val ?? "—");
      });
      sheet.addRow(row);
    });

    sheet.getRow(1).font = { bold: true };

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${event.slug}-submissions.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
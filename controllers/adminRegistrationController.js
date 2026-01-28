const ExcelJS = require("exceljs");
const Registration = require("../models/Registration");
const Event = require("../models/Event");

/* =========================================================
   GET REGISTRATIONS BY EVENT (ADMIN TABLE)
   ========================================================= */
exports.getRegistrationsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [registrations, total] = await Promise.all([
      Registration.find({ event: eventId })
        .populate("event", "title slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Registration.countDocuments({ event: eventId })
    ]);

    const formatted = registrations.map((r) => ({
      _id: r._id,

      event: {
        id: r.event?._id,
        title: r.event?.title,
        slug: r.event?.slug
      },

      registrationType: r.registrationType,
      teamName: r.teamName || "Individual",

      leader: {
        name: r.teamLeader?.name || "—",
        email: r.teamLeader?.email || "—",
        phone: r.teamLeader?.phone || "—",
        college: r.teamLeader?.college || "—"
      },

      members: r.members || [],
      membersCount: r.members ? r.members.length : 0,

      createdAt: r.createdAt
    }));

    res.json({
      success: true,
      count: formatted.length,
      totalRegistrations: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      registrations: formatted
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* =========================================================
   EXPORT REGISTRATIONS EXCEL (ADMIN)
   ========================================================= */
exports.exportRegistrationsExcel = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const registrations = await Registration.find({ event: eventId }).lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Registrations");

    sheet.columns = [
      { header: "Type", key: "type", width: 15 },
      { header: "Team Name", key: "team", width: 20 },
      { header: "Role", key: "role", width: 15 },
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "College", key: "college", width: 30 }
    ];

    registrations.forEach((r) => {
      // LEADER ROW
      sheet.addRow({
        type: r.registrationType,
        team: r.teamName || "Individual",
        role: "Leader",
        name: r.teamLeader?.name || "—",
        email: r.teamLeader?.email || "—",
        phone: r.teamLeader?.phone || "—",
        college: r.teamLeader?.college || "—"
      });

      // MEMBERS ROWS
      (r.members || []).forEach((m) => {
        sheet.addRow({
          type: r.registrationType,
          team: r.teamName || "Individual",
          role: "Member",
          name: m.name || "—",
          email: m.email || "—",
          phone: m.phone || "—",
          college: "—"
        });
      });
    });

    sheet.getRow(1).font = { bold: true };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${event.slug}-registrations.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.deleteRegistration = async (req, res) => {
  await Registration.findByIdAndDelete(req.params.id);
  res.json({ message: "Registration deleted" });
};

exports.toggleApproval = async (req, res) => {
  const reg = await Registration.findById(req.params.id);
  reg.isApproved = !reg.isApproved;
  await reg.save();
  res.json({ isApproved: reg.isApproved });
};

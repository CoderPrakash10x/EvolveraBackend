const ExcelJS = require("exceljs");
const Registration = require("../models/Registration");
const Event = require("../models/Event");

exports.exportRegistrationsExcel = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const registrations = await Registration.find({ event: eventId });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Registrations");

    sheet.columns = [
      { header: "Team Name", key: "teamName", width: 20 },
      { header: "Leader Name", key: "leaderName", width: 20 },
      { header: "Leader Email", key: "leaderEmail", width: 30 },
      { header: "Leader Phone", key: "leaderPhone", width: 15 },
      { header: "Members Count", key: "membersCount", width: 15 },
      { header: "Registered At", key: "createdAt", width: 20 }
    ];

    registrations.forEach((reg) => {
      sheet.addRow({
        teamName: reg.teamName || "Solo",
        leaderName: reg.teamLeader.name,
        leaderEmail: reg.teamLeader.email,
        leaderPhone: reg.teamLeader.phone,
        membersCount: reg.members.length,
        createdAt: reg.createdAt
      });
    });

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

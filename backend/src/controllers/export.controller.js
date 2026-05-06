const PDFDocument = require("pdfkit");
const { Document, Packer, Paragraph, TextRun } = require("docx");
const supabase = require("../config/supabase");

const makeSafeFilename = (name, extension) => {
  const safeName = String(name || "agent-output")
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();

  return `${safeName}.${extension}`;
};

const getExportData = async (req) => {
  const { executionId, title, content } = req.body;

  if (content) {
    return {
      title: title || "Agent Output",
      content,
      executionId: null,
    };
  }

  if (!executionId) {
    const error = new Error("Either content or executionId is required");
    error.statusCode = 400;
    throw error;
  }

  const { data: execution, error } = await supabase
    .from("workflow_executions")
    .select("result, workflows(name)")
    .eq("id", executionId)
    .eq("user_id", req.user.id)
    .single();

  if (error || !execution) {
    const notFound = new Error("Execution not found or access denied");
    notFound.statusCode = 404;
    throw notFound;
  }

  if (!execution.result) {
    const noOutput = new Error("No output found to export");
    noOutput.statusCode = 400;
    throw noOutput;
  }

  return {
    title: execution.workflows?.name || "AI Export",
    content: execution.result,
    executionId,
  };
};

const exportPdf = async (req, res, next) => {
  try {
    const exportData = await getExportData(req);

    const doc = new PDFDocument({ margin: 50 });
    const filename = makeSafeFilename(exportData.title, "pdf");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-cache");

    doc.pipe(res);

    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text(exportData.title || "AgentFlow AI Report", { align: "center" });

    doc.moveDown();

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("gray")
      .text(`Generated on: ${new Date().toLocaleString()}`, {
        align: "center",
      });

    doc.moveDown(2);

    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("black")
      .text(String(exportData.content), {
        align: "left",
        lineGap: 4,
        paragraphGap: 8,
      });

    doc.end();

    if (exportData.executionId) {
      await supabase.from("audit_logs").insert({
        user_id: req.user.id,
        action: "export_pdf",
        details: { executionId: exportData.executionId },
      });
    }
  } catch (err) {
    next(err);
  }
};

const exportDocx = async (req, res, next) => {
  try {
    const exportData = await getExportData(req);

    const paragraphs = String(exportData.content)
      .split("\n")
      .map(
        (text) =>
          new Paragraph({
            children: [new TextRun(text || " ")],
          })
      );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: exportData.title || "AgentFlow AI Export",
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            ...paragraphs,
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = makeSafeFilename(exportData.title, "docx");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);

    if (exportData.executionId) {
      await supabase.from("audit_logs").insert({
        user_id: req.user.id,
        action: "export_docx",
        details: { executionId: exportData.executionId },
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  exportPdf,
  exportDocx,
};
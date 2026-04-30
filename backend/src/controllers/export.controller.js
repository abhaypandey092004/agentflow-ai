const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun } = require('docx');

const exportPdf = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="export.pdf"');

    doc.pipe(res);
    doc.fontSize(12).text(content, {
      align: 'left'
    });
    doc.end();

  } catch (err) {
    next(err);
  }
};

const exportDocx = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    // Handle multiple paragraphs
    const paragraphs = content.split('\n').map(text => {
      return new Paragraph({
        children: [new TextRun(text)],
      });
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="export.docx"');
    res.send(buffer);

  } catch (err) {
    next(err);
  }
};

module.exports = {
  exportPdf,
  exportDocx
};

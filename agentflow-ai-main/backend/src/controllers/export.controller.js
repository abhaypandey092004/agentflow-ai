const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const supabase = require('../config/supabase');

const exportPdf = async (req, res, next) => {
  try {
    const { executionId } = req.body;
    if (!executionId) return res.status(400).json({ error: 'Execution ID is required' });

    // Verify ownership and get content
    const { data: execution, error } = await supabase
      .from('workflow_executions')
      .select('result, workflows(name)')
      .eq('id', executionId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !execution) {
      return res.status(404).json({ error: 'Execution not found or access denied' });
    }

    const content = execution.result;
    if (!content) return res.status(400).json({ error: 'No output found to export' });

    const doc = new PDFDocument();
    const filename = `${execution.workflows?.name || 'export'}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);
    doc.fontSize(16).text(execution.workflows?.name || 'AI Export', { underline: true });
    doc.moveDown();
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { color: 'grey' });
    doc.moveDown(2);
    doc.fontSize(12).text(content, { align: 'left' });
    doc.end();

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: req.user.id,
      action: 'export_pdf',
      details: { executionId }
    });

  } catch (err) {
    next(err);
  }
};

const exportDocx = async (req, res, next) => {
  try {
    const { executionId } = req.body;
    if (!executionId) return res.status(400).json({ error: 'Execution ID is required' });

    // Verify ownership and get content
    const { data: execution, error } = await supabase
      .from('workflow_executions')
      .select('result, workflows(name)')
      .eq('id', executionId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !execution) {
      return res.status(404).json({ error: 'Execution not found or access denied' });
    }

    const content = execution.result;
    if (!content) return res.status(400).json({ error: 'No output found to export' });

    const paragraphs = content.split('\n').map(text => {
      return new Paragraph({
        children: [new TextRun(text)],
      });
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: execution.workflows?.name || 'AI Export', bold: true, size: 32 })],
          }),
          ...paragraphs
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `${execution.workflows?.name || 'export'}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: req.user.id,
      action: 'export_docx',
      details: { executionId }
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  exportPdf,
  exportDocx
};

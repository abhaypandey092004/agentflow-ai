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

    const doc = new PDFDocument({ margin: 50 });
    const sanitizedFilename = (execution.workflows?.name || 'report').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${sanitizedFilename}.pdf`;
    
    // Set headers for binary download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    doc.pipe(res);
    
    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('AgentFlow AI Intelligence Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold').text(`Workflow: ${execution.workflows?.name}`, { align: 'left' });
    doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleString()}`, { color: 'grey' });
    doc.moveDown();
    doc.rect(doc.x, doc.y, 500, 1).fill('#cbd5e1'); // Divider line
    doc.moveDown(2);

    // Body
    doc.fontSize(12).font('Helvetica').text(content, { 
      align: 'left',
      lineGap: 4,
      paragraphGap: 10
    });

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

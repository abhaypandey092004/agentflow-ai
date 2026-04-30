const supabase = require('../config/supabase');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${req.user.id}-${Date.now()}.${fileExt}`;
    const filePath = `user_uploads/${fileName}`;

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.path);

    // Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (storageError) {
      throw new Error(`Storage upload failed: ${storageError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Insert into uploaded_files table
    const { data: dbData, error: dbError } = await supabase
      .from('uploaded_files')
      .insert({
        user_id: req.user.id,
        file_name: file.originalname,
        file_url: publicUrl,
        storage_path: filePath
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Clean up local temp file
    fs.unlinkSync(file.path);

    res.status(201).json(dbData);
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};

const parseDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch file metadata
    const { data: file, error: dbError } = await supabase
      .from('uploaded_files')
      .select('storage_path')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (dbError || !file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Download file buffer from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(file.storage_path);

    if (downloadError) throw new Error(`Download failed: ${downloadError.message}`);

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let parsedText = '';
    const fileExt = file.storage_path.split('.').pop().toLowerCase();

    if (fileExt === 'pdf') {
      try {
        // Fix for potential import issues with pdf-parse
        const pdf = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;
        const pdfData = await pdf(buffer);
        parsedText = pdfData.text;
      } catch (parseErr) {
        console.error('PDF Parse Error:', parseErr);
        return res.status(400).json({ error: 'Failed to parse PDF document. It might be encrypted or corrupted.' });
      }
    } else if (fileExt === 'docx') {
      try {
        const docxData = await mammoth.extractRawText({ buffer });
        parsedText = docxData.value;
      } catch (parseErr) {
        console.error('DOCX Parse Error:', parseErr);
        return res.status(400).json({ error: 'Failed to parse DOCX document.' });
      }
    } else if (fileExt === 'txt') {
      parsedText = buffer.toString('utf-8');
    } else {
      return res.status(400).json({ error: 'Unsupported file format for parsing' });
    }

    res.json({ text: parsedText });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadFile,
  parseDocument
};

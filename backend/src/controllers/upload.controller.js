const supabase = require("../config/supabase");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const safeDeleteLocalFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("TEMP FILE DELETE ERROR:", err.message);
  }
};

const getSafeFileName = (fileName) => {
  return String(fileName || "document")
    .replace(/[^a-z0-9.]/gi, "_")
    .toLowerCase();
};

const getFileExt = (fileName) => {
  return String(fileName || "")
    .split(".")
    .pop()
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, "");
};

const uploadFile = async (req, res, next) => {
  let storagePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const file = req.file;

    if (file.size > MAX_FILE_SIZE) {
      safeDeleteLocalFile(file.path);

      return res.status(400).json({
        error: "Max file size is 10MB",
      });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      safeDeleteLocalFile(file.path);

      return res.status(400).json({
        error: "Only PDF, DOCX, and TXT files are allowed",
      });
    }

    const fileExt = getFileExt(file.originalname);

    if (!["pdf", "docx", "txt"].includes(fileExt)) {
      safeDeleteLocalFile(file.path);

      return res.status(400).json({
        error: "Only PDF, DOCX, and TXT files are allowed",
      });
    }

    const safeName = getSafeFileName(file.originalname);
    const fileName = `${req.user.id}-${Date.now()}.${fileExt}`;
    storagePath = `user_uploads/${fileName}`;

    const fileBuffer = fs.readFileSync(file.path);

    const { error: storageError } = await supabase.storage
      .from("documents")
      .upload(storagePath, fileBuffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (storageError) {
      throw new Error(`Storage upload failed: ${storageError.message}`);
    }

    const { data, error: dbError } = await supabase
      .from("uploaded_files")
      .insert({
        user_id: req.user.id,
        file_name: safeName,
        file_url: storagePath,
        storage_path: storagePath,
      })
      .select()
      .single();

    if (dbError) {
      await supabase.storage.from("documents").remove([storagePath]);
      throw dbError;
    }

    safeDeleteLocalFile(file.path);

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      file: data,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);

    if (storagePath) {
      await supabase.storage.from("documents").remove([storagePath]);
    }

    if (req.file) {
      safeDeleteLocalFile(req.file.path);
    }

    next(err);
  }
};

const parseDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: file, error } = await supabase
      .from("uploaded_files")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (error || !file) {
      return res.status(404).json({
        error: "File not found",
      });
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(file.storage_path);

    if (downloadError) {
      throw new Error(`Download failed: ${downloadError.message}`);
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let parsedText = "";
    let parseWarning = null;

    const ext = getFileExt(file.storage_path);

    if (ext === "pdf") {
      try {
        const pdfData = await pdfParse(buffer);
        parsedText = String(pdfData?.text || "").trim();

        if (!parsedText) {
          parseWarning =
            "PDF uploaded successfully, but no selectable text was found. This PDF may be scanned or image-based.";
        }
      } catch (pdfErr) {
        console.error("PDF PARSE ERROR:", pdfErr.message);

        parseWarning =
          "PDF uploaded successfully, but text extraction failed. This PDF may be scanned, encrypted, image-based, or unsupported.";
      }
    } else if (ext === "docx") {
      try {
        const docxData = await mammoth.extractRawText({ buffer });
        parsedText = String(docxData?.value || "").trim();

        if (!parsedText) {
          parseWarning = "DOCX uploaded successfully, but no text was found.";
        }
      } catch (docErr) {
        console.error("DOCX PARSE ERROR:", docErr.message);

        parseWarning =
          "DOCX uploaded successfully, but text extraction failed.";
      }
    } else if (ext === "txt") {
      parsedText = buffer.toString("utf-8").trim();

      if (!parsedText) {
        parseWarning = "TXT uploaded successfully, but file is empty.";
      }
    } else {
      return res.status(400).json({
        error: "Unsupported file type",
      });
    }

    return res.json({
      success: true,
      text: parsedText || parseWarning || "No text found",
      warning: parseWarning,
    });
  } catch (err) {
    console.error("PARSE ERROR:", err);
    next(err);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: file, error } = await supabase
      .from("uploaded_files")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (error || !file) {
      return res.status(404).json({
        error: "File not found",
      });
    }

    await supabase.storage.from("documents").remove([file.storage_path]);

    const { error: dbError } = await supabase
      .from("uploaded_files")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id);

    if (dbError) {
      throw dbError;
    }

    return res.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    next(err);
  }
};

const listFiles = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("uploaded_files")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return res.json(data || []);
  } catch (err) {
    console.error("LIST ERROR:", err);
    next(err);
  }
};

module.exports = {
  uploadFile,
  parseDocument,
  deleteFile,
  listFiles,
};
const supabase = require("../config/supabase");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const file = req.file;

    // FILE SIZE VALIDATION
    if (file.size > 10 * 1024 * 1024) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return res.status(400).json({
        error: "Max file size is 10MB",
      });
    }

    // ALLOWED TYPES
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return res.status(400).json({
        error: "Only PDF, DOCX, and TXT files are allowed",
      });
    }

    // FILE EXTENSION
    const fileExt = file.originalname
      .split(".")
      .pop()
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, "");

    // SAFE FILE NAME
    const safeName = file.originalname.replace(/[^a-z0-9.]/gi, "_");

    const fileName = `${req.user.id}-${Date.now()}.${fileExt}`;

    const storagePath = `user_uploads/${fileName}`;

    // READ FILE BUFFER
    const fileBuffer = fs.readFileSync(file.path);

    // UPLOAD TO SUPABASE STORAGE
    const { error: storageError } = await supabase.storage
      .from("documents")
      .upload(storagePath, fileBuffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (storageError) {
      throw new Error(storageError.message);
    }

    // SAVE DB RECORD
    const { data, error: dbError } = await supabase
      .from("uploaded_files")
      .insert({
        user_id: req.user.id,
        file_name: safeName,
        storage_path: storagePath,
      })
      .select()
      .single();

    if (dbError) {
      await supabase.storage.from("documents").remove([storagePath]);

      throw dbError;
    }

    // DELETE TEMP FILE
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      file: data,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
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

    // DOWNLOAD FROM STORAGE
    const { data: fileData, error: downloadError } =
      await supabase.storage
        .from("documents")
        .download(file.storage_path);

    if (downloadError) {
      throw new Error(downloadError.message);
    }

    const arrayBuffer = await fileData.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    let parsedText = "";

    const ext = file.storage_path.split(".").pop().toLowerCase();

    // PDF
    if (ext === "pdf") {
      try {
        const pdfData = await pdfParse(buffer);
        parsedText = pdfData.text;
      } catch (pdfErr) {
        console.error(pdfErr);

        return res.status(400).json({
          error: "Failed to parse PDF",
        });
      }
    }

    // DOCX
    else if (ext === "docx") {
      try {
        const docxData = await mammoth.extractRawText({
          buffer,
        });

        parsedText = docxData.value;
      } catch (docErr) {
        console.error(docErr);

        return res.status(400).json({
          error: "Failed to parse DOCX",
        });
      }
    }

    // TXT
    else if (ext === "txt") {
      parsedText = buffer.toString("utf-8");
    }

    else {
      return res.status(400).json({
        error: "Unsupported file type",
      });
    }

    return res.json({
      success: true,
      text: parsedText || "No text found",
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

    // DELETE STORAGE
    await supabase.storage
      .from("documents")
      .remove([file.storage_path]);

    // DELETE DB
    await supabase
      .from("uploaded_files")
      .delete()
      .eq("id", id);

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

    return res.json(data);
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
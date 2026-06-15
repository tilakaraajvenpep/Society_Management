import express from "express";
import { authenticate } from "../middleware/auth";
import { upload } from "../utils/cloudinary";

const router = express.Router();

router.post("/member-docs", authenticate, upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'idProof', maxCount: 1 }
]), async (req: any, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const result: any = {};

    if (files.photo) {
      result.photoUrl = files.photo[0].path;
    }
    if (files.idProof) {
      result.idProofUrl = files.idProof[0].path;
    }

    res.json(result);
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ 
      message: error.message || "Error uploading files", 
      error: {
        message: error.message,
        stack: error.stack
      } 
    });
  }
});

export default router;

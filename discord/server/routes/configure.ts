import { Router } from "express";

import database from "../../database";
import auth from "../middleware/auth";

const router = Router();

router.use(auth);

router.post("/set-key", async (req, res) => {
  const { guildId, key } = req.body || {};

  if (!guildId || !key || typeof guildId !== "string" || typeof key !== "string") {
    return res.status(400).json({
      code: 400,
      message: "Missing/invalid guild ID and/or key"
    });
  }

  try {
    await database.guilds.save({
      id: guildId,
      groupKey: key
    });
  } catch (e) {
    console.error(e);

    return res.status(500).json({
      code: 500,
      message: "Fatal error"
    });
  }

  return res.status(200).json({
    code: 200,
    message: "Successfully set key"
  });
});

export default router;

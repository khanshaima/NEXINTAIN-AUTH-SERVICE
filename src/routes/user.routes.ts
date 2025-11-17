// routes/user.routes.ts
import { Router } from "express";
import { signupController } from "../controllers/signup.controller";

const router = Router();

router.post("/email/signup", signupController);

export default router;

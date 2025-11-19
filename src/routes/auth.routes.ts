import { Router } from 'express';
import { sendOtpController, verifyOtpController, loginWithEmailController, refreshTokenController, googleAuthUrlController, googleAuthCallbackController, setPasswordController } from '../controllers/auth.controller';
import { createRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.post('/mobile/send-otp', createRateLimiter(10, 5), sendOtpController);
router.post('/mobile/verify-otp',createRateLimiter(5, 5), verifyOtpController);

router.post('/email/login',createRateLimiter(10, 5), loginWithEmailController);
router.post("/email/refresh",createRateLimiter(5, 5), refreshTokenController);

router.get("/google/url",createRateLimiter(10, 5), googleAuthUrlController);
router.get("/google/callback", createRateLimiter(10, 5), googleAuthCallbackController);

router.post("/set-password", setPasswordController);

router.get('/test', (req, res) => {
  res.json({ ok: true, message: 'Auth route working' });
});

export default router;

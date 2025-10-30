import express from "express";
import {
  createPayment,
  deletePayment,
  getPayment,
  getPaymentById,
  updatePayment,
} from "../controllers/controller.payment.js";

import { validate } from "../middlewares/validate.js";
import {
  createPaymentValidator,
  updatePaymentValidator,
} from "../validators/paymentsvalidator.js";

const paymentRoutes = express.Router();

paymentRoutes.get("/", getPayment);
paymentRoutes.get("/:id", getPaymentById);
paymentRoutes.post("/", validate(createPaymentValidator), createPayment);
paymentRoutes.put("/:id", validate(updatePaymentValidator), updatePayment);
paymentRoutes.delete("/:id", deletePayment);

export default paymentRoutes;

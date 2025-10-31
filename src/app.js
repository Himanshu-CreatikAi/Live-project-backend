import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import confollowupRoutes from "./routes/route.confollowup.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import confollowsearchRoutes from "./routes/route.confollowsearch.js";
import confollowaddRoutes from "./routes/route.confollowadd.js";
import contactRoutes from "./routes/route.contact.js";
import contactAdvRoutes from "./routes/route.contactAdv.js";
import comProEnqRoutes from "./routes/route.ComProEnq.js";
import cusEnqRoutes from "./routes/route.CusEnq.js";
import campaignRoutes from "./routes/route.campaign.js";
import typeRoutes from "./routes/route.type.js";
import subtypeRoutes from "./routes/route.subtype.js";
import scheduleRoutes from "./routes/route.schedule.js";
import taskRoutes from "./routes/route.task.js";
import userRoutes from "./routes/routes.user.js";
import adminRoutes from "./routes/routes.admin.js";
import customerRoutes from "./routes/route.customer.js";
import followupRoutes from "./routes/route.cusfollowup.js";
import messageRoutes from "./routes/route.messages.js";
import callRoutes from "./routes/route.calls.js";
import templateRoute from "./routes/route.template.js";

const app = express();
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "https://creatik-it.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Logger (basic)
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

// Routes
app.use("/api/customer", customerRoutes);
app.use("/api/favourites", customerRoutes);
app.use("/api/cus/followup", followupRoutes);
app.use("/api/v1/templates", templateRoute);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/calls", callRoutes);
app.use("/api/con/followup", confollowupRoutes);
app.use("/api/con/follow/search", confollowsearchRoutes);
app.use("/api/con/follow/add", confollowaddRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/con/adv", contactAdvRoutes);
app.use("/api/com/pro/enq", comProEnqRoutes);
app.use("/api/cus/enq", cusEnqRoutes);
app.use("/api/mas/cam", campaignRoutes);
app.use("/api/mas/type", typeRoutes);
app.use("/api/mas/sub", subtypeRoutes);
app.use("/api/sch", scheduleRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

// Error handler
app.use(errorHandler);

export default app;

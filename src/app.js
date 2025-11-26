import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import responseTime from "response-time";
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
import cityRoutes from "./routes/route.city.js";
import locationRoutes from "./routes/route.location.js";
import facilitiesRoutes from "./routes/route.facilities.js";
import amenityRoutes from "./routes/route.amenities.js";
import functionalAreaRoutes from "./routes/route.functionalArea.js";
import industryRoutes from "./routes/route.industries.js";
import roleRoutes from "./routes/route.roles.js";
import contactCampaignRoutes from "./routes/route.contactcampaign.js";
import contactTypeRoutes from "./routes/route.contacttype.js";
import referenceRoutes from "./routes/route.references.js";
import expenseRoutes from "./routes/route.expenses.js";
import incomeRoutes from "./routes/route.income.js";
import statustypeRoutes from "./routes/route.statustype.js";
import paymentRoutes from "./routes/route.payments.js";
import companyProjectRoutes from "./routes/route.companyproject.js";
import builderRoutes from "./routes/route.builderslider.js";
import incomeMarketingRoutes from "./routes/route.incomemarketing.js";
import ExpenseMarketingRoutes from "./routes/route.expensemarketing.js";
import constatustypeRoutes from "./routes/route.constatustype.js";

const app = express();
app.use(cookieParser());

app.use(helmet());

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://creatik-it.vercel.app",
      "https://creatik-crm.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  responseTime((req, res, time) => {
    console.log(
      `[PERF] ${req.method} ${req.originalUrl} - ${time.toFixed(2)}ms`
    );
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
app.use("/api/mas/city", cityRoutes);
app.use("/api/mas/sub", subtypeRoutes);
app.use("/api/mas/loc", locationRoutes);
app.use("/api/mas/fac", facilitiesRoutes);
app.use("/api/mas/amen", amenityRoutes);
app.use("/api/mas/func", functionalAreaRoutes);
app.use("/api/mas/ind", industryRoutes);
app.use("/api/mas/role", roleRoutes);
app.use("/api/mas/contactcampaign", contactCampaignRoutes);
app.use("/api/mas/contacttype", contactTypeRoutes);
app.use("/api/mas/ref", referenceRoutes);
app.use("/api/mas/exp", expenseRoutes);
app.use("/api/mas/inc", incomeRoutes);
app.use("/api/mas/statustype", statustypeRoutes);
app.use("/api/mas/con/statustype", constatustypeRoutes);
app.use("/api/mas/payments", paymentRoutes);
app.use("/api/mas/buil", builderRoutes);
app.use("/api/com/pro", companyProjectRoutes);
app.use("/api/fin/inc", incomeMarketingRoutes);
app.use("/api/fin/exp", ExpenseMarketingRoutes);

// Error handler
app.use(errorHandler);

export default app;

import mongoose from "mongoose";

const companyProjectSchema = new mongoose.Schema(
  {
    ProjectName: { type: String, required: true },
    ProjectType: { type: String, default: "" },
    ProjectStatus: { type: String, default: "" },

    City: { type: String, default: "" },
    Location: { type: String, default: "" },
    Area: { type: String, default: "" },
    Range: { type: String, default: "" },
    Adderess: { type: String, default: "" },
    Facillities: { type: String, default: "" },
    Amenities: { type: String, default: "" },

    Description: { type: String, default: "" },
    Video: { type: String, default: "" },

    GoogleMap: { type: String, default: "" },
    CustomerImage: { type: [String], default: [] },
    SitePlan: { type: [String], default: [] },

    CreatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true }
);

const CompanyProject = mongoose.model("CompanyProject", companyProjectSchema);

export default CompanyProject;

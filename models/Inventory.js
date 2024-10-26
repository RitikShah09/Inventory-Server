const mongoose = require("mongoose");

const itemDetailSchema = new mongoose.Schema({
  product_code: {
    type: String,
    default: "N/A",
  },
  rate: {
    type: Number,
    min: 0,
    default: 0,
  },
  quantity: {
    type: Number,
    min: 0,
    default: 1,
  },
});

const importInvoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  import_invoice_number: {
    type: String,
    unique: true,
  },
  import_partner: {
    type: String,
  },
  import_invoice_date: {
    type: Date,
    default: Date.now,
  },
  boe_number: {
    type: String,
    default: "N/A",
  },
  bl_number: {
    type: String,
    default: "N/A",
  },
  entry_date: {
    type: Date,
    default: Date.now,
  },
  transport_mode: {
    type: String,
  },
  exchange_rate: {
    type: Number,
    min: 0,
    default: 1.0,
  },
  custom_duty: {
    type: Number,
    min: 0,
    default: 0,
  },
  ocean_charge: {
    type: Number,
    min: 0,
    default: 0,
  },
  cn_h_charge: {
    type: Number,
    min: 0,
    default: 0,
  },
  total_bill: {
    type: Number,
    min: 0,
    default: 0,
  },
  misc_charge: {
    type: Number,
    min: 0,
    default: 0,
  },
  misc_reason: {
    type: String,
    default: "Not Specified",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isDraft: {
    type: Boolean,
    default: false,
  },

  items: {
    type: [itemDetailSchema],
    default: [],
  },
});

const ImportInvoice = mongoose.model("ImportInvoice", importInvoiceSchema);

module.exports = ImportInvoice;

const express = require("express");
const Inventory = require("../models/Inventory");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "entry_date",
      order = "asc",
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const totalItems = await Inventory.countDocuments({
      userId: req.id,
      isDeleted: { $ne: true },
    });

    const totalPages = Math.ceil(totalItems / limitNum);
    const items = await Inventory.find({
      userId: req.id,
      isDeleted: { $ne: true },
    })
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      items,
      totalPages,
      currentPage: pageNum,
      totalItems,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { import_invoice_number } = req.body;

    const existingInvoice = await Inventory.findOne({
      import_invoice_number: import_invoice_number,
    });

    if (existingInvoice) {
      return res.status(400).json({ message: "Invoice already exists" });
    }

    const item = new Inventory({
      ...req.body,
      userId: req.id,
    });

    await item.save();

    res.status(201).json({
      message: "Invoice Created Successfully",
      data: item,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Inventory.findOne({
      _id: id,
      isDeleted: { $ne: true },
    }).lean();
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const {
      import_invoice_number: importInvoiceNumber,
      isDraft,
      _id,
      import_invoice_date: importInvoiceDate,
      import_partner: importPartner,
      entry_date: entryDate,
      boe_number: boeNumber,
      exchange_rate: exchangeRate,
      custom_duty: customDuty,
      ocean_charge: oceanCharge,
      cn_h_charge: cnhCharge,
      items,
    } = invoice;

    const formattedItems = items.map((item) => {
      const rateAfterExchange = (item.rate * exchangeRate).toFixed(2);
      const totalItemRate = (rateAfterExchange * item.quantity).toFixed(2);
      const totalWithCharges = (
        parseFloat(totalItemRate) +
        customDuty +
        oceanCharge +
        cnhCharge
      ).toFixed(2);
      const ratePerQuantity = (totalWithCharges / item.quantity).toFixed(2);

      return {
        itemCode: item.product_code,
        rateInUSD: item.rate.toFixed(2),
        exchangeRate: exchangeRate.toFixed(2),
        quantity: item.quantity,
        rateAfterExchange: parseFloat(rateAfterExchange),
        totalItemRate: parseFloat(totalItemRate),
        customDuty: customDuty.toFixed(2),
        oceanCharge: oceanCharge.toFixed(2),
        cnhCharge: cnhCharge.toFixed(2),
        ratePerQuantity: parseFloat(ratePerQuantity),
        total: parseFloat(totalWithCharges),
      };
    });

    const result = {
      _id,
      isDraft,
      importInvoiceNumber,
      importInvoiceDate: importInvoiceDate.toISOString().split("T")[0],
      importPartner,
      entryDate: entryDate.toISOString().split("T")[0],
      boeNumber,
      items: formattedItems,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/data/:id", authMiddleware, async (req, res, next) => {
  try {
    const invoice = await Inventory.findById(req.params.id);
    if (!invoice)
      return res.status(404).json({ message: "Import invoice not found" });
    res.json(invoice);
  } catch (error) {
    res.status(500).json("Server err");
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const updatedInvoice = await Inventory.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedInvoice) {
      return res.status(404).json({ message: "Import invoice not found" });
    }

    res.status(200).json(updatedInvoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
    });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json("Item deleted");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

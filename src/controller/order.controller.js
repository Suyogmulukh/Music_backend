const Order = require("../models/order.model");
const PDFDocument = require("pdfkit");

// Consistent rupee symbol - use Rs. as fallback for better compatibility
const RUPEE = "Rs.";
// If you want to use ₹ symbol, uncomment below and ensure proper font
// const RUPEE = "\u20B9";

// Get all orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// Get single order
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching order" });
  }
};

// Create order
const createOrder = async (req, res) => {
  try {
    // Generate order number (YYMMDDxxx format)
    const date = new Date();
    const baseNumber =
      date.getFullYear().toString().substr(-2) +
      String(date.getMonth() + 1).padStart(2, "0") +
      String(date.getDate()).padStart(2, "0");

    // Find last order of the day to increment counter
    const lastOrder = await Order.findOne({
      orderNumber: new RegExp(`^${baseNumber}`),
    }).sort({ orderNumber: -1 });

    let counter = 1;
    if (lastOrder) {
      counter = parseInt(lastOrder.orderNumber.slice(-3)) + 1;
    }

    const orderNumber = `${baseNumber}${String(counter).padStart(3, "0")}`;

    const order = await Order.create({
      ...req.body,
      orderNumber,
      remainingPayment: req.body.totalPrice - req.body.advancePayment,
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating order" });
  }
};

// Update order
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        remainingPayment: req.body.totalPrice - req.body.advancePayment,
      },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating order" });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting order" });
  }
};

// Download invoice
const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const formatCurrency = (amount) => {
      return `${RUPEE} ${parseInt(amount).toLocaleString("en-IN")}`;
    };

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderNumber}.pdf`
    );

    doc.pipe(res);

    // Add business details
    doc.fontSize(20).text("Banjo Team Booking", { align: "center" });
    doc.moveDown();
    doc.fontSize(16).text("Invoice", { align: "center" });
    doc.moveDown();

    // Add order details
    doc.fontSize(12);
    doc.text(`Order Number: ${order.orderNumber}`);
    doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`);
    doc.text(`Customer Name: ${order.name}`);
    doc.text(`Phone: ${order.phone}`);
    doc.text(`Address: ${order.address}`);
    doc.text(`Event Type: ${order.type}`);
    doc.moveDown();

    // Add payment details with formatted currency
    doc.text(`Total Amount: ${formatCurrency(order.totalPrice)}`);
    doc.text(`Advance Paid: ${formatCurrency(order.advancePayment)}`);
    doc.text(`Remaining: ${formatCurrency(order.remainingPayment)}`);
    doc.text(`Status: ${order.completed ? "Completed" : "Pending"}`);

    doc.end();
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error generating invoice" });
  }
};

// Download all orders as PDF
const downloadAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }

    const doc = new PDFDocument({
      size: "A4",
      margin: 30,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="all-orders-${
        new Date().toISOString().split("T")[0]
      }.pdf"`
    );

    doc.pipe(res);

    // Title
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("Banjo Team Booking - All Orders Report", { align: "center" });
    doc
      .fontSize(9)
      .fillColor("#666")
      .text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, {
        align: "center",
      });
    doc.moveDown(0.5);

    // Summary Section
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.completed).length;
    const pendingOrders = totalOrders - completedOrders;
    const totalAmount = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalAdvance = orders.reduce((sum, o) => sum + o.advancePayment, 0);
    const totalRemaining = orders.reduce(
      (sum, o) => sum + o.remainingPayment,
      0
    );

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text("Summary", { underline: true });
    doc.fontSize(9).font("Helvetica").fillColor("#333");
    doc.text(
      `Total Orders: ${totalOrders} | Completed: ${completedOrders} | Pending: ${pendingOrders}`
    );
    doc.text(
      `Total Amount: ${RUPEE} ${totalAmount.toLocaleString(
        "en-IN"
      )} | Advance: ${RUPEE} ${totalAdvance.toLocaleString(
        "en-IN"
      )} | Remaining: ${RUPEE} ${totalRemaining.toLocaleString("en-IN")}`
    );
    doc.moveDown(0.5);

    // Table Configuration
    const pageWidth = doc.page.width;
    const pageMargin = 30;
    const tableWidth = pageWidth - pageMargin * 2;

    const columns = [
      { key: "orderNumber", label: "Order #", width: 50 },
      { key: "name", label: "Customer", width: 80 },
      { key: "date", label: "Date", width: 65 },
      { key: "type", label: "Type", width: 60 },
      { key: "totalPrice", label: "Total", width: 70 },
      { key: "advancePayment", label: "Advance", width: 70 },
      { key: "status", label: "Status", width: 55 },
    ];

    const startX = pageMargin;
    const startY = doc.y;
    const headerHeight = 22;
    const rowHeight = 20;
    const pageHeight = doc.page.height;
    const bottomMargin = 40;

    let currentY = startY;

    // Draw header
    const drawHeader = () => {
      const headerY = doc.y;
      doc.rect(startX, headerY, tableWidth, headerHeight).fill("#2563eb");

      doc.fontSize(9).font("Helvetica-Bold").fillColor("#fff");
      let xPos = startX + 5;
      columns.forEach((col) => {
        doc.text(col.label, xPos, headerY + 6, {
          width: col.width - 10,
          align:
            col.key.includes("Price") || col.key.includes("Payment")
              ? "right"
              : "left",
        });
        xPos += col.width;
      });
      doc.moveDown(headerHeight / doc.currentLineHeight());
    };

    // Draw table rows
    const drawRows = () => {
      doc.fontSize(8).font("Helvetica").fillColor("#333");

      orders.forEach((order, index) => {
        const rowY = doc.y;

        // Check if we need a new page
        if (rowY + rowHeight > pageHeight - bottomMargin) {
          doc.addPage();
          drawHeader();
        }

        // Alternate row colors
        if (index % 2 === 0) {
          doc.rect(startX, rowY, tableWidth, rowHeight).fill("#f3f4f6");
        }

        const rowData = [
          `#${order.orderNumber}`,
          order.name.substring(0, 18),
          new Date(order.date).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            year: "2-digit",
          }),
          order.type.substring(0, 12),
          `${RUPEE} ${parseInt(order.totalPrice).toLocaleString("en-IN")}`,
          `${RUPEE} ${parseInt(order.advancePayment).toLocaleString("en-IN")}`,
          order.completed ? "Done" : "Pending",
        ];

        doc.fillColor("#000");
        let xPos = startX + 5;
        rowData.forEach((data, i) => {
          const align = i >= 4 ? "right" : "left";
          doc.text(data, xPos, rowY + 4, {
            width: columns[i].width - 10,
            align,
          });
          xPos += columns[i].width;
        });

        // Draw row border
        doc.strokeColor("#e5e7eb").lineWidth(0.5);
        doc
          .moveTo(startX, rowY)
          .lineTo(startX + tableWidth, rowY)
          .stroke();
        doc
          .moveTo(startX, rowY + rowHeight)
          .lineTo(startX + tableWidth, rowY + rowHeight)
          .stroke();

        doc.moveDown(rowHeight / doc.currentLineHeight());
      });
    };

    drawHeader();
    drawRows();

    // Footer
    doc
      .fontSize(8)
      .fillColor("#666")
      .text("Thank you for your business! - Banjo Team Booking", {
        align: "center",
        y: pageHeight - 30,
      });

    // End PDF
    doc.end();
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({
      success: false,
      message: "Error generating PDF",
      error: err.message,
    });
  }
};

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  downloadInvoice,
  downloadAllOrders,
};
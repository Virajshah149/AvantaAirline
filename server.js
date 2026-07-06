const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const User = require("./models/User");
const Booking = require("./models/Booking");
const Support = require("./models/Support");
const otpStore = {};

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// This allows Express to show your HTML/CSS/JS files from same folder
app.use(express.static(__dirname));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "1login.html"));
});

// test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Avanta Airlines backend is running" });
});

/* =========================
   USER SIGNUP
========================= */

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, phone, username, password } = req.body;

    if (!name || !email || !username || !password) {
      return res.json({
        success: false,
        message: "Please fill all required fields"
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email }, { username: username }]
    });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Email or username already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phone,
      username,
      password: hashedPassword
    });

    await user.save();

    res.json({
      success: true,
      message: "Signup successful"
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Signup failed",
      error: error.message
    });
  }
});

/* =========================
   USER LOGIN
========================= */

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username });

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid username or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid username or password"
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        username: user.username
      }
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
});

/* =========================
   USER PROFILE
========================= */

app.get("/api/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password"
    );

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Profile loading failed"
    });
  }
});

/* =========================
   EDIT PROFILE
========================= */

app.put("/api/profile/:username", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      flyer,
      meal,
      seat,
      notifications
    } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      {
        name,
        email,
        phone,
        flyer,
        meal,
        seat,
        notifications
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Profile update failed",
      error: error.message
    });
  }
});
/* =========================
   CREATE BOOKING
========================= */

app.post("/api/bookings", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();

    res.json({
      success: true,
      message: "Booking confirmed successfully",
      booking: booking
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Booking failed",
      error: error.message
    });
  }
});

/* =========================
   MY BOOKINGS
========================= */

app.get("/api/bookings/:username", async (req, res) => {
  try {
    const bookings = await Booking.find({
      username: req.params.username
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings: bookings
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Bookings loading failed"
    });
  }
});

/* =========================
   CANCEL BOOKING
========================= */

app.put("/api/bookings/cancel/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "Cancelled" },
      { new: true }
    );

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      booking: booking
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Booking cancellation failed"
    });
  }
});

/* =========================
   SUPPORT FORM
========================= */

app.post("/api/support", async (req, res) => {
  try {
    const support = new Support(req.body);
    await support.save();

    res.json({
      success: true,
      message: "Support request submitted successfully"
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Support request failed"
    });
  }
});

/* =========================
   ADMIN LOGIN
========================= */

app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { role: "admin", username: username },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      return res.json({
        success: true,
        message: "Admin login successful",
        token: token
      });
    }

    res.json({
      success: false,
      message: "Invalid admin credentials"
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Admin login failed"
    });
  }
});

/* =========================
   ADMIN TOKEN CHECK
========================= */

function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided."
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can access this"
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}

/* =========================
   PROTECTED ADMIN ROUTES
========================= */

app.get("/api/admin/summary", verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalSupportRequests = await Support.countDocuments();

    const bookings = await Booking.find();

    const totalRevenue = bookings.reduce((sum, booking) => {
      if (booking.status !== "Cancelled") {
        return sum + (booking.price || 0);
      }
      return sum;
    }, 0);

    res.json({
      success: true,
      totalUsers,
      totalBookings,
      totalRevenue,
      totalSupportRequests
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Admin summary failed"
    });
  }
});

app.get("/api/admin/users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Users loading failed"
    });
  }
});

app.get("/api/admin/bookings", verifyAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings: bookings
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Bookings loading failed"
    });
  }
});

app.get("/api/admin/support", verifyAdmin, async (req, res) => {
  try {
    const requests = await Support.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      requests: requests
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Support requests loading failed"
    });
  }
});

app.delete("/api/admin/bookings/:id", verifyAdmin, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Booking deleted successfully"
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Booking delete failed"
    });
  }
});

app.delete("/api/admin/users/:id", verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.json({
      success: false,
      message: "User delete failed"
    });
  }
});

/* =========================
   SERVER START
========================= */
/* =========================
   STATIC FLIGHTS API
========================= */

app.get("/api/flights", (req, res) => {
  const flights = [
    {
      id: "AV101",
      name: "Avanta Sky Express",
      flightNumber: "AV101",
      time: "08:30 AM",
      from: "Mumbai",
      to: "Delhi"
    },
    {
      id: "AV202",
      name: "Avanta Royal Wings",
      flightNumber: "AV202",
      time: "12:45 PM",
      from: "Ahmedabad",
      to: "Bangalore"
    },
    {
      id: "AV303",
      name: "Avanta BlueJet",
      flightNumber: "AV303",
      time: "04:20 PM",
      from: "Vadodara",
      to: "Mumbai"
    },
    {
      id: "AV404",
      name: "Avanta Luxe Air",
      flightNumber: "AV404",
      time: "09:15 PM",
      from: "Delhi",
      to: "Goa"
    }
  ];

  res.json({
    success: true,
    flights: flights
  });
});

/* =========================
   CANCEL BOOKING FROM SUPPORT PAGE
========================= */



/* =========================
   OTP SYSTEM FOR BOOKING PASS AND CANCELLATION
========================= */

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/* =========================
   SEND OTP TO VIEW BOARDING PASS
========================= */

app.post("/api/booking/send-pass-otp", async (req, res) => {
  try {
    const { ticketNumber, email } = req.body;

    if (!ticketNumber || !email) {
      return res.json({
        success: false,
        message: "Ticket number and email are required"
      });
    }

    const booking = await Booking.findOne({
      ticketNumber: ticketNumber,
      passengerEmail: email
    });

    if (!booking) {
      return res.json({
        success: false,
        message: "No booking found with this ticket number and email"
      });
    }

    const otp = generateOtp();

    otpStore[`PASS_${ticketNumber}`] = {
      otp: otp,
      email: email,
      expiresAt: Date.now() + 5 * 60 * 1000
    };

    console.log(`Boarding Pass OTP for ${ticketNumber}: ${otp}`);

    res.json({
      success: true,
      message: "OTP sent successfully. Demo OTP is shown below.",
      demoOtp: otp
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Failed to send OTP"
    });
  }
});

/* =========================
   VERIFY OTP TO VIEW BOARDING PASS
========================= */

app.post("/api/booking/verify-pass-otp", async (req, res) => {
  try {
    const { ticketNumber, email, otp } = req.body;

    if (!ticketNumber || !email || !otp) {
      return res.json({
        success: false,
        message: "Ticket number, email and OTP are required"
      });
    }

    const storedOtp = otpStore[`PASS_${ticketNumber}`];

    if (!storedOtp) {
      return res.json({
        success: false,
        message: "Please generate OTP first"
      });
    }

    if (storedOtp.email !== email) {
      return res.json({
        success: false,
        message: "Email does not match OTP request"
      });
    }

    if (Date.now() > storedOtp.expiresAt) {
      delete otpStore[`PASS_${ticketNumber}`];

      return res.json({
        success: false,
        message: "OTP expired. Please generate a new OTP"
      });
    }

    if (storedOtp.otp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP"
      });
    }

    delete otpStore[`PASS_${ticketNumber}`];

    res.json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    res.json({
      success: false,
      message: "OTP verification failed"
    });
  }
});

/* =========================
   SEND OTP FOR CANCELLATION
========================= */

app.post("/api/support/send-cancel-otp", async (req, res) => {
  try {
    const { ticketNumber, email } = req.body;

    if (!ticketNumber || !email) {
      return res.json({
        success: false,
        message: "Ticket number and email are required"
      });
    }

    const booking = await Booking.findOne({
      ticketNumber: ticketNumber,
      passengerEmail: email
    });

    if (!booking) {
      return res.json({
        success: false,
        message: "No booking found with this ticket number and email"
      });
    }

    if (booking.status === "Cancelled") {
      return res.json({
        success: false,
        message: "This booking is already cancelled"
      });
    }

    const otp = generateOtp();

    otpStore[`CANCEL_${ticketNumber}`] = {
      otp: otp,
      email: email,
      expiresAt: Date.now() + 5 * 60 * 1000
    };

    console.log(`Cancellation OTP for ${ticketNumber}: ${otp}`);

    res.json({
      success: true,
      
      demoOtp: otp
    });

  } catch (error) {
    res.json({
      success: false,
      message: "OTP generation failed"
    });
  }
});

/* =========================
   CANCEL BOOKING AFTER OTP VERIFY
========================= */

app.put("/api/support/cancel-booking", async (req, res) => {
  try {
    const { ticketNumber, email, otp } = req.body;

    if (!ticketNumber || !email || !otp) {
      return res.json({
        success: false,
        message: "Ticket number, email and OTP are required"
      });
    }

    const storedOtp = otpStore[`CANCEL_${ticketNumber}`];

    if (!storedOtp) {
      return res.json({
        success: false,
        message: "Please generate OTP first"
      });
    }

    if (storedOtp.email !== email) {
      return res.json({
        success: false,
        message: "Email does not match OTP request"
      });
    }

    if (Date.now() > storedOtp.expiresAt) {
      delete otpStore[`CANCEL_${ticketNumber}`];

      return res.json({
        success: false,
        message: "OTP expired. Please generate a new OTP"
      });
    }

    if (storedOtp.otp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP"
      });
    }

    const booking = await Booking.findOne({
      ticketNumber: ticketNumber,
      passengerEmail: email
    });

    if (!booking) {
      return res.json({
        success: false,
        message: "No booking found with this ticket number and email"
      });
    }

    if (booking.status === "Cancelled") {
      return res.json({
        success: false,
        message: "This booking is already cancelled"
      });
    }

    booking.status = "Cancelled";
    await booking.save();

    delete otpStore[`CANCEL_${ticketNumber}`];

    res.json({
      success: true,
      message: "OTP verified. Your flight has been cancelled successfully"
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Cancellation failed"
    });
  }
});

/* =========================
   FLIGHT STATUS SEARCH
========================= */

app.get("/api/flight-status/:searchValue", async (req, res) => {
  try {
    const searchValue = req.params.searchValue;

    const bookings = await Booking.find({
      $or: [
        { ticketNumber: searchValue },
        { flightNumber: searchValue }
      ]
    }).sort({ createdAt: -1 });

    if (!bookings || bookings.length === 0) {
      return res.json({
        success: false,
        message: "No flight or booking found with this ticket/flight number"
      });
    }

    res.json({
      success: true,
      bookings: bookings
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Flight status loading failed"
    });
  }
});

/* =========================
   ADMIN UPDATE BOOKING / FLIGHT STATUS
========================= */

app.put("/api/admin/bookings/status/:id", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.json({
        success: false,
        message: "Status is required"
      });
    }

    const allowedStatuses = [
      "Confirmed",
      "On Time",
      "Boarding",
      "Delayed",
      "Cancelled",
      "Departed"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status selected"
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true }
    );

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found"
      });
    }

    res.json({
      success: true,
      message: "Flight status updated successfully",
      booking: booking
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Status update failed"
    });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Avanta Airlines server running on port ${PORT}`);
});
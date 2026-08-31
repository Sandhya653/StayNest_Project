const express = require("express");
const router = express.Router({ mergeParams: true });

const bookingController = require("../controllers/bookings");
const { isLoggedIn } = require("../middleware");

router.get("/new",
    isLoggedIn,
    bookingController.renderForm
);

router.post("/",
    isLoggedIn,
    bookingController.createBooking
);

module.exports = router;
const Listing = require("../models/listing");
const Booking = require("../models/booking");

module.exports.renderForm = async (req, res) => {

    const listing = await Listing.findById(req.params.id);

    res.render("bookings/new.ejs", { listing });
};

module.exports.createBooking = async (req, res) => {

    const listing = await Listing.findById(req.params.id);

    const { checkIn, checkOut, guests } = req.body;

    const days =
    Math.ceil(
        (new Date(checkOut) - new Date(checkIn))
        / (1000 * 60 * 60 * 24)
    );

    const totalPrice = (guests/2)*days * listing.price;

    const booking = new Booking({

        listing: listing._id,
        user: req.user._id,
        checkIn,
        checkOut,
        guests,
        totalPrice

    });

    await booking.save();

    listing.bookings.push(booking);

    await listing.save();

    res.render("bookings/success.ejs", { booking, listing });

};
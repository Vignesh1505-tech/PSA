const pool = require("../config/db");
const { get } = require("../router/cab.router.js");
const { getSocket } = require("../socket.js");
const { sendMessageNotification } = require("../utils/push.notification.js");


const io = getSocket();


// API for cab booking
exports.cab_booking = async (req, res) => {

    const { userid,cab_id } = req.body;
    try {
        if ( !userid || !cab_id) return res.json({ message:"Body Data is Undefined Or Null" })

        const getUserData = await pool.query(
            'SELECT * FROM tbl_user WHERE userid = $1 RETURNING *', [userid]);

        const CabDataGet = await pool.query(
            'SELECT * FROM tbl_cab_details WHERE cab_id = $1 RETURNING *', [cab_id]);
        
        if(getUserData.rows.length == 0) return res.json({message:"User Not Found"})

        const InsertBookedData = await pool.query(
            'INSERT INTO tbl_booking (userid,cab_id) VALUES ($1,$2) RETURNING *', [userid,cab_id]);

        console.log("cab----",InsertBookedData);

        if ( InsertBookedData.rowCount === 0 ) return res.json({ message: "Data Not Booked" })

        io.to(CabDataGet.rows[0].userid).emit("booking",getUserData.rows[0].name)
        // const sendMessage = await 

        return res.status(200).json({ Data: InsertBookedData.rows , message:"Cab Booked SuccessFully" })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message:'Internal Server Error'});
    }
};


// API for cab booking status update
exports.booking_status_update = async (req, res) => {

    const { booking_id,book_status } = req.params;
    try {
        if ( !book_status ) return res.json({ message:"Body Data is Undefined Or Null" })

        const UdateBookingStatus = await pool.query(
            'UPDATE tbl_booking SET booked = $1 WHERE booking_id = $2 RETURNING *', [book_status,booking_id]);

        console.log("cab----",UdateBookingStatus);

        if ( UdateBookingStatus.rowCount === 0 ) return res.json({ message: "Booking Status Not Updated" })

        return res.status(200).json({ Data: UdateBookingStatus.rows , message:"Status Updated" })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message:'Internal Server Error'});
    }
};
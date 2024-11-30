const pool = require("../config/db")


// API to post bus details
exports.addBus = async (req, res) => {
    const  { bus_data }  = req.body;
    console.log("bus_data.length",bus_data.length)
    // console.log("busData",bus_data)

    if (!Array.isArray(bus_data) || bus_data.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid input format' });
    }
    for (const { bus_name, from_city, to_city, departure_time,route,schedule } of bus_data) {
        if (!bus_name || !from_city || !to_city || !departure_time || !route ) {
            return res.status(400).json({ success: false, message: 'All fields are required for each bus entry' });
        }
        try {
            const result = await pool.query(
                `INSERT INTO tbl_bus_schedule (bus_name, from_city, to_city, departure_time,route,schedule)
                 VALUES ($1, $2, $3, $4,$5,$6) RETURNING *`,
                [bus_name, from_city, to_city, departure_time,route,schedule]
            );
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Error adding bus details' });
        }
    }
    res.json({ success: true, message: 'All bus details added successfully' });
};



// Bus Search API
exports.searchBus = async (req, res) => {

    const { from_city, to_city } = req.body;
    try {
        const BusDataGet = await pool.query('SELECT * FROM tbl_bus_schedule WHERE from_city = $1 AND to_city = $2', [from_city, to_city]);

        if ( BusDataGet.rows.length === 0 ) return res.json({ message: "No Buses In This City" })

        return res.status(200).json({ Data: BusDataGet.rows , message:"Bus Data Get SuccessFully" })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message:'Internal Server Error'});
    }
};

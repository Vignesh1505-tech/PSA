const pool = require("../config/db")


// API to post Train details
exports.addTrain = async (req, res) => {
    const  { train_data }  = req.body;
    console.log("train_data.length",train_data.length)
    // console.log("busData",bus_data)

    if (!Array.isArray(train_data) || train_data.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid input format' });
    }
    for (const { train_no, from_city, to_city, departure_time,route } of train_data) {
        if (!train_no || !from_city || !to_city || !departure_time || !route ) {
            return res.status(400).json({ success: false, message: 'All fields are required for each train entry' });
        }
        try {
            const result = await pool.query(
                `INSERT INTO tbl_train_schedule (train_no, from_city, to_city, departure_time,route)
                 VALUES ($1, $2, $3, $4,$5) RETURNING *`,
                [train_no, from_city, to_city, departure_time,route]
            );
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Error adding train details' });
        }
    }
    res.json({ success: true, message: 'All train details added successfully' });
};




// Train Search API
exports.searchTrain = async (req, res) => {

    const { from_city, to_city } = req.body;
    try {
        const TrainDataGet = await pool.query('SELECT * FROM tbl_train_schedule WHERE from_city = $1 AND to_city = $2', [from_city, to_city]);

        if ( TrainDataGet.rows.length === 0 ) return res.json({ message: "No Train In This City" })

        return res.status(200).json({ Data: TrainDataGet.rows , message:"Train Data Get SuccessFully" })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message:'Internal Server Error'});
    }
};


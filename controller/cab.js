const pool = require("../config/db")


// API to post Cab details
exports.cabPost = async (req, res) => {
  const { driver_name, car_name, car_number,journey_date, driver_license, from_city, to_city, fair, timing, seat_available } = req.body;

  // Validate input data
  if (!driver_name || !car_name || !car_number || !driver_license || !from_city || !to_city || !fair || !timing || !seat_available || !journey_date) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    // SQL query to insert data into the cab_details table
    const CabDataInsert = await pool.query(
      `INSERT INTO tbl_cab_details (driver_name, car_name, car_number, driver_license, from_city, to_city, fair, timing, seat_available,journey_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10) RETURNING *`,
      [driver_name, car_name, car_number, driver_license, from_city, to_city, fair, timing, seat_available,journey_date]
    );

    console.log("CabDataInsert.rows.length", CabDataInsert.rows.length)

    if (CabDataInsert.rows.length === 0) return res.json({ message: "Data Not Insert" })

    // Return success response with the inserted cab details
    return res.status(201).json({
      message: "Cab Posted successfully",
      cab: CabDataInsert.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// API for search cab
exports.searchCab = async (req, res) => {

  const { from_city, to_city, timing } = req.body;
  try {
    const CabDataGet = await pool.query('SELECT * FROM tbl_cab_details WHERE from_city = $1 AND to_city = $2 AND timing = $3', [from_city, to_city, timing]);

    if (CabDataGet.rows.length === 0) return res.json({ message: "No Cab In This City" })

    return res.status(200).json({ Data: CabDataGet.rows, message: "Cab Data Get SuccessFully" })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


// API for Get All Cab
exports.getCabData = async (req, res) => {
  try {
    const AllCabDataGet = await pool.query('SELECT * FROM tbl_cab_details');

    if (AllCabDataGet.rows.length === 0) return res.json({ message: "No Cab Post Data" })

    return res.status(200).json({ Data: AllCabDataGet.rows, message: "Cab Post Data Get SuccessFully" })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


// API for edit post data
exports.PostDataUpdate = async (req, res) => {
  const { driver_name, car_name,journey_date, car_number, driver_license, from_city, to_city, fair, timing, seat_available,cab_id } = req.body;

  // Validate input data
  if (!driver_name || !car_name || !car_number || !journey_date || !driver_license || !from_city || !to_city || !fair || !timing || !seat_available) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    // SQL query to update data in the cab_post detail
    const CabPostDataUpdate = await pool.query(
      `UPDATE tbl_cab_details
      SET 
      driver_name = $1, car_name = $2, car_number = $3, driver_license = $4, from_city = $5, to_city = $6, fair = $7, timing = $8, seat_available = $9,journey_date=$10
      WHERE cab_id = $11
      RETURNING *`,
      [driver_name, car_name, car_number, driver_license, from_city, to_city, fair, timing, seat_available,journey_date,cab_id]
    );
    console.log("CabDataInsert.rows.length", CabPostDataUpdate.rows)

    if (CabPostDataUpdate.rows.length === 0) return res.json({ message: "Data Not Updated" })

    // Return success response with the inserted cab details
    return res.status(201).json({
      message: "Cab Posted Data Updated Successfully",
      cab: CabPostDataUpdate.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// API for Delete post
exports.DeletePostData = async (req, res) => {
  try {
    const {cab_id} = req.params;

    const deletePost = await pool.query('DELETE FROM tbl_cab_details WHERE cab_id = $1',[cab_id]);

    console.log("deletePost",deletePost);

    if (deletePost.rowCount === 0) return res.json({ message: "No cab available for post-delete" })

    return res.status(200).json({ message: "Cab Deleted Successfully" })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
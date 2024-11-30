const twilio = require("twilio")
const pool = require("../config/db");
const { generateOTP } = require("../utils/generate.otp");
const { hashPassword,comparePasswords } = require("../utils/hashData");
const { sendOtp } = require("../utils/sentOtp")
const { jwtToken,refreshToken } = require("../utils/jwtToken")
const { encrypt } = require("../utils/crypto");
const { Pool } = require("pg");


const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = twilio(accountSid, authToken);


// Send OTP
exports.sendOtpApi = async (req, res) => {
  try {
      const { name,mobile_no } = req.body;
      const otp = generateOTP();
      console.log("Generated OTP:", otp);
      const hashedOtp = await hashPassword(otp);
      console.log("Hashed OTP:", hashedOtp);

      const otpSent = await sendOtp(mobile_no, otp);
      console.log("OTP sent status:", otpSent);

      if (otpSent) {
          const userExist = await pool.query(`SELECT * FROM tbl_user WHERE mobile_no = $1`, [mobile_no]);
          if (userExist.rowCount > 0) {
              const updateOTP = await pool.query(`
                  UPDATE tbl_user SET otp = $1 WHERE mobile_no = $2`, [hashedOtp, mobile_no]);
              return res.status(200).json({ message: "User OTP updated" });
          } else {  
              const userRegister = await pool.query(`
                  INSERT INTO tbl_user (mobile_no, otp,name) VALUES ($1, $2,$3)`, [mobile_no, hashedOtp,name]);
              return res.status(201).json({ message: "User OTP created" });
          }
      } else {
          return res.status(500).json({ message: "OTP not sent" });
      }
  } catch (error) {
      console.error("Internal Server Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
  }
};


// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { mobile_no, otp } = req.body;
  try {
    // Query to check if the user exists and fetch the stored OTP
    const { rows } = await pool.query(
      `SELECT * FROM tbl_user WHERE mobile_no = $1`,
      [mobile_no]
    );
    if (rows.length > 0) {
      // Compare the entered OTP with the stored OTP
      const isMatched = await comparePasswords(otp.toString(), rows[0].otp);
      console.log('OTP Match:', isMatched);

      if (!isMatched) {
        return res.status(401).json({ error: "Invalid OTP" });
      }
      // Generate tokens
      const token = await jwtToken(rows[0].userid); // Implement this function
      const refresh = await refreshToken(rows[0].userid); // Implement this function
      const encryptedToken = encrypt(refresh);
      const options = { httpOnly: true };
      
      return res
        .status(200)
        .cookie("token", token, options)
        .json({
          message: "OTP Verify Successfully",
          token,
          UserId: rows[0].userid,
          encryptedToken,
        });
    } else {
      return res.status(401).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


// fcm token update 
exports.UserTokenUpdate = async (req, res) => {
  console.log("tokentoken", req.body);
  const { fcm_token, userid } = req.body;
  console.log(fcm_token, userid);
  try {
    // Query to update the token for the given userId
    const UpdateToken = await pool.query(
      "UPDATE tbl_user SET fcm_token = $1 WHERE userid = $2",
      [fcm_token, userid]
    );
    // If the update was successful, send a success message
    if (UpdateToken.rowCount > 0) {
      return res
        .status(200)
        .send({ success: true, message: "Token saved successfully" });
    } else {
      return res
        .status(404)
        .send({ success: false, message: "Token Not Updated" });
    }
  } catch (error) {
    console.error("Error updating token:", error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};
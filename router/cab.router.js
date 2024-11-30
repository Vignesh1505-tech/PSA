const express = require("express");
const { 
    cabPost, 
    searchCab,
    getCabData,
    PostDataUpdate,
    DeletePostData
 } = require("../controller/cab")

const cabRouter = express.Router();

cabRouter.post("/create/post", cabPost)
cabRouter.post("/filter", searchCab)
cabRouter.get("/all/cabData", getCabData)
cabRouter.put("/edit/post/data", PostDataUpdate)
cabRouter.delete("/post/delete/:cab_id", DeletePostData)



module.exports = cabRouter;
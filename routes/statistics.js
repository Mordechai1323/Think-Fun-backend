const express = require("express");
const { auth } = require("../middlewares/auth");
const router = express.Router();

router.get("/",auth, async (req, res) => {
 try{
    let data 
 }
 catch(err){
    console.log(err);
    res.status(502).json({err})
 }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const user_controler = require("../controller/controller");

router.post("/auth/signup");
router.post("/auth/login");
router.post("/products");
router.get("/products");
router.get("/products/:id");
router.put("/products/:id");
router.delete("/products/:id");
router.post("/cart");
router.get("/cart");
router.put("/cart/:productId");
router.delete("/cart/:productId");
router.post("/order");
router.get("/order/:id");
router.get("/orders");

module.exports = router;

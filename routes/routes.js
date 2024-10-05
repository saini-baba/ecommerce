const express = require("express");
const router = express.Router();
const user_controler = require("../controller/controller");
const middleware = require("../middleware/middleware");

router.post("/auth/signup", user_controler.reg);
router.post("/auth/login", user_controler.login);
router.post("/products", middleware.admin_auth, user_controler.add_product);
router.get("/products",middleware.user_auth, user_controler.all_product);
router.get("/products/:id", middleware.user_auth, user_controler.id_product);
router.put(
  "/products/:id",
  middleware.admin_auth,
  user_controler.update_product
);
router.delete(
  "/products/:id",
  middleware.admin_auth,
  user_controler.delete_product
);
router.post("/cart", middleware.user_auth,user_controler.add_cart);
router.get("/cart",middleware.user_auth,user_controler.show_cart);
router.put(
  "/cart/:productId",
  middleware.user_auth,
  user_controler.edit_cart
);
router.delete(
  "/cart/:productId",
  middleware.user_auth,
  user_controler.delete_product_cart
);
router.post("/order", middleware.user_auth, user_controler.order);
router.get("/order/:id", middleware.user_auth, user_controler.id_order);
router.get("/orders", middleware.admin_auth, user_controler.show_order);
router.put("/status", middleware.admin_auth, user_controler.status);

module.exports = router;

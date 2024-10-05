const jwt = require("jsonwebtoken");
const { User, Product, Category, Cart, Order } = require("../model/model");

exports.user_auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send("No token found");
    }
    const token = authHeader.split(" ")[1];

    jwt.verify(token, "top_secret_key", async (err, decoded) => {
      if (err) {
        return res.status(401).send("Invalid token");
      }

      const foundUser = await User.findOne({
        where: { email: decoded.email },
      });
      if (!foundUser) {
        return res.status(404).send("User not found");
      }
      req.user = foundUser;
      //   console.log(token);
      next();
    });
  } catch (error) {
    console.error("Error", error);
    return res.status(500).send("Internal Server Error");
  }
};

exports.admin_auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send("No token found");
    }
    const token = authHeader.split(" ")[1];

    jwt.verify(token, "top_secret_key", async (err, decoded) => {
      if (err) {
        return res.status(401).send("Invalid token");
      }

      const foundUser = await User.findOne({
        where: { email: decoded.email },
      });
      if (!foundUser) {
        return res.status(404).send("User not found");
      }
      if (foundUser.role.toLowerCase() === "admin") {
        req.user = foundUser;
        //   console.log(token);
        next();
      } else {
        res.status(401).send("only admin allowed here");
      }
    });
  } catch (error) {
    console.error("Error", error);
    return res.status(500).send("Internal Server Error");
  }
};


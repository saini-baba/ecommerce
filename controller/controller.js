const { User, Product, Category, Cart, Order } = require("../model/model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


exports.reg = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "pls enter correct email" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters, include an uppercase, lowercase, number, and special character",
      });
    }

    const nameRegex = /^[A-Z][a-z]+\s[A-Z][a-z]+(?:\s[A-Z][a-z]+)*$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({ error: "pls enter correct name" });
    }

    const sameemail = await User.findOne({ where: { email: email } });
    if (sameemail) {
      res.status(400).send("user already Exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    if (role == "admin" || role == "user") {
      await User.create({
        name: name,
        password: hashedPassword,
        email: email,
        role: role,
      });
      res.status(200).send("user Registered");
    } else {
      res.status(400).send("pls enter correct role");
    }
  } catch (error) {
    console.error("Error", error);
    return res.status(500).send("Internal Server Error", error);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const foundUser = await User.findOne({ where: { email: email } });
    if (!foundUser) {
      return res.status(404).send("pls enter correct credentials");
    } else {
      const passwordMatch = await bcrypt.compare(password, foundUser.password);
      if (!passwordMatch) {
        return res.status(404).send("pls enter correct credentials");
      }
      const userData = foundUser.toJSON();
      delete userData.password;
      const token = jwt.sign(userData, "top_secret_key", {
        expiresIn: "10h",
      });
      res.status(200).json(token);
    }
  } catch (error) {
    console.error("Error in login", error);
    res.status(500).send("pls enter correct credentials");
  }
};

exports.add_product = async (req, res) => {
  const { name, price, description, quantity, category, imageurl } = req.body;
  if (
    ["electronic items", "furniture", "office item"].includes(
      category.toLowerCase()
    )
  ) {
    const existingProduct = await Product.findOne({ where: { name: name } });
    if (existingProduct) {
      return res.status(400).send("product with this name already exists");
    }
    const newProduct = await Product.create({
      name: name,
      price: price,
      description: description,
      quantity: quantity,
      category: category,
      imageurl: imageurl,
    });

    await Category.create({
      product_id: newProduct.id,
      product_category: category,
    });
    res.status(200).send("product registered successfully");
  } else {
    res.status(400).send("pls enter correct category");
  }
};

exports.all_product = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error", error);
    res.status(500).send("Internal server error");
  }
};

exports.id_product = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findOne({ where: { id: id } });
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error", error);
    res.status(500).send("Internal server error");
  }
};

exports.update_product = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, quantity, category, imageurl } = req.body;

  try {
    const product = await Product.findOne({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    if (
      !name &&
      !price &&
      !description &&
      !quantity &&
      !category &&
      !imageurl
    ) {
      return res.status(400).json({ message: "no fields to update" });
    }

    const updatedProduct = await Product.update(
      {
        name: name || product.name,
        price: price !== undefined ? price : product.price,
        description: description || product.description,
        quantity: quantity !== undefined ? quantity : product.quantity,
        category: category || product.category,
        imageurl: imageurl || product.imageurl,
      },
      {
        where: { id },
      }
    );

    if (updatedProduct[0] === 0) {
      return res.status(400).send("No updates");
    }
    res.status(200).send("product updated successfully");
  } catch (error) {
    console.error("Error", error);
    res.status(500).send("Internal server error");
  }
};

exports.delete_product = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Product.destroy({
      where: { id },
    });

    if (deleted) {
      res.status(200).send("product deleted successfully");
    } else {
      res.status(404).send("product not found");
    }
  } catch (error) {
    console.error("Error", error);
    res.status(500).send("Internal server error");
  }
};

exports.add_cart = async (req, res) => {
  const { product_id, quantity } = req.body;
  const user = req.user;
  const product = await Product.findOne({
    where: {
      id: product_id,
      deletedAt: null,
    },
  });
  if (!product) {
    return res.status(404).send("product not found");
  }
  if (product.quantity >= quantity) {
    const cartItems = await Cart.findOne({
      where: {
        user_id: user.id,
        product_id: product_id,
      },
    });
    if (!cartItems) {
      const newcart = await Cart.create({
        product_id: product_id,
        quantity: quantity,
        user_id: user.id,
      });
      if (newcart) {
        res.status(201).send("added to cart");
      } else {
        res.status(404).send("no such product");
      }
    } else {
      res.status(400).send("product already in cart");
    }
  } else {
    res.status(500).send("insufficient quantity");
  }
};

exports.show_cart = async (req, res) => {
  const user = req.user;
  try {
    const cartItems = await Cart.findAll({ where: { user_id: user.id } });
    if (cartItems.length === 0) {
      return res.status(404).json({ message: "Cart is empty" });
    }
    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).send("Internal server error");
  }
};

exports.edit_cart = async (req, res) => {
  const { quantity } = req.body;
  const user = req.user;
  const { productId } = req.params;
  try {
    const cartItem = await Cart.findOne({
      where: {
        user_id: user.id,
        product_id: productId,
      },
    });
    if (cartItem) {
      const updatedCart = await cartItem.update({ quantity });
      if (updatedCart) {
        return res.status(200).send("cart updated successfully");
      } else {
        return res.status(400).send("no updates");
      }
    } else {
      return res.status(404).send("no such product");
    }
  } catch (error) {
    console.error("Error", error);
    res.status(500).send("Internal server error");
  }
};

exports.delete_product_cart = async (req, res) => {
  const user = req.user;
  const { productId } = req.params;
  try {
    const cartItem = await Cart.findOne({
      where: {
        user_id: user.id,
        product_id: productId,
      },
    });
    if (cartItem) {
      await cartItem.destroy();
      return res.status(200).send("product deleted");
    } else {
      return res.status(404).send("no such product");
    }
  } catch (error) {
    console.error("Error", error);
    res.status(500).send("Internal server error");
  }
};

exports.order = async (req, res) => {
  const user = req.user;
  try {
    const cart_Items = await Cart.findAll({
      where: {
        user_id: user.id,
        deletedAt: null,
      },
    });

    if (cart_Items.length === 0) {
      return res.status(404).json({ message: "cart empty" });
    }
    // console.log(cart_Items);
    for (let item of cart_Items) {
      const product = await Product.findOne({ where: { id: item.product_id } });
      if (!product || product.quantity < item.quantity) {
        return res.status(400).send(`${product.name} is out of stock`);
      }
    }
    let total_Price = 0;
    for (let item of cart_Items) {
      const product = await Product.findOne({ where: { id: item.product_id } });
      await product.update({
        quantity: product.quantity - item.quantity,
      });
      total_Price += product.price * item.quantity;
    }

    const product_Ids = cart_Items.map((item) => item.product_id);

    const newOrder = await Order.create({
      user_id: user.id,
      product_ids: product_Ids.join(","),
      total_price: total_Price,
      status: "pending",
    });

    await Cart.destroy({
      where: { user_id: user.id },
    });

    res
      .status(201)
      .json({ message: "order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).send("Internal server error");
  }
};

exports.show_order = async (req, res) => {
  try {
    const order_Items = await Order.findAll();
    if (order_Items.length === 0) {
      return res.status(404).json({ message: "order is empty" });
    }
    res.status(200).json(order_Items);
  } catch (error) {
    console.error("Error", error);
    res.status(500).send("Internal server error");
  }
};

exports.id_order = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  try {
    const order_Item = await Order.findOne({
      where: {
        user_id: user.id,
        id: id,
      },
    });
    if (!order_Item) {
      res.status(204).send("No order");
    } else {
      res.status(200).json(order_Item);
    }
  } catch (error) {
    console.error("Error", error);
    res.status(500).send("Internal server error");
  }
};

exports.status = async (req, res) => {
  const { status, id } = req.body; 
  try {
    const order = await Order.findOne({ where: { id: id } });
    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }
    const updatedOrder = await order.update({ status: status });
    res
      .status(200)
      .json({
        message: "order status updated",
        order: updatedOrder,
      });
  } catch (error) {
    console.error("Error", error);
    res.status(500).send("Internal server error");
  }
};


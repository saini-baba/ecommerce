const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./db/db");
const user_route = require("./routes/routes");
app.use(cors());
app.use(express.json());
app.use("/user", user_route);
app.listen(3200, () => {
  console.log("running");
});

const { User } = require("../model/model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

exports.reg = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Password validation (at least 8 characters, one uppercase, one lowercase, one number, and one special character)
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                error: "Password must be at least 8 characters, include an uppercase, lowercase, number, and special character",
            });
        }

        // Phone validation (ensure phone number contains exactly 10 or more digits)
        const phoneRegex = /^\d{10,}$/;
        if (!phoneRegex.test(phone)) {
            return res
                .status(400)
                .json({ error: "Phone number must be at least 10 digits" });
        }

        // Name validation (ensure it's a full name, contains two or more words, each word starts with a capital letter)
        const nameRegex = /^[A-Z][a-z]+\s[A-Z][a-z]+(?:\s[A-Z][a-z]+)*$/;
        if (!nameRegex.test(name)) {
            return res.status(400).json({ error: "Invalid full name format" });
        }

        const sameemail = await User.findOne({ where: { email: email } });
        if (sameemail) {
            res.status(400).send("User already Exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        if (role == "admin" || role == "user") {
            await User.create({
                name: name,
                password: hashedPassword,
                email: email,
                phone_no: phone,
                role: role,
            });
            res.status(200).send("User Registered Successfully");
        } else {
            res.status(400).send("pls enter correct role");
        }
    } catch (error) {
        console.error("Error during registration", error);
        return res.status(500).send("Internal Server Error", error);
    }
};

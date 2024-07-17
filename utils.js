const bcrypt = require("bcryptjs");

//! Function to hash PIN
async function hashPin (pin) {
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);

    // Hash the PIN along with the salt
    const hashedPin = await bcrypt.hash(pin, salt);

    return hashedPin;
  } catch (error) {
    console.error("Error hashing PIN:", error);
    throw new Error("Error hashing PIN");
  }
};

module.exports = { hashPin };
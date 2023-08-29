const Router = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const router = new Router();

router.post(
  "/registration",
  [
    check("email", "Некорректный емайл").isEmail(),
    check(
      "password",
      "Пароль должен быть больше 3 но меньше 12 символов"
    ).isLength({ min: 3, max: 12 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: "Не корректный запрос", errors });
      }

      const { email, password } = req.body;
      console.log({ email, password });
      const canDidate = await User.findOne({ email });

      if (canDidate) {
        return res
          .status(400)
          .json({ message: `Пользователь с емайлом ${email}существует` });
      }
      const hasPassword = await bcrypt.hash(password, 3);
      const user = new User({ email, password: hasPassword });
      await user.save();
      return res.json({ message: "Пользователь создан" });
    } catch (error) {
      console.log(error);
      res.send({ message: "server error" });
    }
  }
);

module.exports = router;

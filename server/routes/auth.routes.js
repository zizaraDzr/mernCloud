const Router = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const router = new Router();
const authMiddleware = require("../middleware/auth.middleware");
const File = require("../models/File");
const fileService = require("../services/fileService");

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
      await fileService.createDir(new File({ user: user.id, name: "" }));
      return res.json({ message: "Пользователь создан" });
    } catch (error) {
      console.log(error);
      res.send({ message: "server error" });
    }
  }
);

// {
//   "email": "test3@mai.ru",
//   "password": "333"
// }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res
        .status(404)
        .json({ message: `Пользователь с ${email} не найден` });
    }
    const isValidPass = bcrypt.compareSync(password, user.password);
    if (!isValidPass) {
      return res.status(400).json({ message: `Неверный пароль` });
    }
    const token = jwt.sign({ id: user.id }, config.get("secretKey"), {
      expiresIn: "1h",
    });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        diskSpace: user.diskSpace,
        userSpace: user.userSpace,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.log(error);
    res.send({ message: "server error" });
  }
});

router.get("/auth", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    const token = jwt.sign({ id: user.id }, config.get("secretKey"), {
      expiresIn: "1h",
    });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        diskSpace: user.diskSpace,
        usedSpace: user.usedSpace,
        avatar: user.avatar,
      },
    });
  } catch (e) {
    console.log(e);
    res.send({ message: "Server error" });
  }
});

module.exports = router;

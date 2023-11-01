const FileService = require("../services/fileService");
const User = require("../models/User");
const File = require("../models/File");

class FileController {
  async creareDir(req, res) {
    try {
      const { name, type, parent } = req.body;
      const file = new File({ name, type, parent, user: req.user.id });
      console.log({ file });

      const parentFile = await File.findOne({ _id: parent });
      console.log({ parentFile });

      if (!parentFile) {
        file.path = name;
        console.log({ name });

        await FileService.createDir(file);
      } else {
        file.path = `${parentFile.path}\\${file.name}`;
        await FileService.createDir(file);
        parentFile.childs.push(file._id);
        await parentFile.save();
      }

      await file.save();
      return res.json(file);
    } catch (error) {
      return res.status(400).json(error);
    }
  }

  async getFiles(req, res) {
    try {
      const files = await File.find({
        user: req.user.id,
        parent: req.query.parent,
      });
      return res.json(files);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "can not get files" });
    }
  }
}

module.exports = new FileController();

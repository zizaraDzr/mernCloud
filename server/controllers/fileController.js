const FileService = require("../services/fileService");
const config = require("config");
const fs = require("fs");
const User = require("../models/User");
const File = require("../models/File");

class FileController {
  async creareDir(req, res) {
    try {
      const { name, type, parent } = req.body;
      const file = new File({ name, type, parent, user: req.user.id });
      console.warn("creareDir", { file });

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
      const {sort} = req.query
      let files
      switch (sort) {
        case 'name':
            files = await File.find({user: req.user.id, parent: req.query.parent}).sort({name:1})
            break
        case 'type':
            files = await File.find({user: req.user.id, parent: req.query.parent}).sort({type:1})
            break
        case 'date':
            files = await File.find({user: req.user.id, parent: req.query.parent}).sort({date:1})
            break
        default:
            files = await File.find({user: req.user.id, parent: req.query.parent})
            break;
      }
      return res.json(files);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "can not get files" });
    }
  }

  async uploadFile(req, res) {
    try {
      const file = req.files.file;
      console.log('fileController uploadFile', file)

      const parent = await File.findOne({
        user: req.user.id,
        _id: req.body.parent,
      });
      console.log('fileController uploadFile', {parent})

      const user = await User.findOne({ _id: req.user.id });

      if (user.usedSpace + file.size > user.diskSpace) {
        return res.status(400).json({ message: "There no space on the disk" });
      }

      user.usedSpace = user.usedSpace + file.size;

      let path;
      if (parent) {
        path = `${config.get("filePath")}\\${user._id}\\${parent.path}\\${file.name}`;
        // path = `${config.get("filePath")}\\${user._id}\\${parent.path}`;
      } else {
        path = `${config.get("filePath")}\\${user._id}\\${file.name}`;
        // path = `${config.get("filePath")}\\${user._id}`;
      }
      console.log('fileController uploadFile', {path})

      if (fs.existsSync(path)) {
        return res.status(400).json({ message: "File already exist" });
      }
      console.log('fileController uploadFile', {path})
      file.mv(path);

      const type = file.name.split(".").pop();
      let filePath = file.name
      if (parent) {
          // filePath = parent.path + "\\" + file.name
          filePath = parent.path 
      }
      console.log('fileController uploadFile', {filePath})
      const dbFile = new File({
        name: file.name,
        type,
        size: file.size,
        path: filePath,
        parent: parent?._id,
        user: user._id,
      });

      await dbFile.save();
      await user.save();

      res.json(dbFile);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Upload error" });
    }
  }
  async searchFile(req, res) {
    try {
        const searchName = req.query.search
        let files = await File.find({user: req.user.id})
        files = files.filter(file => file.name.includes(searchName))
        return res.json(files)
    } catch (e) {
        console.log(e)
        return res.status(400).json({message: 'Search error'})
    }
}
  async downloadFile(req, res) {
    console.log(this)
    try {
      const file = await File.findOne({ _id: req.query.id, user: req.user.id });

      console.log("filecontroller downloadFile", { file });

      let path = ''
      if (file.path && file.type !== 'dir' && file.path !== file.name) {
        path = config.get("filePath") + "\\" + req.user.id + "\\" + file.path + "\\" + file.name;
      } else {
        path = config.get("filePath") + "\\" + req.user.id + "\\" + file.path;
      }

        console.log("filecontroller downloadFile", {path} )
      if (fs.existsSync(path)) {
        return res.download(path, file.name);
      }
      return res.status(400).json({ message: "Download error" });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Download error" });
    }
  }
  async deleteFile(req, res) {
    try {
        const file = await File.findOne({_id: req.query.id, user: req.user.id})
        console.log({file})
        if (!file) {
            return res.status(400).json({message: 'file not found'})
        }
        FileService.deleteFile(file, req, res)
        await file.deleteOne()
        return res.json({message: 'File was deleted'})
    } catch (e) {
        console.log(e)
        return res.status(400).json({message: 'Dir is not empty'})
    }
  }
}

module.exports = new FileController();

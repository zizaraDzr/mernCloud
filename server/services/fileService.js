const fs = require("fs");
const file = require("../models/File");
const config = require("config");

class FileService {
  createDir(file) {
    const filePath = `${config.get("filePath")}\\${file.user}\\${file.path}`;
    console.log({ filePath });
    console.log(fs.existsSync(filePath));
    return new Promise((resolve, reject) => {
      try {
        if (!fs.existsSync(filePath)) {
          fs.mkdirSync(filePath);
          return resolve({ message: "File was created" });
        } else {
          return reject({ message: "File already exist" });
        }
      } catch (error) {
        return reject({ message: "File error" });
      }
    });
  }
  deleteFile(file, req) {
    const path = this.getPath(file,req)
    if (file.type === 'dir') {
        fs.rmdirSync(path)
    } else {
        fs.unlinkSync(path)
    }
}

  getPath(file,req) {
    // let path = ''
        if (file.path && file.type !== 'dir' && file.path !== file.name) {
          return config.get("filePath") + "\\" + req.user.id + "\\" + file.path + "\\" + file.name;
        } else {
          return config.get("filePath") + "\\" + req.user.id + "\\" + file.path;
        }
      // return config.get('filePath') + '\\' + file.user + '\\' + file.path
  }
}

module.exports = new FileService();

import express from "express";
import md5 from "blueimp-md5";
import multer from "multer";
import path from "path";
import fs from "fs";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import UserModel from "../models/UserModel.js";
import CategoryModel from "../models/CategoryModel.js";
import ProductModel from "../models/ProductModel.js";
import RoleModel from "../models/RoleModel.js";

const router = express.Router();
const filter = { password: 0, __v: 0 };
const __dirname = dirname(fileURLToPath(import.meta.url));

// POST: login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  UserModel.findOne({ username, password: md5(password) })
    .then((user) => {
      if (user) {
        res.cookie("userid", user._id, { maxAge: 1000 * 60 * 60 * 24 });
        if (user.role_id) {
          RoleModel.findOne({ _id: user.role_id }).then((role) => {
            user._doc.role = role;
            console.log("role user", user);
            res.send({ status: 0, data: user });
          });
        } else {
          user._doc.role = { menus: [] };
          res.send({ status: 0, data: user });
        }
      } else {
        res.send({ status: 1, msg: "incorrect username or password!" });
      }
    })
    .catch((error) => {
      console.log(error);
      res.send({ status: 1, msg: "login failure, please try later." });
    });
});

// POST: add user
router.post("/manage/user/add", (req, res) => {
  const { username, password } = req.body;
  UserModel.findOne({ username })
    .then((user) => {
      if (user) {
        res.send({ status: 1, msg: `username ${username} already exists!` });
        return new Promise(() => {});
      } else {
        return UserModel.create({
          ...req.body,
          password: md5(password || "123"),
        });
      }
    })
    .then((user) => {
      res.send({ status: 0, data: user });
    })
    .catch((error) => {
      console.log(error);
      res.send({
        status: 1,
        msg: "create user error, please try again later.",
      });
    });
});

// POST: update user
router.post("/manage/user/update", (req, res) => {
  const user = req.body;
  UserModel.findOneAndUpdate({ _id: user._id }, user)
    .then((oldUser) => {
      const data = Object.assign(oldUser, user);
      res.send({ status: 0, data });
    })
    .catch((error) => {
      console.log(error);
      res.send({
        status: 1,
        msg: "failed updating user, please try again later.",
      });
    });
});

// POST: delete user
router.post("/manage/user/delete", (req, res) => {
  const { userID } = req.body;
  UserModel.deleteOne({ _id: userID }).then((doc) => {
    res.send({ status: 0 });
  });
});

// GET: all user list
router.get("/manage/user/list", (req, res) => {
  UserModel.find({ username: { $ne: "admin" } })
    .then((users) => {
      RoleModel.find().then((roles) => {
        res.send({ status: 0, data: { users, roles } });
      });
    })
    .catch((error) => {
      console.log(error);
      res.send({
        status: 1,
        msg: "failed obtaining user list, please try again later.",
      });
    });
});

//POST: add category
router.post("/manage/category/add", (req, res) => {
    const { categoryName, parentID } = req.body;
    //console.log('category info: ', categoryName, parentID)
  CategoryModel.create({ name: categoryName, parentID: parentID || "0" })
    .then((category) => {
      res.send({ status: 0, data: category });
    })
    .catch((error) => {
      console.log(error);
      res.send({
        status: 1,
        msg: "failed creating category, please try again later.",
      });
    });
});

//GET: category list
router.get("/manage/category/list", (req, res) => {
  const parentID = req.query.parentID || "0";
  CategoryModel.find({ parentID })
    .then((categories) => {
      res.send({ status: 0, data: categories });
    })
    .catch((error) => {
      console.log(error);
      res.send({
        status: 1,
        msg: "failed getting catagory list, please try agina later.",
      });
    });
});

//POST: update category name
router.post("/manage/category/update", (req, res) => {
  const { categoryID, categoryName } = req.body;
  CategoryModel.findOneAndUpdate({ _id: categoryID }, { name: categoryName })
    .then((oldCategory) => {
      res.send({ status: 0 });
    })
    .catch((error) => {
      console.log(error);
      res.send({
        status: 1,
        msg: "failed updating category, please try again later.",
      });
    });
});

//GET: get category info from ID
router.get("/manage/category/info", (req, res) => {
  const categoryID = req.query.categoryID;
  CategoryModel.findOne({ _id: categoryID })
    .then((category) => {
      res.send({ status: 0, data: category });
    })
    .catch((error) => {
      console.log(error);
      res.send({
        status: 1,
        msg: "failed getting category info, please try again later.",
      });
    });
});

//POST: add product
router.post("/manage/product/add", (req, res) => {
  const product = req.body;
  ProductModel.create(product)
    .then((p) => {
      res.send({ status: 0, data: p });
    })
    .catch((e) => {
      console.log(e);
      res.send({ status: 1, msg: "error adding product" });
    });
});

//GET: product list
router.get("/manage/product/list", (req, res) => {
  const { pageNum, pageSize } = req.query;
  ProductModel.find({})
    .then((products) => {
      res.send({ status: 0, data: pageFilter(products, pageNum, pageSize) });
    })
    .catch((e) => {
      console.log(e);
      res.send({ status: 1, msg: "error getting product list" });
    });
});

//GET: search for product
router.get("/manage/product/search", (req, res) => {
  const { pageNum, pageSize, searchName, productName, productDesc } = req.query;
  let condition = {};
  if (productName) {
    condition = { name: new RegExp(`^.*${productName}.*$`) };
  } else if (productDesc) {
    condition = { desc: new RegExp(`^.*${productDesc}.*$`) };
  }
  ProductModel.find(condition)
    .then((products) => {
      res.send({ status: 0, data: pageFilter(products, pageNum, pageSize) });
    })
    .catch((e) => {
      console.log(e);
      res.send({ status: 1, msg: "error searching for product" });
    });
});

//POST: update product
router.post("/manage/product/update", (req, res) => {
  const p = req.body;
  ProductModel.findOneAndUpdate({ _id: p._id }, p)
    .then((oldProd) => {
      res.send({ status: 0 });
    })
    .catch((e) => {
      console.log(e);
      res.send({ status: 1, msg: "error update produc" });
    });
});

//POST: product status
router.post("/manage/product/updateStatus", (req, res) => {
  const { productID, status } = req.body;
  ProductModel.findOneAndUpdate({ _id: productID }, { status })
    .then((oldProd) => {
      res.send({ status: 0 });
    })
    .catch((e) => {
      console.log(e);
      res.send({ status: 1, msg: "error updating product status" });
    });
});

//POST: add role
router.post("/manage/role/add", (req, res) => {
  const { roleName } = req.body;
  RoleModel.create({ name: roleName })
    .then((r) => res.send({ status: 0, data: r }))
    .catch((e) => {
      console.log(e);
      res.send({ status: 1, msg: "error adding role" });
    });
});

//GET: role list
router.get("/manage/role/list", (req, res) => {
  RoleModel.find()
    .then((roles) => {
      res.send({ status: 0, data: roles });
    })
    .catch((e) => {
      console.log(e);
      res.send({ status: 1, msg: "error getting role list" });
    });
});

//POST: role update
router.post("/manage/role/update", (req, res) => {
  const role = req.body;
  role.auth_time = Date.now();
  RoleModel.findOneAndUpdate({ _id: role._id }, role)
    .then((oldRole) => {
      res.send({ status: 0, data: { ...oldRole._doc, ...role } });
    })
    .catch((e) => {
      console.log(e);
      res.send({ status: 1, msg: "error updating role" });
    });
});

//

function pageFilter(arr, pageNum, pageSize) {
  pageNum = pageNum * 1;
  pageSize = pageSize * 1;
  const total = arr.length;
  const pages = Math.floor((total + pageSize - 1) / pageSize);
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize > total ? total : start + pageSize;
  const list = [];
  for (let i = start; i < end; i++) {
    list.push(arr[i]);
  }
  return { pageNum, total, pages, pageSize, list };
}

// file upload
const dirPath = path.join(__dirname, "..", "public/upload");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdir(dirPath, function (err) {
        if (err) {
          console.log(err);
        } else {
          cb(null, dirPath);
        }
      });
    } else {
      cb(null, dirPath);
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + ext);
  },
});

const upload = multer({ storage });
const uploadSingle = upload.single("image");

router.post("/manage/img/upload", (req, res) => {
    uploadSingle(req, res, function (err) {
    if (err) {
	return res.send({ status: 1, msg: "file upload error" });
    }
    const file = req.file;
    res.send({
      status: 0,
      data: {
        name: file.filename,
        url: "http://localhost:5000/upload/" + file.filename,
      },
    });
  });
});

router.post("/manage/img/delete", (req, res) => {
  const { name } = req.body;
  fs.unlink(path.join(dirPath, name), (err) => {
    if (err) {
      console.log(err);
      res.send({
        status: 1,
        msg: "error deleting file",
      });
    } else {
      res.send({ status: 0 });
    }
  });
});

export default router;

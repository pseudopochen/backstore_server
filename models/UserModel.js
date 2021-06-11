import mongoose from "mongoose";
import md5 from "blueimp-md5";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  phone: String,
  email: String,
  create_time: { type: Number, default: Date.now },
  role_id: String,
});

const UserModel = mongoose.model("users", userSchema);

UserModel.findOne({ username: "admin" }).then((user) => {
  if (!user) {
    UserModel.create({ username: "admin", password: md5("admin") }).then(
      (user) => {
        console.log("init username: admin, password: admin");
      }
    );
  }
});

export default UserModel;

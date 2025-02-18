import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      unique: true, 
      required: true 
    },
    password: { 
      type: String, 
      required: true 
    }, // Hashed password
    role: { 
      type: String, 
      enum: ["student", "guide"], 
      required: true 
    },
    guideId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      default: null,
      // required: function () { 
      //   return this.role === "student"; 
      // } 
    }, // Assigned guide (Only for students)
    department: { 
      type: String, 
      required: function () { 
        return this.role === "guide"; 
      } 
    }, // Required only for guides
  },
  { timestamps: true } // Adds createdAt & updatedAt
);

// Hash password before saving user 
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password is modified
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;

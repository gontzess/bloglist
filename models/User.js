import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: String,
  passwordHash: String,
  name: String,
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ],
});

userSchema.path('username').validate({
  async validator(value) {
    const count = await mongoose.models.User.countDocuments({ username: value });
    if (count > 0) {
      const err = new Error(`"${value}" already exists`);
      err.name = 'ValidationError';
      throw err;
    } else {
      return true;
    }
  },
});

userSchema.set('toJSON', {
  transform: (document, returnedObject, options) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;

    return returnedObject;
  }
});

const User = mongoose.model('User', userSchema);
const ObjectId = mongoose.Types.ObjectId;

export {
  User,
  ObjectId,
};

import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: 3,
  },
  author: String,
  url: {
    type: String,
    required: true,
    minLength: 5,
  },
  likes: {
    type: Number,
    default: 0,
    min: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
});

blogSchema.set('toJSON', {
  transform: (document, returnedObject, options) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;

    return returnedObject;
  }
});

const Blog = mongoose.model('Blog', blogSchema);

export { Blog };

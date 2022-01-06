import React, { useState } from 'react';
import blogService from '../services/blogs';

function NewBlogForm({ blogs, setBlogs }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [url, setUrl] = useState('');

  async function createNewBlog(event) {
    event.preventDefault();
    try {
      const blog = await blogService.create({ title, author, url });
      setBlogs(blogs.concat(blog));
      setTitle('');
      setAuthor('');
      setUrl('');
    } catch (error) {
      alert(error.response.data.error);
    }
  }

  return (
    <div className="formDiv">
      <h3>Create New</h3>
      <form onSubmit={createNewBlog}>
        <div>
          title: <input
            type="text"
            value={title}
            name="Title"
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author: <input
            type="text"
            value={author}
            name="Author"
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          url: <input
            type="text"
            value={url}
            name="Url"
            onChange={({ target }) => setUrl(target.value)}
          />
        </div>
        <button type="submit">create</button>
      </form>
    </div>
  );
}

export default NewBlogForm;

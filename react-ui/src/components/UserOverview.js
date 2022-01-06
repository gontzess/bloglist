import React from 'react';
import Blog from './Blog';
import NewBlogForm from './NewBlog';
import Togglable from './Togglable';
import blogService from '../services/blogs';

function UserOverview({ user, blogs, setBlogs, handleLogout }) {
  async function addLike(blogToUpdate) {
    try {
      const updatedBlog = await blogService.update(
        blogToUpdate.id,
        { likes: blogToUpdate.likes + 1 }
      );
      setBlogs(blogs.map(blog => {
        return blog.id === updatedBlog.id ? updatedBlog : blog;
      }));
    } catch (error) {
      alert(error.response.data.error);
    }
  }

  async function removeBlog(blogToRemove) {
    try {
      await blogService.remove(blogToRemove.id);
      setBlogs(blogs.filter(blog => blog.id !== blogToRemove.id));
    } catch (error) {
      alert(error.response.data.error);
    }
  }

  return (
    <div>
      <p>Welcome, {user.name}.</p>
      <button onClick={handleLogout} type="button">logout</button>
      <Togglable buttonLabel='create new blog'>
        <NewBlogForm blogs={blogs} setBlogs={setBlogs} />
      </Togglable>
      <h3>Current Blogs</h3>
      <div>
        {blogs.map(blog =>
          <Blog
            user={user}
            key={blog.id}
            blog={blog}
            addLike={({ event }) => addLike(blog)}
            deleteBlog={({ event }) => removeBlog(blog)}
          />
        )}
      </div>
    </div>
  );
}

export default UserOverview;

import React from 'react';

function Blog({ user, blog, addLike, deleteBlog }) {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  };

  return (
    <div style={blogStyle}>
      {blog.title} {blog.author}
      <div>
        <div>{blog.url}</div>
        <div>
          likes {blog.likes}
          <button onClick={addLike} type="button">like</button>
        </div>
        <div>{blog.user.name || user.name}</div>
        {blog.user.name === user.name
          ? <button onClick={deleteBlog} type="button">delete</button>
          : ''
        }
      </div>
    </div>
  );
}

export default Blog;

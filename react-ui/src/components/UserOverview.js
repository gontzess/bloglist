import React from 'react';
import Blog from './Blog';

function UserOverview({ user, blogs, handleLogout }) {
  return (
    <div>
      <p>Welcome, {user.name}.</p>
      <button onClick={handleLogout} type="button">logout</button>
      <div>
        {blogs.map(blog =>
          <Blog key={blog.id} blog={blog} />
        )}
      </div>
    </div>
  );
}

export default UserOverview;

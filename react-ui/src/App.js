import React, { useState, useEffect } from 'react';
import UserOverview from './components/UserOverview';
import UserLogin from './components/UserLogin';
import blogService from './services/blogs';
import loginService from './services/login';

function App() {
  const [blogs, setBlogs] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    blogService
      .getAll()
      .then(blogs => setBlogs(blogs));
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    try {
      const user = await loginService.login({ username, password });
      window.localStorage.setItem('loggedBlogUser', JSON.stringify(user));
      blogService.setToken(user.token);
      setUser(user);
      setUsername('');
      setPassword('');
    } catch (error) {
      alert(error.response.data.error);
    }
  }

  function handleLogout(event) {
    event.preventDefault();
    window.localStorage.removeItem('loggedBlogUser');
    blogService.resetToken();
    setUser(null);
    setUsername('');
    setPassword('');
  }

  return (
    <div>
      <h2>Blogs</h2>
      {user === null
        ? <UserLogin
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          handleLogin={handleLogin}
        />
        : <UserOverview
          user={user}
          blogs={blogs}
          setBlogs={setBlogs}
          handleLogout={handleLogout}
        />
      }
    </div>
  );
}

export default App;

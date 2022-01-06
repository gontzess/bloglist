import axios from 'axios';
const baseUrl = '/api/blogs';

let token = null;

function setToken(newToken) {
  token = `bearer ${newToken}`;
}

function resetToken() {
  token = null;
}

async function getAll() {
  const response = await axios.get(baseUrl);
  return response.data;
}

async function create(newObject) {
  const config = {
    headers: { Authorization: token },
  };

  const response = await axios.post(baseUrl, newObject, config);
  return response.data;
}

async function update(id, newObject) {
  const response = await axios.put(`${baseUrl}/${id}`, newObject);
  return response.data;
}

async function remove(id) {
  const config = {
    headers: { Authorization: token },
  };

  const response = await axios.delete(`${baseUrl}/${id}`, config);
  return response.data;
}

export default { getAll, create, update, remove, setToken, resetToken };

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Profile({ url }) {
  const [posts, setPosts] = useState([]);
  const [editPost, setEditPost] = useState(null);
  const [error, setError] = useState('');
  const [editPostLoader, seteditPostLoader] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null
  });

  useEffect(() => {
    // Fetch user data
    const fetchPosts = async () => {
      try {
        const { data } = await axios.get(`${url}/posts/user`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (data.data.length === 0) {
          throw new Error('No posts found');
        }
        setPosts(data.data);
        setError('');
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('You do not have any posts yet.');
        } else {
          console.error('Error fetching posts', err);
          setError('An error occurred while fetching posts.');
        }
      }
    };
    fetchPosts();
  }, [url]);

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${url}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const updatedPosts = posts.filter(post => post._id !== postId);
    setPosts(updatedPosts);

    if (updatedPosts.length === 0) {
      setError('No posts here yet, be the first to share something awesome!');
    }
    } catch (error) {
      console.error('Error deleting post', error);
    }
  };

  const handleEdit = (post) => {
    setEditPost(post);
    setFormData({
      title: post.title,
      description: post.description,
      image: null
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prevData => ({ ...prevData, image: e.target.files[0] }));
  };

  const handleUpdate = async (e) => {
    seteditPostLoader(true)
    e.preventDefault();
    const { title, description, image } = formData;

    const updatedData = { title, description };
    try {
      if (image) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('image', image);

        const { data } = await axios.patch(`${url}/posts/${editPost._id}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setPosts(posts.map(post => post._id === editPost._id ? data.data : post));
      } else {
        const { data } = await axios.patch(`${url}/posts/${editPost._id}`, updatedData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setPosts(posts.map(post => post._id === editPost._id ? data.data : post));
      }
      setEditPost(null);
      seteditPostLoader(false)
    } catch (error) {
      seteditPostLoader(false)
      console.error('Error updating post', error);
    }
  };

  return (
    <div className="bg-slate-300 min-h-screen">

      <div className="container mx-auto py-3">

        {error && posts.length <= 0 && (
          <div className="max-w-3xl mx-auto px-4 py-3 rounded " role="alert">
          <h2 className='text-2xl text-center mb-5 text-red-500 font-bold'>No here posts yet</h2>
            <img src='3973481.jpg'></img>
          </div>
        )}

        <div className="max-w-3xl mx-auto pt-5">
          {!error && posts.length > 0 && posts.map(post => (
            <div key={post._id} className="card bg-white shadow-md rounded-lg mb-5 p-4">
              <div className="flex justify-between items-center">
                <h3 className="card-title text-xl font-semibold">{post.title}</h3>
                <div>
                  <button className="btn btn-sm btn-warning mr-1" onClick={() => handleEdit(post)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  <button className="btn btn-error btn-sm" onClick={() => handleDelete(post._id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-2">{new Date(post.createdAt).toLocaleString()}</p>
              <p className="break-words text-gray-700">{post.description}</p>
              {post.image && <img src={post.image} alt="Post" className="w-full h-auto object-cover mt-4 rounded" />}
            </div>
          ))}

          {editPost && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-md w-full">
                <button onClick={() => setEditPost(null)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">X</button>
                <h3 className="font-bold text-lg mb-4">Edit Post</h3>
                <form onSubmit={handleUpdate}>
                  <input
                    className="input input-bordered w-full mb-4"
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                  <textarea
                    className="textarea textarea-bordered w-full mb-4"
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                  <input
                    className="file-input file-input-bordered w-full mb-4"
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                  />
                  {formData.image && <img src={URL.createObjectURL(formData.image)} alt="Post Preview" className="w-full h-48 object-cover mb-4 rounded" />}
                  <div className="modal-action">
                    <button type="submit" className={`btn btn-primary ${editPostLoader ? 'loading' : ''}`}>Save</button>
                    <button type="button" onClick={() => setEditPost(null)} className="btn">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

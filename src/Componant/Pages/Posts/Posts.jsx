import Joi from "joi";
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Posts(props) {
  const [showModal, setShowModal] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState('');
  const [commitLoading, setCommitLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [addPostLoader, setAddPostLoader] = useState(false);
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [addPostError, setAddPostError] = useState(null);

  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    image: null,
  });

  const schema = Joi.object({
    title: Joi.string().min(3).max(100).required().messages({
      "string.base": "Title should be a type of text",
      "string.empty": "Title cannot be empty",
      "string.min": "Title should have a minimum length of 3 characters",
      "string.max": "Title should have a maximum length of 100 characters",
      "any.required": "Title is a required field",
    }),

    description: Joi.string().min(10).max(500).required().messages({
      "string.base": "Description should be a type of text",
      "string.empty": "Description cannot be empty",
      "string.min": "Description should have a minimum length of 10 characters",
      "string.max":
        "Description should have a maximum length of 500 characters",
      "any.required": "Description is a required field",
    }),
    image: Joi.any().messages({
      "any.required": "Profile picture is required.",
    }),
  });

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    setUser(loggedInUser);

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${props.url}/posts`, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setPosts(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleCommentClick = (post) => {
    setCurrentPost(post);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentPost(null);
    setCommentText("");
  };

  const handleCommentSubmit = async () => {
    if (!currentPost || !commentText.trim()) return;

    setCommitLoading(true);

    const commentRequest = axios.post(
      `${props.url}/posts/comment/${currentPost._id}`,
      { text: commentText },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    toast
      .promise(commentRequest, {
        loading: "Submitting comment...",
        success: "Comment added successfully!",
        error: (err) => err.response?.data?.message || "Failed to add comment",
      })
      .then((response) => {
        const updatedPost = {
          ...currentPost,
          comments: [...currentPost.comments, response.data.comment],
        };

        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === currentPost._id ? updatedPost : post
          )
        );

        setCommentText("");
        closeModal();
      })
      .catch((error) => {
        console.error("Error adding comment:", error);
      })
      .finally(() => {
        setCommitLoading(false);
      });
  };

  const handleLikeClick = async (post) => {
    const postId = post._id;
    setLikeLoading(post._id);

    const likeRequest = axios.post(
      `${props.url}/posts/like/${postId}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    toast
      .promise(likeRequest, {
        loading: isPostLikedByUser(post)
          ? "UnLiking post..."
          : "Liking post...",
        success: isPostLikedByUser(post)
          ? "Post unliked successfully"
          : "Post liked successfully!",
        error: (err) => err.response?.data?.message || "Failed to like post",
      })
      .then((response) => {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId ? { ...post, likes: response.data.data } : post
          )
        );
      })
      .catch((error) => {
        console.error("Error liking post:", error);
      })
      .finally(() => {
        setLikeLoading('');
      });
  };

  const isPostLikedByUser = (post) => {
    return post.likes.some((like) => like === user?._id.toString());
  };

  const handleImageClick = (imageUrl) => {
    setCurrentImage(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setCurrentImage("");
  };

  const handleNewPostChange = (e) => {
    const { name, value, files } = e.target;
    setNewPost({
      ...newPost,
      [name]: name === "image" ? files[0] : value,
    });
  };

  const handleAddPostSubmit = async () => {
    setAddPostError(null);

    const formData = new FormData();
    formData.append("title", newPost.title);
    formData.append("description", newPost.description);
    if (newPost.image) {
      formData.append("image", newPost.image);
    }

    const { error: validationError } = schema.validate({
      title: newPost.title,
      description: newPost.description,
      image: newPost.image,
    });
    if (validationError) {
      setAddPostError(validationError.details[0].message);
      return;
    }

    setAddPostLoader(true);

    const postRequest = newPost.image
      ? axios.post(`${props.url}/posts`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      : axios.post(
          `${props.url}/posts`,
          { title: newPost.title, description: newPost.description },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

    toast
      .promise(postRequest, {
        loading: "Adding post...",
        success: "Post added successfully!",
        error: (err) => err.response?.data?.message || "Failed to add post.",
      })
      .then((response) => {
        setPosts([response.data.data, ...posts]);

        setNewPost({
          title: "",
          description: "",
          image: null,
        });
        setShowAddPostModal(false);
      })
      .catch((error) => {
        setAddPostError(
          error.response?.data?.message ||
            "An error occurred while adding the post."
        );
        console.error("Error adding new post:", error);
      })
      .finally(() => {
        setAddPostLoader(false);
      });
  };

  if (loading) {
    return (
      <div className="bg-slate-300 h-screen">
        {[1,2].map((_, index)=>(<div key={index} className="container max-w-3xl mx-auto card w-full bg-white shadow-xl mb-6 animate-pulse">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
            </div>
            <div className="mb-4">
              <div className="w-full h-40 bg-gray-300 rounded-lg"></div>
            </div>
            <div className="mb-4 flex justify-between items-center">
              <div className="h-3 bg-gray-300 rounded w-20"></div>
              <div className="h-3 bg-gray-300 rounded w-16"></div>
            </div>
            <div className="card-actions justify-between">
              <div className="h-8 w-24 bg-gray-300 rounded"></div>
              <div className="h-8 w-24 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-300 p-4">
      <div className="container max-w-3xl mx-auto">
        {posts.length === 0 && (
          <div className="max-w-3xl mx-auto px-4 py-3 rounded " role="alert">
            <h2 className="text-2xl text-center mb-5 text-red-500 font-bold">
              No posts here yet, be the first to share something awesome!
            </h2>
            <img src="3973481.jpg"></img>
          </div>
        )}

        {posts.map((post) => (
          <div key={post._id} className="card w-full bg-white shadow-xl mb-6">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <img
                    src={post.userId.image}
                    alt={post.userId.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h2 className="font-bold">{post.userId.name}</h2>
                    <span className="text-gray-500">
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mb-4 break-words text-end">{post.description}</p>
              {post.image && (
                <div className="mb-4">
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full  object-cover rounded-lg cursor-pointer"
                    onClick={() => handleImageClick(post.image)}
                  />
                </div>
              )}
              <div className="mb-4 flex justify-between items-center">
                <span className="text-gray-500">
                  {post.likes.length}{" "}
                  {post.likes.length === 1 ? "Like" : "Likes"}
                </span>
                <span className="text-gray-500">
                  {post.comments.length}{" "}
                  {post.comments.length === 1 ? "Comment" : "Comments"}
                </span>
              </div>
              <div className="card-actions justify-between">
                {likeLoading===post._id ? (
                  <span className="loading loading-spinner loading-lg"></span>
                ) : (
                  <button
                    className={`btn btn-outline  ${
                      isPostLikedByUser(post)
                        ? " border-red-500 text-red-500"
                        : "border-sky-800 text-sky-800"
                    }`}
                    onClick={() => handleLikeClick(post)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                      />
                    </svg>
                    {isPostLikedByUser(post) ? "Liked" : "Like"}
                  </button>
                )}
                <button
                  className="btn btn-outline bg-sky-800 text-white"
                  onClick={() => handleCommentClick(post)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 0 0 1.28.53l4.184-4.183a.39.39 0 0 1 .266-.112c2.006-.05 3.982-.22 5.922-.506 1.978-.29 3.348-2.023 3.348-3.97V6.741c0-1.947-1.37-3.68-3.348-3.97A49.145 49.145 0 0 0 12 2.25ZM8.25 8.625a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Zm2.625 1.125a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Comment
                </button>
              </div>
            </div>
          </div>
        ))}

        {showModal && (
          <div className="modal modal-open">
            <div className="modal-box relative">
              <button
                className="btn btn-sm btn-circle absolute right-2 top-2"
                onClick={closeModal}
              >
                ✕
              </button>
              <h2 className="font-bold text-lg mb-4">Comments</h2>
              {currentPost.comments.length === 0 ? (
                <p>No comments yet.</p>
              ) : (
                currentPost.comments.map((comment) => (
                  <div key={comment._id} className="mb-4 flex items-center">
                    <img
                      src={comment.userId?.image}
                      alt={comment.userId?.name}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <div>
                      <h3 className="font-bold">{comment.userId?.name}</h3>
                      <p>{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
              <textarea
                className="textarea textarea-bordered w-full mb-4"
                placeholder="Write your comment here..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              ></textarea>

              {commitLoading ? (
                <span className="loading loading-spinner loading-lg"></span>
              ) : (
                <button
                  className="btn btn-outline bg-sky-800 text-white"
                  onClick={handleCommentSubmit}
                >
                  Add Comment
                </button>
              )}
            </div>
          </div>
        )}

        {showImageModal && (
          <div className="modal modal-open">
            <div className="modal-box relative">
              <button
                className="btn btn-sm btn-circle absolute right-2 top-2"
                onClick={closeImageModal}
              >
                ✕
              </button>
              <img
                src={currentImage}
                alt="Enlarged post"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        )}

        {showAddPostModal && (
          <div className="modal modal-open">
            <div className="modal-box relative">
              <button
                className="btn btn-sm btn-circle absolute right-2 top-2"
                onClick={() => setShowAddPostModal(false)}
              >
                ✕
              </button>
              <h2 className="font-bold text-lg mb-4">Add New Post</h2>
              <input
                type="text"
                name="title"
                placeholder="Title"
                className="input input-bordered w-full mb-4"
                value={newPost.title}
                onChange={handleNewPostChange}
              />
              <textarea
                name="description"
                placeholder="Description"
                className="textarea textarea-bordered w-full mb-4"
                value={newPost.description}
                onChange={handleNewPostChange}
              />
              <input
                type="file"
                name="image"
                accept="image/*"
                className="file-input file-input-bordered w-full mb-4"
                onChange={handleNewPostChange}
              />
              {addPostError && (
                <p className="text-red-500 text-sm my-2">{addPostError}</p>
              )}
              <button
                className={`btn btn-primary  ${addPostLoader ? "loading" : ""}`}
                onClick={handleAddPostSubmit}
              >
                Add Post
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        className="btn btn-lg btn-primary fixed bottom-9 right-0 rounded-s-full"
        onClick={() => setShowAddPostModal(true)}
      >
        +
      </button>
    </div>
  );
}

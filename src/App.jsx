import React, { useState, useEffect } from "react";

// ImageUpload Component
const ImageUpload = ({ imageData, setImageData }) => {
    const [preview, setPreview] = useState(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match("image.*")) {
            alert("Please select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setPreview(event.target.result);
            setImageData(event.target.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="form-group">
            <label htmlFor="postImage">Image (optional)</label>
            <div className="image-upload-container">
                <div className="upload-button-container">
                    <label htmlFor="imageUpload" className="upload-button">
                        <i className="fas fa-cloud-upload-alt"></i> Upload Image
                    </label>
                    <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        hidden
                        onChange={handleImageUpload}
                    />
                </div>
            </div>
            {imageData && (
                <div
                    id="imagePreview"
                    className={`image-preview ${preview ? "has-image" : ""}`}
                    style={{
                        backgroundImage: preview ? `url(${preview})` : "none",
                    }}
                ></div>
            )}
        </div>
    );
};

// PostForm Component
const platformsList = ["twitter", "facebook", "instagram", "linkedin"];

const PostForm = ({ onSubmit }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [date, setDate] = useState(getDefaultDate());
    const [time, setTime] = useState(getDefaultTime());
    const [platforms, setPlatforms] = useState([]);
    const [imageData, setImageData] = useState(null);

    function getDefaultDate() {
        const today = new Date();
        return today.toISOString().split("T")[0];
    }

    function getDefaultTime() {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
        return now.toTimeString().slice(0, 5);
    }

    const togglePlatform = (platform) => {
        setPlatforms((prev) =>
            prev.includes(platform)
                ? prev.filter((p) => p !== platform)
                : [...prev, platform]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !content || platforms.length === 0 || !date || !time) {
            alert("Please fill all fields");
            return;
        }

        const [year, month, day] = date.split("-");
        const [hours, minutes] = time.split(":");
        const scheduledFor = new Date(year, month - 1, day, hours, minutes);

        if (scheduledFor < new Date()) {
            alert("Cannot schedule posts in the past");
            return;
        }

        const post = {
            _id: Math.random().toString(36).slice(2, 9),
            title,
            content,
            scheduledFor: scheduledFor.toISOString(),
            platforms,
            image: imageData,
            created: new Date().toISOString(),
        };

        onSubmit(post);
        setTitle("");
        setContent("");
        setImageData(null);
        setPlatforms([]);
        setDate(getDefaultDate());
        setTime(getDefaultTime());
    };

    return (
        <div className="form-container">
            <h2>Create Post</h2>
            <div className="post-form">
                <div id="postForm">
                    <div className="form-group">
                        <label htmlFor="postTitle">Title</label>
                        <input
                            type="text"
                            id="postTitle"
                            placeholder="Enter post title"
                            className="input-field"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="postContent">Content</label>
                        <textarea
                            id="postContent"
                            placeholder="What's on your mind?"
                            rows="4"
                            className="input-field"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        ></textarea>
                    </div>

                    <ImageUpload
                        imageData={imageData}
                        setImageData={setImageData}
                    />

                    <div className="form-group">
                        <label>Platforms</label>
                        <div id="platforms" className="platform-selector">
                            {platformsList.map((platform) => (
                                <button
                                    key={platform}
                                    type="button"
                                    data-platform={platform}
                                    className={`platform-button ${
                                        platforms.includes(platform)
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() => togglePlatform(platform)}
                                >
                                    <i className={`fab fa-${platform}`}></i>{" "}
                                    {platform}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Schedule Date & Time</label>
                        <div className="date-time-container">
                            <div className="date-input-container">
                                <label
                                    htmlFor="scheduleDate"
                                    className="input-label"
                                >
                                    Date
                                </label>
                                <input
                                    type="date"
                                    id="scheduleDate"
                                    className="input-field"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="time-input-container">
                                <label
                                    htmlFor="scheduleTime"
                                    className="input-label"
                                >
                                    Time
                                </label>
                                <input
                                    type="time"
                                    id="scheduleTime"
                                    className="input-field"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <button onClick={handleSubmit} className="schedule-button">
                        Schedule Post
                    </button>
                </div>
            </div>
        </div>
    );
};

// PostList Component
const getPlatformIcon = (platformId) => {
    const icons = {
        twitter: "fab fa-twitter",
        facebook: "fab fa-facebook-f",
        instagram: "fab fa-instagram",
        linkedin: "fab fa-linkedin-in",
    };
    return icons[platformId] || "fas fa-globe";
};

const getPlatformName = (platformId) => {
    const names = {
        twitter: "Twitter/X",
        facebook: "Facebook",
        instagram: "Instagram",
        linkedin: "LinkedIn",
    };
    return names[platformId] || platformId;
};

const PostList = ({ posts, onDelete, onViewDetails }) => {
    if (posts.length === 0) {
        return (
            <div id="emptyPostsMessage" className="empty-posts-message">
                No posts scheduled. Create your first post!
            </div>
        );
    }

    return (
        <div className="posts-container">
            <h2>Scheduled Posts</h2>
            <div className="posts-list-container">
                <div id="postsList" className="posts-list">
                    {posts
                        .sort(
                            (a, b) =>
                                new Date(a.scheduledFor) -
                                new Date(b.scheduledFor)
                        )
                        .map((post) => (
                            <div
                                className="post-card"
                                key={post._id}
                                data-post-id={post._id}
                            >
                                <div className="post-header">
                                    <div className="post-title">
                                        {post.title}
                                    </div>
                                    <div className="post-date">
                                        {new Date(
                                            post.scheduledFor
                                        ).toLocaleString()}
                                    </div>
                                </div>
                                <div className="post-content">
                                    {post.content}
                                </div>

                                <div className="post-platforms">
                                    {post.platforms.map((p) => (
                                        <span className="platform-tag" key={p}>
                                            <i
                                                className={getPlatformIcon(p)}
                                            ></i>{" "}
                                            {getPlatformName(p)}
                                        </span>
                                    ))}
                                </div>
                                <div className="post-actions">
                                    <button
                                        className="explore-post-button"
                                        onClick={() => onViewDetails(post._id)}
                                    >
                                        <i className="fa-solid fa-compass"></i>
                                    </button>
                                    <button
                                        className="delete-post-button"
                                        onClick={() => onDelete(post._id)}
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

// DetailedPost Component
const DetailedPost = ({ post, onBack }) => {
    if (!post) {
        return (
            <div className="post-details-container">
                <h2 className="error-text">Post not found</h2>
                <button className="back-button" onClick={onBack}>
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="post-details-container">
            <h2 className="post-title">{post.title}</h2>

            <p className="post-content">{post.content}</p>

            {post.image && (
                <div className="post-image-container">
                    <img
                        src={post.image}
                        alt="Post Visual"
                        className="post-image"
                    />
                </div>
            )}

            <div className="post-platforms">
                <h4>Platforms:</h4>
                <ul>
                    {post.platforms.map((platform, index) => (
                        <li key={index}>{platform}</li>
                    ))}
                </ul>
            </div>

            <div className="post-meta">
                <p>
                    <strong>Scheduled For:</strong>{" "}
                    {new Date(post.scheduledFor).toLocaleString()}
                </p>
                <p>
                    <strong>Post ID:</strong> {post._id}
                </p>
            </div>

            <button className="back-button" onClick={onBack}>
                Back to Home
            </button>
        </div>
    );
};

// Toast Component
const Toast = ({ message, type = "success", onClose }) => {
    useEffect(() => {
        const timeout = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timeout);
    }, [onClose]);

    return <div className={`toast toast-${type} show`}>{message}</div>;
};

// Main App Component
const App = () => {
    const [toast, setToast] = useState(null);
    const [scheduledPosts, setScheduledPosts] = useState([]);
    const [currentView, setCurrentView] = useState('home');
    const [selectedPostId, setSelectedPostId] = useState(null);

    // Load posts from storage on mount
    useEffect(() => {
        async function loadPosts() {
            try {
                const result = await window.storage.get('social-posts');
                if (result && result.value) {
                    setScheduledPosts(JSON.parse(result.value));
                }
            } catch (err) {
                console.log('No existing posts found');
            }
        }
        loadPosts();
    }, []);

    // Save posts to storage whenever they change
    useEffect(() => {
        async function savePosts() {
            if (scheduledPosts.length >= 0) {
                try {
                    await window.storage.set('social-posts', JSON.stringify(scheduledPosts));
                } catch (err) {
                    console.error('Error saving posts:', err);
                }
            }
        }
        savePosts();
    }, [scheduledPosts]);

    const addPost = (post) => {
        setScheduledPosts([...scheduledPosts, post]);
        setToast({
            message: "Post scheduled successfully!",
            type: "success",
        });
    };

    const deletePost = (postId) => {
        setScheduledPosts(scheduledPosts.filter((p) => p._id !== postId));
        setToast({
            message: "Post deleted successfully!",
            type: "success",
        });
    };

    const viewPostDetails = (postId) => {
        setSelectedPostId(postId);
        setCurrentView('details');
    };

    const goHome = () => {
        setSelectedPostId(null);
        setCurrentView('home');
    };

    const selectedPost = scheduledPosts.find(p => p._id === selectedPostId);

    return (
        <div className="min-h-screen">
            {currentView === 'home' ? (
                <>
                    <div className="header">
                        <h1>Social Media Scheduler</h1>
                        <p>
                            Plan and schedule your social media content
                            in one place
                        </p>
                    </div>
                    <div className="content-container">
                        <PostForm onSubmit={addPost} />
                        <PostList
                            posts={scheduledPosts}
                            onDelete={deletePost}
                            onViewDetails={viewPostDetails}
                        />
                    </div>
                    {toast && (
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            onClose={() => setToast(null)}
                        />
                    )}
                </>
            ) : (
                <DetailedPost post={selectedPost} onBack={goHome} />
            )}
        </div>
    );
};

export default App;
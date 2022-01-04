const list = {
  testBlogs: [
    {
      title: "Book 1",
      author: "Jane Bob",
      url: "www.book1.com",
      likes: 5
    },
    {
      title: "Book 2",
      author: "George Sally",
      url: "www.book2.com",
      likes: 2
    },
    {
      title: "Book 3",
      author: "Anna Fred",
      url: "www.book3.com",
      likes: 47
    }
  ],

  fullBlog: {
    title: "Book 4",
    author: "Alex Tester",
    url: "www.book4.com",
    likes: 15
  },

  missingLikesBlog: {
    title: "Book 4",
    author: "Alex Tester",
    url: "www.book4.com",
  },

  missingTitleBlog: {
    author: "Alex Tester",
    url: "www.book4.com",
    likes: 15
  },

  missingUrlBlog: {
    title: "Book 4",
    author: "Alex Tester",
    likes: 15
  },

  nonexistentId: '31904b494883f96a461d39cd',

  malformattedId: '31904b49',

  dummy(blogs) {
    return 1;
  },

  totalLikes(blogs) {
    let total = 0;
    blogs.forEach(blog => total += blog.likes);

    return total;
  },

  favoriteBlog(blogs) {
    if (blogs.length === 0) {
      return null;
    }

    let favorite = blogs[0];
    blogs.forEach(blog => {
      if (favorite.likes < blog.likes) {
        favorite = blog;
      }
    });

    return favorite;
  },
};

export default list;

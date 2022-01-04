import list from './list_helper.js';

const testBlogs = list.testBlogs;

describe('dummy', () => {
  test('always returns one', () => {
    const blogs = [];
    const result = list.dummy(blogs);
    expect(result).toBe(1);
  });
});

describe('total likes', () => {
  test('of empty list is zero', () => {
    const blogs = [];
    const result = list.totalLikes(blogs);
    expect(result).toBe(0);
  });
  test('when list has only one blog, returns likes of the only', () => {
    const blogs = [ testBlogs[0] ];
    const result = list.totalLikes(blogs);
    expect(result).toBe(5);
  });
  test('of a bigger list is calculated right', () => {
    const blogs = testBlogs;
    const result = list.totalLikes(blogs);
    expect(result).toBe(54);
  });
});

describe('favorite blog', () => {
  test('of empty list is null', () => {
    const blogs = [];
    const result = list.favoriteBlog(blogs);
    expect(result).toBe(null);
  });
  test('when list has only one blog, returns the only', () => {
    const blogs = [ testBlogs[0] ];
    const result = list.favoriteBlog(blogs);
    expect(result).toEqual(testBlogs[0]);
  });
  test('of a bigger list is calculated right', () => {
    const blogs = testBlogs;
    const result = list.favoriteBlog(blogs);
    expect(result).toBe(testBlogs[2]);
  });
});

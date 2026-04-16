const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to format date
function formatToDDMMYYYY(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Blog list page
router.get('/', async (req, res) => {
  try {
    const tag = req.query.tag;
    const page = parseInt(req.query.page) || 1;
    const postsPerPage = 9;
    const offset = (page - 1) * postsPerPage;

    let query = supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .order('publishDate', { ascending: false });

    if (tag) {
      query = query.contains('tags', tag);
    }

    const { data: posts, error } = await query.range(offset, offset + postsPerPage - 1);

    if (error) throw error;

    // Get total count for pagination
    let countQuery = supabase
      .from('blogs')
      .select('*', { count: 'exact', head: true })
      .eq('published', true);

    if (tag) {
      countQuery = countQuery.contains('tags', tag);
    }

    const { count } = await countQuery;
    const totalPages = Math.ceil(count / postsPerPage);

    res.render('blog/index', {
      posts: posts || [],
      currentPage: page,
      totalPages,
      tag,
      formatToDDMMYYYY
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).render('error', { message: 'Error loading blog posts', status: 500 });
  }
});

// Individual blog post page
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: post, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error || !post) {
      return res.status(404).render('error', { message: 'Blog post not found', status: 404 });
    }

    // Get other blogs for "Keep Reading"
    const { data: otherBlogs } = await supabase
      .from('blogs')
      .select('*')
      .neq('slug', slug)
      .eq('published', true)
      .order('publishDate', { ascending: false })
      .limit(2);

    // Get all published blogs to find prev/next
    const { data: allBlogs } = await supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .order('publishDate', { ascending: false });

    let prevBlog = null;
    let nextBlog = null;

    if (allBlogs) {
      const currentIndex = allBlogs.findIndex(blog => blog.slug === slug);
      if (currentIndex > 0) {
        prevBlog = allBlogs[currentIndex - 1];
      }
      if (currentIndex < allBlogs.length - 1) {
        nextBlog = allBlogs[currentIndex + 1];
      }
    }

    res.render('blog/post', {
      post,
      otherBlogs: otherBlogs || [],
      prevBlog,
      nextBlog,
      formatToDDMMYYYY
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).render('error', { message: 'Error loading blog post', status: 500 });
  }
});

module.exports = router;
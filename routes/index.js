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
    const category = req.query.category;
    const page = parseInt(req.query.page) || 1;
    const postsPerPage = 9;
    const offset = (page - 1) * postsPerPage;

    let query = supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .order('publishDate', { ascending: false });

    if (category) {
      query = query.contains('categories', category);
    }

    const { data: posts, error } = await query.range(offset, offset + postsPerPage - 1);

    if (error) throw error;

    // Get total count for pagination
    let countQuery = supabase
      .from('blogs')
      .select('*', { count: 'exact', head: true })
      .eq('published', true);

    if (category) {
      countQuery = countQuery.contains('categories', category);
    }

    const { count } = await countQuery;
    const totalPages = Math.ceil(count / postsPerPage);

    // Get all unique categories for filtering
    const { data: allBlogs } = await supabase
      .from('blogs')
      .select('categories')
      .eq('published', true);

    const categoriesSet = new Set();
    if (allBlogs) {
      allBlogs.forEach(blog => {
        if (blog.categories && Array.isArray(blog.categories)) {
          blog.categories.forEach(cat => categoriesSet.add(cat));
        }
      });
    }
    const categories = Array.from(categoriesSet).sort();

    // Render the blog content
    const ejs = require('ejs');
    const fs = require('fs');
    const path = require('path');

    const blogContent = await ejs.renderFile(path.join(__dirname, '../views/blog/index.ejs'), {
      posts: posts || [],
      currentPage: page,
      totalPages,
      category,
      categories,
      formatToDDMMYYYY
    });

    const fullPage = await ejs.renderFile(path.join(__dirname, '../views/layouts/main.ejs'), {
      title: category ? `Blog - ${category} | Kestora Blog` : 'Kestora Blog',
      metaDescription: category ? `Read articles about ${category} from Kestora University student ambassadors.` : 'Stories and insights from Kestora University student ambassadors sharing their experiences studying and living in Finland.',
      ogImage: null,
      body: blogContent
    });

    res.send(fullPage);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    const ejs = require('ejs');
    const path = require('path');

    const errorContent = await ejs.renderFile(path.join(__dirname, '../views/error.ejs'), {
      message: 'Error loading blog posts',
      status: 500
    });

    const fullPage = await ejs.renderFile(path.join(__dirname, '../views/layouts/main.ejs'), {
      title: 'Error | Kestora Blog',
      body: errorContent
    });

    res.status(500).send(fullPage);
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
      const ejs = require('ejs');
      const path = require('path');

      const errorContent = await ejs.renderFile(path.join(__dirname, '../views/error.ejs'), {
        message: 'Blog post not found',
        status: 404
      });

      const fullPage = await ejs.renderFile(path.join(__dirname, '../views/layouts/main.ejs'), {
        title: 'Post Not Found | Kestora Blog',
        body: errorContent
      });

      return res.status(404).send(fullPage);
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

    // Render the blog content
    const ejs = require('ejs');
    const fs = require('fs');
    const path = require('path');

    const blogContent = await ejs.renderFile(path.join(__dirname, '../views/blog/post.ejs'), {
      post,
      otherBlogs: otherBlogs || [],
      prevBlog,
      nextBlog,
      formatToDDMMYYYY
    });

    const fullPage = await ejs.renderFile(path.join(__dirname, '../views/layouts/main.ejs'), {
      title: post.meta_title || `${post.title} | Kestora Blog`,
      metaDescription: post.meta_description || post.excerpt,
      ogImage: post.og_image || post.imageUrl,
      body: blogContent
    });

    res.send(fullPage);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    const ejs = require('ejs');
    const path = require('path');

    const errorContent = await ejs.renderFile(path.join(__dirname, '../views/error.ejs'), {
      message: 'Error loading blog post',
      status: 500
    });

    const fullPage = await ejs.renderFile(path.join(__dirname, '../views/layouts/main.ejs'), {
      title: 'Error | Kestora Blog',
      body: errorContent
    });

    res.status(500).send(fullPage);
  }
});

module.exports = router;
const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helpers')

describe('Blog app', () => {
  beforeEach(async ({ page, request  }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
        data: {
          name: 'Japneet',
          username: 'japneet',
          password: 'asdasd123'
        }
      })
  
    await page.goto('')
  })

  test('front page can be opened', async ({ page }) => {
    let locator = page.getByRole('heading', { name: 'Login' })
    await expect(locator).toBeVisible()
    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()
    const textboxes = await page.getByRole('textbox').all()
    expect(textboxes).toHaveLength(2)
    locator = page.getByRole('button', { name: 'login' })
    await expect(locator).toBeVisible()
  })

  describe('Login', () => {
    test('user can login with correct credentials', async ({ page }) => {
      await loginWith(page, 'japneet', 'asdasd123')
      await expect(page.getByText('Japneet logged in')).toBeVisible()
    })

    test('login fails with wrong password', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'wrong')
  
      const errorDiv = await page.locator('.error')
      await expect(errorDiv).toContainText('wrong credentials')
      await expect(errorDiv).toHaveCSS('border-style', 'solid')
      await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
      await expect(page.getByText('Japneet logged in')).not.toBeVisible()
    })  
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'japneet', 'asdasd123')
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'blog_name', 'blog_author', 'blog:url')
      await page.waitForTimeout(5000);
      await expect(page.getByText('blog_name')).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      await createBlog(page, 'blog_name', 'blog_author', 'blog:url')
      await page.getByRole('button', { name: 'view' }).click()
      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.getByText('1')).toBeVisible()
    })
  
    test('a blog can be deleted', async ({ page }) => {
      await createBlog(page, 'blog_name', 'blog_author', 'blog:url')
      await page.waitForTimeout(5000);
      await page.getByRole('button', { name: 'view' }).click()
      page.on('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: 'delete' }).click()
      await expect(page.getByText('blog_name')).not.toBeVisible()
    })
  
    test('a blog can be deleted only by the creator', async ({ page, request }) => {
      await request.post('/api/users', {
        data: {
          name: 'user2',
          username: 'user2',
          password: 'asdasd123'
        }
      })
      await createBlog(page, 'blog_name', 'blog_author', 'blog:url')
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: 'logout' }).click()
      await loginWith(page, 'user2', 'asdasd123')
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: 'view' }).click()
      await expect(page.getByText('delete')).not.toBeVisible()
    })

    test('blogs should be sorted by likes', async ({ page, request }) => {
      await createBlog(page, 'blog_1_like', 'blog_author', 'blog:url')
      await createBlog(page, 'blog_2_likes', 'blog_author', 'blog:url')
      await createBlog(page, 'blog_3_likes', 'blog_author', 'blog:url')
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: 'view' }).last().click()      
      await page.getByRole('button', { name: 'view' }).last().click()
      await page.getByRole('button', { name: 'view' }).last().click()
      const likeButtons = await page.getByRole('button', { name: 'like' }).all()
      await likeButtons[0].click()
      await likeButtons[1].click()
      await likeButtons[1].click()
      await likeButtons[2].click()
      await likeButtons[2].click()
      await likeButtons[2].click()
      await page.waitForTimeout(4000);
      const blogs = await page.getByText(/blog_\d_like/).all();
      await expect(blogs[0]).toContainText('blog_1_like');
      await expect(blogs[1]).toContainText('blog_2_like');
      await expect(blogs[2]).toContainText('blog_3_like');
    })
  })
})
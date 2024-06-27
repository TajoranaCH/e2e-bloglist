const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith } = require('./helpers')

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

  test('user can login with correct credentials', async ({ page }) => {
    await loginWith(page, 'japneet', 'asdasd123')
  
    await expect(page.getByText('Japneet logged in')).toBeVisible()
  })
})
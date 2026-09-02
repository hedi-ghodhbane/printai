import { expect, test, type Page } from '@playwright/test'

/** Navigate and wait until the client has hydrated (network settles). */
async function open(page: Page, url: string) {
  await page.goto(url)
  await page.waitForLoadState('networkidle')
}

test.describe('shop pages', () => {
  test('landing page renders hero, products and templates', async ({ page }) => {
    await open(page, '/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Printed like it')
    await expect(page.getByRole('link', { name: /Business cards/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Classic French wedding/ })).toBeVisible()
  })

  test('product page quotes prices and reacts to quantity', async ({ page }) => {
    await open(page, '/products/business-card')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Business cards')
    const total = page.locator('dl dd').last()
    const before = await total.textContent()
    await page.getByRole('button', { name: '1000', exact: true }).click()
    await expect(total).not.toHaveText(before ?? '')
  })

  test('templates gallery filters by occasion and product', async ({ page }) => {
    await open(page, '/templates?occasion=tahour')
    await expect(page.getByText('Little prince tahour')).toBeVisible()
    await expect(page.getByText('Classic French wedding')).toHaveCount(0)
    await page.locator('select').nth(0).selectOption('sachet')
    await expect(page.getByText('Tahour favour')).toBeVisible()
    await expect(page.getByText('Little prince tahour')).toHaveCount(0)
  })
})

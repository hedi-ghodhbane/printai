import { expect, test } from '@playwright/test'

test('checkout renders 300 dpi proofs and places an order in guest mode', async ({ page }) => {
  await page.goto('/editor/new?template=sachet-tahour')
  await page.waitForURL(/\/editor\/dsg_/)
  await expect(page.locator('canvas').first()).toBeVisible()
  const designId = page.url().split('/').pop()!

  await page.goto(`/checkout/${designId}`)
  await page.waitForLoadState('networkidle')
  const proof = page.getByRole('img', { name: 'Front' })
  await expect(proof).toBeVisible({ timeout: 60_000 })
  // sachet small print: 80x110 mm at 300 dpi
  const size = await proof.evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight])
  expect(size[0]).toBeGreaterThan(900)
  expect(size[1]).toBeGreaterThan(1250)

  await page.getByLabel('Full name').fill('Test Person')
  await page.getByLabel('Phone').fill('+216 20 000 000')
  await page.getByLabel('Address').fill('12 rue des Imprimeurs')
  await page.getByLabel('City').fill('Tunis')
  await page.getByRole('button', { name: 'Place order' }).click()

  await page.waitForURL(/\/orders\/ord_/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Thank you, Test')
  await expect(page.getByText('Received').first()).toBeVisible()

  await page.goto('/orders')
  await expect(page.getByText('Gift sachets')).toBeVisible()
})

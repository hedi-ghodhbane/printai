import { expect, test } from '@playwright/test'

async function openTemplate(page: import('@playwright/test').Page, template: string) {
  await page.goto(`/editor/new?template=${template}`)
  await page.waitForURL(/\/editor\/dsg_/)
  await expect(page.locator('canvas').first()).toBeVisible()
  await page.waitForLoadState('networkidle')
  return page.url().split('/').pop()!
}

test.describe('editor', () => {
  test('opens a template, edits text, undoes, and autosaves', async ({ page }) => {
    await openTemplate(page, 'inv-wedding-classic')
    await expect(page.getByRole('button', { name: 'Front' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible()

    // select the headline from the layers panel and change it in the inspector
    await page.getByTitle('Layers').click()
    await page.getByRole('button', { name: /Sarra & Mehdi/ }).first().click()
    const textarea = page.locator('textarea.field')
    await expect(textarea).toHaveValue('Sarra & Mehdi')
    await textarea.fill('Amira & Khaled')
    await expect(page.getByRole('button', { name: /Amira & Khaled/ }).first()).toBeVisible()

    // autosave status
    await expect(page.getByText('saved', { exact: true })).toBeVisible({ timeout: 10_000 })

    // undo restores the original text
    await page.locator('canvas').first().click({ position: { x: 5, y: 5 } })
    await page.keyboard.press('Control+z')
    await expect(page.getByRole('button', { name: /Sarra & Mehdi/ }).first()).toBeVisible()
  })

  test('adds text and a shape, deletes with keyboard', async ({ page }) => {
    await openTemplate(page, 'bc-mono')
    await page.getByTitle('Text', { exact: true }).click()
    await page.getByRole('button', { name: /Headline/ }).click()
    await expect(page.locator('.panel-title', { hasText: /^text$/ })).toBeVisible()
    await page.getByTitle('Shapes').click()
    await page.getByRole('button', { name: 'Circle' }).click()
    await expect(page.locator('.panel-title', { hasText: /^ellipse$/ })).toBeVisible()
    await page.keyboard.press('Escape')
    await page.getByTitle('Layers').click()
    await expect(page.getByRole('listitem').filter({ hasText: 'ellipse' })).toHaveCount(1)
    await page.getByRole('listitem').filter({ hasText: 'ellipse' }).getByRole('button').first().click()
    await page.keyboard.press('Delete')
    await expect(page.getByRole('listitem').filter({ hasText: 'ellipse' })).toHaveCount(0)
  })

  test('textile template shows garment colours and switches them', async ({ page }) => {
    await openTemplate(page, 'tee-grad-class')
    await expect(page.getByText('Garment colour')).toBeVisible()
    await page.getByTitle('Navy').click()
    await expect(page.getByTitle('Navy')).toHaveAttribute('data-active', 'true')
  })

  test('design appears in My designs and can be deleted', async ({ page }) => {
    await openTemplate(page, 'gc-thanks')
    await page.goto('/designs')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('paragraph').filter({ hasText: /^Merci$/ })).toBeVisible()
    page.once('dialog', (d) => d.accept())
    await page.getByTitle('Delete').click()
    await expect(page.getByText('Nothing on the press yet.')).toBeVisible()
  })
})

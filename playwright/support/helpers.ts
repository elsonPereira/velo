import { Page } from "@playwright/test"

export function generateOrderCode() {
  const prefix = 'VLO'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const codeLength = 6

  let code = ''

  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    code += chars[randomIndex]
  }

  return `${prefix}-${code}`
}

export async function mockCreditAnalysis(
  page: Page,
  score: number
) {
  await page.route(
    '**functions/v1/credit-analysis',
    async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'Done',
          score
        })
      })
    }
  )
}
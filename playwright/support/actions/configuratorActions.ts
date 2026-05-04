import { Page, expect } from '@playwright/test'

export function createConfiguratorActions(page: Page) {
  return {
    async open() {
      await page.goto('/configure')
      
    },

    async selectColor(colorName: string) {
      await page.getByRole('button', { name: colorName }).click()
    },

    async selectWheels(wheelsName: string) {
      await page.getByRole('button', { name: new RegExp(wheelsName, 'i') }).click()
    },

    async validateTotalPrice(price: string) {
      const totalPrice = page.getByTestId('total-price')
      await expect(totalPrice).toBeVisible()
      await expect(totalPrice).toHaveText(price)
    },

    async validateVehicleImage(imageName: string) {
      const vehicleImage = page.locator('img[alt^="Velô Sprint"]')
      await expect(vehicleImage).toHaveAttribute('src', new RegExp(`${imageName}$`))
    },

    /** Alterna o estado do opcional (Radix checkbox com nome acessível derivado do label). */
    async toggleOptionalCheckbox(name: RegExp) {
      await page.getByRole('checkbox', { name }).click()
    },

    async proceedToCheckout() {
      await page.getByRole('button', { name: 'Monte o Seu' }).click()
    },

    async validateOrderSummaryTotal(price: string) {
      const summaryTotal = page.getByTestId('summary-total-price')
      await expect(summaryTotal).toBeVisible()
      await expect(summaryTotal).toHaveText(price)
    },
  }
}

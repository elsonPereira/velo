import { test, expect } from '../support/fixtures'

test.describe('Configuração do Veículo', () => {
  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
  })

  test('CT12 — opcionais e preço dinâmico até checkout', async ({ app, page }) => {
    const basePrice = 'R$ 40.000,00'
    const withPrecisionPark = 'R$ 45.500,00'
    const withBothOptionals = 'R$ 50.500,00'

    await app.configurator.validateTotalPrice(basePrice)

    await app.configurator.toggleOptionalCheckbox(/Precision Park/i)
    await app.configurator.validateTotalPrice(withPrecisionPark)

    await app.configurator.toggleOptionalCheckbox(/Flux Capacitor/i)
    await app.configurator.validateTotalPrice(withBothOptionals)

    await app.configurator.toggleOptionalCheckbox(/Precision Park/i)
    await app.configurator.toggleOptionalCheckbox(/Flux Capacitor/i)
    await app.configurator.validateTotalPrice(basePrice)

    await app.configurator.proceedToCheckout()
    await expect(page).toHaveURL(/\/order$/)
    await app.configurator.validateOrderSummaryTotal(basePrice)
  })

  test('deve atualizar a imagem e manter o preço base ao trocar a cor do veículo', async ({ app }) => {
    const basePrice = 'R$ 40.000,00'

    await app.configurator.validateTotalPrice(basePrice)

    await app.configurator.selectColor('Midnight Black')
    await app.configurator.validateTotalPrice(basePrice)
    await app.configurator.validateVehicleImage('midnight-black-aero-wheels.png')
  })

  test('deve atualizar o preço e a imagem ao alterar as rodas, e restaurar os valores padrão', async ({
    app,
  }) => {
    const basePrice = 'R$ 40.000,00'
    const upgradedPrice = 'R$ 42.000,00'

    // Arrange
    await app.configurator.validateTotalPrice(basePrice)
    await app.configurator.validateVehicleImage('glacier-blue-aero-wheels.png')

    // Act + Assert
    await app.configurator.selectWheels('Sport Wheels')
    await app.configurator.validateTotalPrice(upgradedPrice)
    await app.configurator.validateVehicleImage('glacier-blue-sport-wheels.png')

    await app.configurator.selectWheels('Aero Wheels')
    await app.configurator.validateTotalPrice(basePrice)
    await app.configurator.validateVehicleImage('glacier-blue-aero-wheels.png')
  })
})

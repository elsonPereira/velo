import { test, expect } from '../support/fixtures'
import { deleteOrderByCustomerCpf } from '../support/database/orderRepository'
import { mockCreditAnalysis } from '../support/helpers'
import { prepareCheckout } from '../support/actions/checkoutActions'

test.describe('Checkout', () => {

  test.describe('Validações de campos obrigatórios', () => {

    let alerts: any

    test.beforeEach(async ({ page, app }) => {
      await page.goto('/order')
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
      alerts = app.checkout.elements.alerts
    })

    test('deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
      await expect(alerts.email).toHaveText('Email inválido')
      await expect(alerts.phone).toHaveText('Telefone inválido')
      await expect(alerts.document).toHaveText('CPF inválido')
      await expect(alerts.store).toHaveText('Selecione uma loja')
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })

    test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ app }) => {

      const customer = {
        name: 'A',
        lastname: 'B',
        email: 'barbara@outlook.com',
        document: '00000014141',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
    })

    test('deve exibir erro para e-mail com formato inválido', async ({ app }) => {
      const customer = {
        name: 'Lidiane',
        lastname: 'Souza',
        email: '',
        document: '00000014141',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.email).toHaveText('Email inválido')
    })

    test('deve exibir erro para CPF inválido', async ({ app }) => {
      const customer = {
        name: 'Mariana',
        lastname: 'Ferreira',
        email: 'maferreira@test.com',
        document: '',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.document).toHaveText('CPF inválido')
    })

    test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ app }) => {
      const customer = {
        name: 'Fernando',
        lastname: 'Papito',
        email: 'papito@test.com',
        document: '00000014199',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')

      await expect(app.checkout.elements.terms).not.toBeChecked()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })
  })

  test.describe('Pagamento e Confirmação', () => {

    test('Deve criar um pedido com sucesso para pagamento à vista', async ({ app, page }) => {
      const customer = {
        name: 'Kelly',
        lastname: 'Silva',
        email: 'kelly.silva@teste.com',
        document: '42598712030',
        phone: '(11) 98765-4321',
        store: 'Velô Paulista',
        paymentMethod: 'À Vista',
        totalPrice: 'R$ 40.000,00'
      }

      await deleteOrderByCustomerCpf('425.987.120-30')

      // Arrange
      await prepareCheckout(page, app, customer)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await app.checkout.expectOrderStatus('Pedido Aprovado!')
    })

    test('Deve aprovar automaticamente o crédito quando score do CPF for maior que 700 no financiamento', async ({ app, page }) => {
      const customer = {
        name: 'Barbara',
        lastname: 'Fonseca',
        email: 'bfonseca7@gmail.com',
        document: '02530573883',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00'
      }

      await deleteOrderByCustomerCpf('025.305.738-83')
      await mockCreditAnalysis(page, 710)

      // Arrange
      await prepareCheckout(page, app, customer)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await app.checkout.expectOrderStatus('Pedido Aprovado!')
    })

    test('Deve encaminhar para análise de crédito quando score do CPF for menor que 700 no financiamento', async ({ app, page }) => {
      const customer = {
        name: 'Mariana',
        lastname: 'Santos',
        email: 'marianassto@gmail.com',
        document: '56960995809',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00'
      }

      await deleteOrderByCustomerCpf('569.609.958-09')
      await mockCreditAnalysis(page, 600)

      // Arrange
      await prepareCheckout(page, app, customer)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await app.checkout.expectOrderStatus('Pedido em Análise!')
    })

    test('Deve reprovar automaticamente o crédito quando score do CPF for menor ou igual a 500 sem entrada no financiamento', async ({ app, page }) => {
      const customer = {
        name: 'Camila',
        lastname: 'Oliveira',
        email: 'camila.oliveira@teste.com',
        document: '39845612008',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00'
      }

      await deleteOrderByCustomerCpf('398.456.120-08')
      await mockCreditAnalysis(page, 500)

      // Arrange
      await prepareCheckout(page, app, customer)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await app.checkout.expectOrderStatus('Crédito Reprovado')
    })

    test('Deve reprovar automaticamente o crédito quando score do CPF for menor ou igual a 500 com entrada inferior a 50% no financiamento', async ({ app, page }) => {
      const customer = {
        name: 'Fernanda',
        lastname: 'Almeida',
        email: 'fernanda.almeida@teste.com',
        document: '58124739001',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00',
        downPayment: '10000'
      }

      await deleteOrderByCustomerCpf('581.247.390-01')
      await mockCreditAnalysis(page, 500)

      // Arrange
      await prepareCheckout(page, app, customer)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.fillDownPayment(customer.downPayment)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await app.checkout.expectOrderStatus('Crédito Reprovado')
    })

    test('Deve aprovar automaticamente o crédito quando score do CPF for menor ou igual a 500 com entrada igual a 50%', async ({ app, page }) => {
      const customer = {
        name: 'Lidiane',
        lastname: 'Cristina',
        email: 'lidcris1999@uol.com',
        document: '12981619837',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00',
        downPayment: '20000'
      }

      await deleteOrderByCustomerCpf('129.816.198-37')
      await mockCreditAnalysis(page, 450)

      // Arrange
      await prepareCheckout(page, app, customer)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.fillDownPayment(customer.downPayment)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await app.checkout.expectOrderStatus('Pedido Aprovado!')
    })

    test('Deve aprovar automaticamente o crédito quando score do CPF for menor ou igual a 500 com entrada maior que 50%', async ({ app, page }) => {
      const customer = {
        name: 'Brito',
        lastname: 'D Elson',
        email: 'brito.d.elson@sdet.com',
        document: '14063899861',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00',
        downPayment: '23456'
      }

      await deleteOrderByCustomerCpf('140.638.998-61')
      await mockCreditAnalysis(page, 300)

      // Arrange
      await prepareCheckout(page, app, customer)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.fillDownPayment(customer.downPayment)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await app.checkout.expectOrderStatus('Pedido Aprovado!')
    })

  })
})
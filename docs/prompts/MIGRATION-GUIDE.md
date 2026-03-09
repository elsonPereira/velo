# Guia de Migração — Actions + Fixtures

## Tabela de Mapeamento

| Page Object Original | Action Nova |
|---------------------|-------------|
| `LandingPage.ts` | `createLandingActions` |
| `Navbar.ts` | `createNavbarActions` |
| `OrderLockupPage.ts` | `createOrderLockupActions` |

## Como Usar

- **Criar nova action:** Crie `support/actions/<contexto>Actions.ts` com `create<Contexto>Actions(page: Page)` retornando objeto com métodos async.
- **Registrar na fixture:** Em `support/fixtures.ts`, importe a action e adicione ao tipo `App` e ao objeto `app` dentro do `extend`.
- **Usar no teste:** Importe `test, expect` de `../support/fixtures` e use `async ({ app }) => { await app.<contexto>.<metodo>() }`.

# Documento de Casos de Testes
**Sistema:** Velô Sprint - Configurador de Veículo Elétrico
**Perfil de Usuário:** Cliente (Usuário Comum)

---

## 1. Landing Page

### CT01 - Acesso e Navegação para o Configurador
#### Objetivo
Validar se o usuário consegue acessar a página inicial e ser direcionado corretamente para o configurador de veículos.
#### Pré-Condições
- O sistema deve estar acessível via navegador.
#### Passos
| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Acessar a URL principal do sistema | A Landing Page é carregada exibindo as informações do Velô Sprint |
| 2 | Clicar no botão "Configurar Veículo" (ou ação equivalente) | O sistema redireciona o usuário para a rota `/configure` |
#### Resultados Esperados
- O usuário deve conseguir visualizar a página de configuração do veículo.
#### Critérios de Aceitação
- A página do configurador deve carregar sem erros.
- A rota atual no navegador deve ser `/configure`.

---

## 2. Configurador de Veículo

### CT02 - Personalização de Veículo (Fluxo Feliz)
#### Objetivo
Validar se as seleções de opcionais e rodas atualizam o valor total do veículo de acordo com as regras de precificação.
#### Pré-Condições
- O usuário deve estar na página do Configurador (`/configure`).
#### Passos
| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Visualizar o preço inicial | O valor base exibido deve ser R$ 40.000 |
| 2 | Selecionar a opção de Rodas "Sport" | O valor total exibido deve ser atualizado para R$ 42.000 (+ R$ 2.000) |
| 3 | Marcar o opcional "Precision Park" | O valor total exibido deve ser atualizado para R$ 47.500 (+ R$ 5.500) |
| 4 | Marcar o opcional "Flux Capacitor" | O valor total exibido deve ser atualizado para R$ 52.500 (+ R$ 5.000) |
| 5 | Clicar em "Avançar" para o Checkout | O sistema salva a configuração e redireciona para a rota `/order` |
#### Resultados Esperados
- O valor final do veículo antes de ir para o checkout deve refletir a soma exata: R$ 40.000 (Base) + R$ 2.000 (Rodas Sport) + R$ 5.500 (Precision Park) + R$ 5.000 (Flux Capacitor) = R$ 52.500. O usuário avança com sucesso.
#### Critérios de Aceitação
- Preço dinâmico deve ser calculado e renderizado imediatamente na tela.
- Redirecionamento correto para o Checkout mantendo as escolhas.

---

## 3. Checkout e Análise de Crédito

### CT03 - Finalizar Pedido com Pagamento à Vista
#### Objetivo
Validar a criação de um pedido com sucesso utilizando a forma de pagamento "À Vista".
#### Pré-Condições
- O usuário escolheu sua configuração e avançou para a página de Checkout (`/order`).
#### Passos
| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Preencher formulário de Dados Pessoais com dados válidos (Nome, Sobrenome, Email, Telefone, CPF) | Campos aceitam os dados e aplicam as máscaras corretivas (Telefone, CPF) |
| 2 | Selecionar uma "Loja para Retirada" | Loja selecionada com sucesso |
| 3 | Selecionar a forma de pagamento "À Vista" | A opção é destacada e o quadro de entrada/financiamento não é exibido |
| 4 | Marcar o checkbox de aceite dos "Termos de Uso" | Checkbox fica marcado |
| 5 | Clicar em "Confirmar Pedido" | O sistema processa o pedido (status APROVADO) e redireciona para `/success` |
#### Resultados Esperados
- O pedido deve ser gerado diretamente sem chamada de análise de crédito. O redirecionamento leva para a tela de sucesso do pedido gerado.
#### Critérios de Aceitação
- O valor total do pedido não sofre acréscimo de juros.
- O pedido possui status `APROVADO`.

---

### CT04 - Pedido com Financiamento - Score Alto (Aprovação)
#### Objetivo
Validar a aprovação automática de crédito para usuários com Score > 700.
#### Pré-Condições
- O usuário está no Checkout (`/order`) com todos os dados pessoais preenchidos corretamente incluindo loja e aceite dos termos.
- O CPF informado possui simulação de Score > 700 na API de crédito.
#### Passos
| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Selecionar a forma de pagamento "Financiamento" | O sistema exibe o campo "Valor da Entrada" e o resumo do parcelamento em 12x com juros compostos de 2% a.m |
| 2 | Inserir "0" no Valor da Entrada | O cálculo das 12 parcelas reflete o saldo total do veículo sob a taxa de 2% |
| 3 | Clicar em "Confirmar Pedido" | O sistema exibe estado de carregamento e aciona a análise de crédito |
#### Resultados Esperados
- O sistema deve validar o Score (> 700) e definir o status do pedido como `APROVADO`. O usuário é redirecionado para a página de sucesso.
#### Critérios de Aceitação
- Cálculo correto do financiamento travado em 12 vezes com juros compostos de 2%.
- Pedido criado com status de APROVADO.

---

### CT05 - Pedido com Financiamento - Score Médio (Em Análise)
#### Objetivo
Validar o fluxo de crédito para usuários com Score entre 501 e 700.
#### Pré-Condições
- O usuário está no Checkout com os dados preenchidos.
- O CPF informado retorna Score entre 501 e 700.
- Valor de entrada informado é inferior a 50% do total.
#### Passos
| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Selecionar a forma de pagamento "Financiamento" com entrada inferior a 50% | Exibição das parcelas atualizadas |
| 2 | Clicar em "Confirmar Pedido" | O sistema consulta o score e processa o checkout |
#### Resultados Esperados
- O pedido deve ser criado com status `EM_ANALISE`. O usuário é redirecionado para a página de confirmação informando que o pedido está aguardando revisão.
#### Critérios de Aceitação
- Regra de negócio de score médio (501 a 700) devidamente aplicada.

---

### CT06 - Pedido com Financiamento - Score Baixo (Reprovação)
#### Objetivo
Validar o bloqueio definitivo do crédito para score <= 500 caso não haja entrada suficiente.
#### Pré-Condições
- O usuário está no Checkout.
- O CPF informado retorna Score <= 500.
- Valor de entrada inferior a 50% do total.
#### Passos
| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Selecionar forma "Financiamento" informando R$ 0,00 de entrada | Resumo das parcelas é exibido |
| 2 | Clicar em "Confirmar Pedido" | O sistema consulta o score e processa a requisição |
#### Resultados Esperados
- O sistema deve processar o pedido marcando seu status final como `REPROVADO` e avançar para a tela de finalização deixando claro essa situação.
#### Critérios de Aceitação
- Negação de aprovação por score <= 500 aplicado corretamente.

---

### CT07 - Pedido com Financiamento - Exceção Entrada >= 50% (Aprovação Automática)
#### Objetivo
Validar se o sistema aprova um pedido com base em uma entrada alta (>= 50%), ignorando um score de crédito baixo (<= 700).
#### Pré-Condições
- O usuário está no Checkout.
- Valor total do veículo configurado: R$ 40.000.
- O CPF informado retorna Score <= 500.
#### Passos
| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Selecionar "Financiamento" | Campo de entrada exibido |
| 2 | Inserir no campo Valor da Entrada R$ 20.000 (exatamente 50% do total de R$ 40.000) | Sistema atualiza o valor a financiar para os R$ 20.000 restantes sob taxa de 2% em 12x |
| 3 | Clicar em "Confirmar Pedido" | A solicitação de checkout é disparada |
#### Resultados Esperados
- Mesmo com o score inferior, a regra de negócio da entrada superior a 50% deve ser acionada como prioridade. O sistema define o status como `APROVADO`.
#### Critérios de Aceitação
- Entrada igual ou superior a 50% garante o bypass da restrição de score.
- O pedido deve constar como APROVADO.

---

### CT08 - Validação de Campos Obrigatórios e Dados Inválidos
#### Objetivo
Garantir que não seja possível enviar o formulário de pedido sem todos os campos obrigatórios válidos.
#### Pré-Condições
- O usuário está na tela de Checkout inicial com os campos vazios.
#### Passos
| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Deixar Nome e Sobrenome em branco ou com 1 letra | Nenhuma alteração imediata ocorre |
| 2 | Inserir um E-mail em formato inválido (ex: `teste@teste`) | Nenhuma alteração imediata ocorre |
| 3 | Inserir um CPF incompleto | A máscara de inserção barra caracteres, mantendo-o incompleto |
| 4 | Não selecionar nenhuma loja (dropdown vazio) | Nenhuma alteração imediata |
| 5 | Não marcar o checkbox de "Termos de Uso" | Nenhuma alteração imediata |
| 6 | Clicar em "Confirmar Pedido" | O formulário bloqueia o envio e exibe mensagens de erro vermelhas ao lado de cada campo violado |
#### Resultados Esperados
- A ação de submissão não deve prosseguir. As validações (ex: "Nome deve ter pelo menos 2 caracteres", "Email inválido", "Aceite os termos") devem aparecer apontando corretamente as inconsistências.
#### Critérios de Aceitação
- As mensagens de erro em tela devem corresponder aos campos violados.
- Nenhuma requisição de pedido ou de análise de crédito deve ser feita à API.

---

## 4. Confirmação

### CT09 - Confirmação do Pedido 
#### Objetivo
Validar que a página de Sucesso carrega corretamente com as informações do pedido recém-criado.
#### Pré-Condições
- O usuário finalizou o checkout criando um pedido válido (status pode ser qualquer um).
#### Passos
| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Terminar o checkout após clicar em Confirmar Pedido | A página redireciona para `/success` |
| 2 | Analisar a tela apresentada | A tela exibe o número do pedido (`order_number`), resumo da configuração e o status |
#### Resultados Esperados
- O usuário deve ver uma confirmação de sua compra contendo principalmente o identificador para futuras consultas e o estado (Aprovado, Em Análise ou Reprovado) em destaque visual.
#### Critérios de Aceitação
- O número do pedido gerado tem de estar explicitamente visível na UI.

---

## 5. Consulta de Pedidos

### CT10 - Consultar Pedido (Fluxo Feliz)
#### Objetivo
Validar a pesquisa de um pedido existente a partir do seu número de identificação.
#### Pré-Condições
- O usuário está na página de Consulta de Pedidos (`/lookup`).
- Existe um pedido válido previamente criado, ex: "VLO-12345".
#### Passos
| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Inserir número do pedido "VLO-12345" no campo designado | O campo de texto captura a entrada |
| 2 | Clicar em "Buscar Pedido" | O sistema realiza a busca exibindo um spinner de carregamento |
| 3 | Aguardar o retorno | O sistema exibe um card com os detalhes da configuração comprada, dados do cliente, método de pagamento e status com ícone correspondente |
#### Resultados Esperados
- Os dados do pedido (opcionais, cor escolhida, valor total e status da análise) devem aparecer íntegros e iguais aos definidos no checkout.
#### Critérios de Aceitação
- O sistema deve buscar com sucesso as informações apenas com o número do pedido.

### CT11 - Consultar Pedido Inexistente
#### Objetivo
Validar o alerta de pedido não encontrado para buscas errôneas.
#### Pré-Condições
- O usuário está na tela de Consulta de Pedidos.
#### Passos
| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1 | Inserir um número de pedido inexistente, ex: "NAO-EXISTE" | O campo captura a entrada |
| 2 | Clicar em "Buscar Pedido" | O sistema tenta buscar os dados |
#### Resultados Esperados
- O sistema deve retornar um erro ou um card indicando claramente: "Pedido não encontrado" e orientar o usuário a verificar a digitação.
#### Critérios de Aceitação
- O aplicativo não deve quebrar ou exibir logs técnicos de erro (ex: retornos CRASH 500 brutos) e sim tratar a ausência gracefully.

### CT12 - Configuração do Veículo (Adição de Opcionais) e Cálculo de Preço

#### Objetivo
Validar se a seleção de opcionais ("Precision Park" e "Flux Capacitor") atualiza dinamicamente o preço do veículo.

#### Pré-Condições
- Estar na página do Configurador.
- Veículo sem opcionais selecionados (Preço R$: 40.000,00).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Marcar o checkbox do opcional "Precision Park" | O preço de venda deve ser acrescido de R$ 5.500,00 (Total temporário: R$ 45.500,00). |
| 2  | Marcar o checkbox do opcional "Flux Capacitor" | O preço de venda deve ser acrescido de R$ 5.000,00 (Total temporário: R$ 50.500,00). |
| 3  | Desmarcar os checkboxes dos opcionais | O preço total deve subtrair os valores respectivos e voltar a R$ 40.000,00. |
| 4  | Clicar no botão "Monte o Seu" (Checkout) | O usuário é redirecionado para a página de checkout (`/order`) com os valores persistidos. |

#### Resultados Esperados
- O preço total acompanha de forma exata a marcação e desmarcação dos opcionais.
- O redirecionamento leva a configuração e o preço corretos para o Checkout.

#### Critérios de Aceitação
- O opcional "Precision Park" custa +R$ 5.500 e "Flux Capacitor" custa +R$ 5.000.
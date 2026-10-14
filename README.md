# Simulador de Algoritmo Genético

Simulador interativo de um algoritmo genético aplicado à seleção de projetos de melhoria de um campus universitário, desenvolvido como atividade prática da disciplina de Inteligência Artificial da Universidade Federal do Piauí (UFPI).

## 1. Sobre o projeto

O objetivo do projeto é implementar e visualizar o funcionamento de um **algoritmo genético** para selecionar um conjunto de projetos que maximize o benefício total obtido, respeitando um orçamento disponível.

Cada projeto possui um custo e um benefício. O algoritmo explora diferentes combinações de projetos ao longo de várias gerações, utilizando mecanismos inspirados na evolução natural, como seleção, cruzamento, mutação e elitismo.

A aplicação permite cadastrar projetos, configurar os parâmetros do algoritmo, acompanhar a evolução das soluções e visualizar a melhor combinação encontrada.

### Problema de otimização

O problema consiste em maximizar o benefício total dos projetos selecionados sem ultrapassar o orçamento disponível.

Matematicamente, o objetivo é:

**Maximizar:**


$$
\boxed{\text{Maximizar } B = \sum_{i=1}^{n} b_i x_i}
$$

**Sujeito a:**

$$
\boxed{\sum_{i=1}^{n} c_i x_i \leq O}
$$

Em que:

- $B$: benefício total dos projetos selecionados.
- $b_i$: benefício do projeto $i$.
- $c_i$: custo do projeto $i$.
- $x_i$: indica se o projeto $i$ foi selecionado ($1$) ou não ($0$).
- $n$: quantidade total de projetos.
- $O$: orçamento disponível.

Cada variável binária pode assumir os valores:

- `1`: o projeto foi selecionado;
- `0`: o projeto não foi selecionado.

## 2. Tecnologias utilizadas

- **HTML5:** estrutura da aplicação e dos formulários.
- **CSS3:** estilização, organização dos painéis e adaptação da interface.
- **JavaScript (ES Modules):** implementação do algoritmo genético, validações, simulação e atualização dos resultados no navegador.
- **Git e GitHub:** versionamento e hospedagem do código-fonte.
- **Visual Studio Code:** ambiente de desenvolvimento.
- **Live Server:** execução local da aplicação durante o desenvolvimento.
- **GitHub Pages:** opção de publicação da aplicação como página estática.

O projeto funciona inteiramente no navegador, sem necessidade de backend ou banco de dados. O algoritmo genético é implementado em JavaScript, sem depender de bibliotecas externas de otimização.

## 3. Estrutura do projeto

```text
simulador-algoritmo-genetico/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── main.js
│   ├── validation.js
│   ├── random.js
│   ├── evaluation.js
│   ├── repair.js
│   ├── operators.js
│   ├── geneticAlgorithm.js
│   └── simulation.js
│
└── README.md
```

### Responsabilidade de cada arquivo

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Define a estrutura da página, os formulários, os controles da simulação e as áreas de resultados. |
| `css/style.css` | Define o visual da aplicação, os painéis, os campos, os botões e a apresentação dos resultados. |
| `js/main.js` | Integra a interface às funções do algoritmo, trata as interações do usuário e atualiza os resultados na página. |
| `js/validation.js` | Valida os parâmetros da simulação e impede a utilização de configurações inválidas. |
| `js/random.js` | Implementa um gerador pseudoaleatório determinístico a partir de uma semente. |
| `js/evaluation.js` | Calcula o custo total, o benefício total e a aptidão (*fitness*) de uma solução. |
| `js/repair.js` | Corrige soluções que ultrapassam o orçamento, removendo projetos conforme a regra de reparo. |
| `js/operators.js` | Arquivo destinado à organização dos operadores genéticos, caso sejam implementados ou utilizados separadamente. |
| `js/geneticAlgorithm.js` | Reúne as operações principais do algoritmo genético, incluindo geração inicial, seleção, cruzamento, mutação e formação da nova população. |
| `js/simulation.js` | Controla o estado da simulação, as gerações, o histórico e a melhor solução acumulada. |
| `README.md` | Documenta o projeto, sua organização, seu funcionamento e as instruções de execução. |

## 4. Funcionalidades implementadas

### 4.1. Cadastro de projetos

A interface permite cadastrar, editar e remover projetos que poderão ser selecionados pelo algoritmo genético.

Cada projeto contém:

- Nome;
- Custo;
- Benefício.

A quantidade de projetos permitida é de 4 a 15.

### 4.2. Configuração da simulação

O usuário pode configurar os seguintes parâmetros:

| Parâmetro | Descrição |
|---|---|
| Orçamento | Valor máximo disponível para selecionar projetos. |
| Tamanho da população | Quantidade de indivíduos em cada geração. |
| Número de gerações | Quantidade máxima de gerações a executar. |
| Taxa de cruzamento | Probabilidade de ocorrer cruzamento entre um par de pais. |
| Taxa de mutação | Probabilidade de mutação aplicada individualmente a cada gene. |
| Tamanho do torneio | Quantidade de indivíduos candidatos em cada seleção por torneio. |
| Indivíduos de elite | Quantidade de melhores indivíduos preservados na geração seguinte. |
| Semente aleatória | Valor utilizado para reproduzir a sequência pseudoaleatória da execução. |

A aplicação valida os parâmetros antes de iniciar a simulação.

### 4.3. Representação dos indivíduos

Cada indivíduo é representado por um cromossomo binário. Cada gene corresponde a um projeto cadastrado.

Por exemplo:

```text
Cromossomo: 1100

Projeto A: selecionado
Projeto B: selecionado
Projeto C: não selecionado
Projeto D: não selecionado
```

A quantidade de genes de cada cromossomo corresponde à quantidade de projetos cadastrados.

### 4.4. População inicial

A população inicial é gerada aleatoriamente. Cada gene possui probabilidade de 50% de assumir o valor `0` ou `1`.

Após a geração, cada indivíduo passa pelo procedimento de reparo para garantir que respeite o orçamento.

### 4.5. Avaliação das soluções

A avaliação calcula:

- Custo total dos projetos selecionados;
- Benefício total;
- Aptidão (*fitness*) do indivíduo.

A aptidão corresponde ao benefício total da solução após o reparo. Como soluções inviáveis são reparadas antes da avaliação, os indivíduos avaliados respeitam o orçamento.

### 4.6. Seleção por torneio

Na seleção por torneio, são escolhidos candidatos distintos da população, e o indivíduo com maior aptidão vence.

Em caso de empate, vence o indivíduo que aparece primeiro na população original, conforme o índice utilizado na implementação.

Os indivíduos selecionados são utilizados como pais na reprodução.

### 4.7. Cruzamento de um ponto

O cruzamento combina partes dos cromossomos de dois pais para produzir descendentes.

Um ponto de corte é escolhido aleatoriamente entre os genes, dividindo os cromossomos em duas partes. Os descendentes recebem uma parte de cada progenitor.

O cruzamento ocorre de acordo com a taxa configurada pelo usuário.

### 4.8. Mutação

A mutação é aplicada independentemente a cada gene, de acordo com a taxa configurada.

Quando ocorre uma mutação, o gene é invertido:

- `0` passa a ser `1`;
- `1` passa a ser `0`.

Esse mecanismo introduz diversidade na população e permite explorar novas combinações de projetos.

### 4.9. Elitismo

O elitismo preserva os melhores indivíduos da população atual, copiando-os para a próxima geração sem modificações.

Isso ajuda a evitar a perda das melhores soluções encontradas durante a evolução.

### 4.10. Reparo de soluções inviáveis

Quando uma solução ultrapassa o orçamento, o algoritmo remove projetos selecionados até que o custo total seja compatível com o orçamento.

A cada etapa, é removido o projeto com a menor razão benefício/custo:

$$
\boxed{r_i = \frac{b_i}{c_i}}
$$

Em caso de empate, é removido primeiro o projeto com menor índice na lista de projetos.

O procedimento é aplicado tanto à população inicial quanto aos descendentes gerados durante a execução.

Uma solução sem projetos selecionados também é válida, possuindo custo e benefício iguais a zero.

### 4.11. Controle da simulação

A interface disponibiliza os controles para:

- Executar o algoritmo;
- Pausar a execução;
- Avançar uma geração por vez;
- Reiniciar a simulação.

A execução é encerrada quando o número de gerações configurado é atingido.

O reinício cria uma nova população inicial e limpa o histórico da execução anterior, utilizando a semente configurada.

### 4.12. Visualização dos resultados

Durante a simulação, a aplicação apresenta:

- Geração atual;
- Melhor aptidão da geração;
- Aptidão média da população;
- Melhor benefício acumulado;
- Cromossomo da melhor solução;
- Projetos selecionados;
- Custo total;
- Benefício total;
- Orçamento restante;
- Histórico das gerações;
- Logs dos eventos do algoritmo.

## 5. Projetos utilizados como exemplo

A aplicação inicia com quatro projetos de melhoria do campus.

| Projeto | Custo | Benefício |
|---|---:|---:|
| A — Iluminação do campus | R$ 4.000,00 | 7 |
| B — Bicicletários | R$ 3.000,00 | 5 |
| C — Bancos para áreas comuns | R$ 2.000,00 | 3 |
| D — Reforma da área de convivência | R$ 5.000,00 | 8 |

O orçamento inicial é de R$ 7.000,00.

Uma solução ótima para esses valores é o cromossomo `1100`, que seleciona os projetos A e B:

- Custo total: R$ 7.000,00;
- Benefício total: 12;
- Orçamento restante: R$ 0,00.

Esse exemplo pode ser utilizado para verificar se a aplicação calcula corretamente o custo e o benefício das soluções.

## 6. Instruções de execução

### 6.1. Requisitos

Para executar a aplicação localmente, são necessários:

- Um navegador atualizado, como Google Chrome, Firefox ou Microsoft Edge;
- Os arquivos do projeto;
- Visual Studio Code, caso deseje utilizar o Live Server.

Não é necessário instalar Python, Node.js ou dependências de backend para executar a versão estática da aplicação.

### 6.2. Baixando o projeto

Clone o repositório utilizando o seguinte comando no terminal:

```bash
git clone https://github.com/MonnikLuianne/simulador-de-algoritmo-genetico.git
```

Entre na pasta do projeto:

```bash
cd simulador-de-algoritmo-genetico
```

### 6.3. Executando no Visual Studio Code

1. Abra a pasta do projeto no Visual Studio Code.
2. Instale a extensão **Live Server**, caso ainda não esteja instalada.
3. Abra o arquivo `index.html`.
4. Clique com o botão direito no arquivo.
5. Selecione **Open with Live Server**.
6. A aplicação será aberta no navegador.

Como o projeto utiliza módulos JavaScript, recomenda-se executar a aplicação por meio do Live Server ou de outro servidor estático local, em vez de abrir o arquivo HTML diretamente pelo sistema de arquivos.

### 6.4. Utilizando a aplicação

1. Confira os projetos cadastrados ou adicione novos projetos.
2. Edite os nomes, custos e benefícios conforme necessário.
3. Defina o orçamento disponível.
4. Configure a população, o número de gerações e os operadores genéticos.
5. Informe a semente aleatória.
6. Clique em **Executar**.
7. Acompanhe a evolução das gerações, os indicadores, a melhor solução e o histórico.
8. Utilize **Pausar** para interromper temporariamente a execução.
9. Utilize **Avançar uma geração** para observar a evolução passo a passo.
10. Utilize **Reiniciar** para começar uma nova simulação com a configuração atual.

Se os projetos ou os parâmetros forem alterados, reinicie a simulação para aplicar as alterações.

## 7. Publicação no GitHub Pages

Por ser uma aplicação estática, o projeto pode ser hospedado pelo GitHub Pages.

Para publicar:

1. Envie todos os arquivos para um repositório público no GitHub.
2. Acesse as configurações do repositório em **Settings**.
3. Abra a seção **Pages**.
4. Em *Build and deployment*, selecione a publicação a partir de uma branch.
5. Escolha a branch principal, geralmente `main`, e a pasta raiz (`/root`).
6. Salve as configurações.
7. Aguarde a publicação e acesse o endereço disponibilizado pelo GitHub Pages.

Após a publicação, teste os controles, os campos e a execução do algoritmo diretamente pelo link público.

**Link do repositório:** `https://github.com/MonnikLuianne/simulador-de-algoritmo-genetico`

**Link da aplicação publicada:** `https://monnikluianne.github.io/simulador-de-algoritmo-genetico/`

## 8. Testes e validação

Durante o desenvolvimento, foram realizados testes de funcionamento das principais operações do algoritmo e da simulação.

Entre os comportamentos verificados estão:

- Geração de uma população com o tamanho configurado;
- Respeito ao orçamento após o reparo;
- Seleção por torneio;
- Cruzamento de um ponto;
- Mutação de genes;
- Formação de uma nova geração;
- Preservação da melhor aptidão pelo elitismo;
- Atualização dos resultados e do histórico.

Também é importante conferir os seguintes cenários antes da entrega:

| Cenário | Resultado esperado |
|---|---|
| Orçamento de R$ 7.000,00 com os projetos padrão | A solução `1100` possui custo de R$ 7.000,00 e benefício 12. |
| Orçamento igual a zero | A solução viável é o cromossomo com todos os genes iguais a `0`. |
| Orçamento de R$ 14.000,00 com os projetos padrão | Todos os projetos podem ser selecionados, resultando em benefício 23. |
| Semente repetida e mesma configuração | A execução deve produzir os mesmos resultados, desde que todas as operações aleatórias utilizem o gerador semeado de forma consistente. |
| Solução acima do orçamento | O reparo deve remover projetos até que a solução respeite o orçamento. |
| Execução com elitismo | A melhor aptidão da geração não deve diminuir quando o elitismo preserva o melhor indivíduo e a avaliação permanece consistente. |

Os resultados específicos dos testes devem ser registrados conforme as execuções efetivamente realizadas.

## 9. Limitações e observações

- A qualidade da solução encontrada depende dos parâmetros configurados e da aleatoriedade da busca.
- O algoritmo genético não garante encontrar a solução ótima em todas as execuções.
- A semente aleatória permite reproduzir a execução quando a implementação utiliza o mesmo fluxo pseudoaleatório para todas as operações.
- A solução apresentada é executada no navegador e não utiliza backend.
- Os dados dos projetos e o estado da simulação são mantidos durante a execução da página; não há persistência automática em banco de dados.

## 10. Autoria

**Instituição:** Universidade Federal do Piauí (UFPI)

**Disciplina:** Inteligência Artificial

**Trabalho:** Simulador de Algoritmo Genético

**Integrantes:**
- Nome do integrante 1
- Nome do integrante 2

**Professor(a):** Nome do(a) professor(a)

## 11. Considerações finais

O projeto demonstra a aplicação prática de algoritmos genéticos em um problema de seleção de projetos com restrição orçamentária. A implementação reúne representação binária, avaliação de aptidão, seleção por torneio, cruzamento, mutação, elitismo e reparo de soluções inviáveis.

A interface permite acompanhar o processo evolutivo e observar como diferentes configurações influenciam a busca por soluções com maior benefício total, respeitando o orçamento disponível.


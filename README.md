# Simulador de Algoritmo Genético

Simulador interativo de um algoritmo genético aplicado à seleção de projetos de melhoria de um campus universitário. Desenvolvido como atividade prática da disciplina de Inteligência Artificial da Universidade Federal do Piauí (UFPI).

**Repositório:** https://github.com/MonnikLuianne/simulador-de-algoritmo-genetico

**Aplicação publicada:** https://monnikluianne.github.io/simulador-de-algoritmo-genetico/

## 1. Sobre o projeto

O objetivo deste projeto é implementar e visualizar o funcionamento de um **algoritmo genético** aplicado a um problema de otimização com restrição orçamentária.

A aplicação busca selecionar um conjunto de projetos que maximize o benefício total obtido, sem ultrapassar o orçamento disponível. Cada projeto possui um custo e um benefício, e sua seleção é representada por um cromossomo binário.

Ao longo das gerações, o algoritmo utiliza mecanismos inspirados na evolução natural, como seleção por torneio, cruzamento, mutação e elitismo. Além disso, aplica um procedimento de reparo para corrigir soluções que ultrapassem o orçamento.

A interface permite cadastrar e editar projetos, configurar os parâmetros do algoritmo, acompanhar a evolução das populações e visualizar os resultados da simulação.

## 2. Formulação do problema

O problema consiste em selecionar projetos de forma a maximizar o benefício total, respeitando o orçamento disponível.

**Função objetivo:**

$$
\text{Maximizar } B = \sum_{i=1}^{n} b_i x_i
$$

**Restrição orçamentária:**

$$
\sum_{i=1}^{n} c_i x_i \leq O
$$

Em que:

- $B$: benefício total dos projetos selecionados.
- $b_i$: benefício do projeto $i$.
- $c_i$: custo do projeto $i$.
- $x_i \in \{0,1\}$: variável binária que indica se o projeto $i$ foi selecionado.
- $n$: quantidade de projetos cadastrados.
- $O$: orçamento disponível.

Cada variável de decisão pode assumir dois valores:

- `1`: o projeto foi selecionado.
- `0`: o projeto não foi selecionado.

O objetivo do algoritmo é encontrar combinações de projetos com o maior benefício total possível dentro da restrição orçamentária.

## 3. Tecnologias utilizadas

- **HTML5:** estrutura da aplicação.
- **CSS3:** estilização da interface, dos painéis, dos cromossomos e dos resultados.
- **JavaScript (ES Modules):** implementação do algoritmo genético, das validações, da simulação e das interações da interface.
- **SVG:** representação gráfica da evolução dos resultados.
- **Git e GitHub:** versionamento e hospedagem do código-fonte.
- **Visual Studio Code:** ambiente de desenvolvimento.
- **Live Server:** execução local da aplicação durante o desenvolvimento.
- **GitHub Pages:** publicação da aplicação na web.

O projeto é executado diretamente no navegador, sem necessidade de backend ou banco de dados. O algoritmo genético é implementado em JavaScript, sem dependência de bibliotecas externas de otimização.

## 4. Estrutura do projeto

```text
simulador-de-algoritmo-genetico/
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
│   ├── geneticAlgorithm.js
│   └── simulation.js
│
└── README.md
```

### Responsabilidade dos arquivos

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Define a estrutura da página, os formulários, os controles e as áreas de visualização. |
| `css/style.css` | Define a aparência da aplicação, os painéis, os botões, as animações e a apresentação dos resultados. |
| `js/main.js` | Integra a interface às funções do algoritmo, gerencia as interações do usuário, apresenta os resultados e controla a animação. |
| `js/validation.js` | Valida os projetos e os parâmetros da simulação. |
| `js/random.js` | Implementa um gerador pseudoaleatório baseado em uma semente. |
| `js/evaluation.js` | Calcula o custo total, o benefício total e a aptidão (*fitness*) de uma solução. |
| `js/repair.js` | Repara soluções que ultrapassam o orçamento, removendo projetos conforme a regra estabelecida. |
| `js/geneticAlgorithm.js` | Implementa a geração da população inicial, a seleção por torneio, o cruzamento, a mutação, o elitismo e a formação das novas gerações. |
| `js/simulation.js` | Gerencia o estado da simulação, as gerações, o histórico e a melhor solução acumulada. |
| `README.md` | Documenta o projeto, os algoritmos utilizados e as instruções de execução. |

## 5. Funcionalidades

### 5.1. Cadastro e edição de projetos

A aplicação permite cadastrar, editar e remover projetos que poderão ser selecionados pelo algoritmo genético.

Cada projeto possui três informações:

- Nome;
- Custo;
- Benefício.

A quantidade permitida é de **4 a 15 projetos**.

As validações dos dados incluem:

- Nome não vazio;
- Custo maior que zero, com no máximo duas casas decimais;
- Benefício maior ou igual a zero.

### 5.2. Configuração do algoritmo

O usuário pode configurar os seguintes parâmetros:

| Parâmetro | Descrição |
|---|---|
| Orçamento | Valor máximo disponível para selecionar projetos. |
| Tamanho da população | Quantidade de indivíduos em cada geração. Deve ser um número inteiro maior ou igual a 2. |
| Número de gerações | Quantidade de gerações a executar. Deve ser um número inteiro maior ou igual a 1. |
| Taxa de cruzamento | Probabilidade percentual de ocorrer cruzamento entre um par de pais. |
| Taxa de mutação | Probabilidade percentual de mutação aplicada individualmente a cada gene. |
| Tamanho do torneio | Quantidade de candidatos distintos considerados em cada seleção. Deve ser maior ou igual a 2 e não pode superar o tamanho da população. |
| Indivíduos de elite | Quantidade de melhores indivíduos preservados na geração seguinte, sem modificações. Deve ser menor que o tamanho da população. |
| Semente aleatória | Valor inteiro utilizado para controlar a sequência pseudoaleatória e possibilitar a reprodução de uma execução. |

As taxas de cruzamento e mutação variam de 0% a 100%. A aplicação valida as configurações antes de iniciar a simulação.

### 5.3. Representação dos indivíduos

Cada indivíduo é representado por um cromossomo binário. Cada gene corresponde a um projeto cadastrado, mantendo a mesma ordem da lista de projetos.

Por exemplo, para quatro projetos:

```text
Cromossomo: 1100

Projeto A: selecionado
Projeto B: selecionado
Projeto C: não selecionado
Projeto D: não selecionado
```

Nesse exemplo, os projetos A e B são selecionados, enquanto C e D não fazem parte da solução.

A quantidade de genes de cada cromossomo corresponde à quantidade de projetos cadastrados.

### 5.4. Geração da população inicial

A população inicial é criada aleatoriamente. Cada gene tem probabilidade de 50% de assumir o valor `0` ou `1`.

Após a geração, cada indivíduo passa pelo procedimento de reparo, de modo que as soluções utilizadas na população inicial respeitem o orçamento.

### 5.5. Avaliação das soluções

A avaliação de cada indivíduo considera:

- Custo total dos projetos selecionados;
- Benefício total dos projetos selecionados;
- Aptidão (*fitness*).

A aptidão corresponde ao benefício total da solução:

$$
\text{Fitness}(x) = \sum_{i=1}^{n} b_i x_i
$$

Como o algoritmo repara soluções inviáveis antes da avaliação, a aptidão é calculada sobre cromossomos que respeitam a restrição orçamentária.

### 5.6. Seleção por torneio

Na seleção por torneio, são escolhidos candidatos distintos da população. O indivíduo com maior aptidão vence e é selecionado como pai.

Em caso de empate, vence o indivíduo que aparece primeiro na população original, considerando seu índice.

Os pais são selecionados a partir da população da geração atual, antes da formação da próxima geração.

### 5.7. Cruzamento de um ponto

O cruzamento combina partes dos cromossomos de dois pais para gerar descendentes.

Um ponto de corte é escolhido aleatoriamente entre as posições internas permitidas do cromossomo. Os descendentes recebem segmentos dos dois pais, formando novas combinações de projetos.

O cruzamento é realizado de acordo com a taxa configurada pelo usuário.

Quando não ocorre cruzamento, os descendentes são cópias dos cromossomos dos pais, que ainda podem sofrer mutação e reparo.

### 5.8. Mutação

A mutação é aplicada independentemente a cada gene, conforme a taxa de mutação configurada.

Quando ocorre uma mutação, o valor do gene é invertido:

- `0` passa a ser `1`;
- `1` passa a ser `0`.

A mutação introduz diversidade na população e permite explorar novas combinações de projetos.

### 5.9. Elitismo

O elitismo preserva os melhores indivíduos da população atual, copiando-os para a geração seguinte sem alterações.

Os indivíduos de elite são selecionados de acordo com a aptidão, utilizando a ordem original da população para desempatar soluções de mesma aptidão.

Esse mecanismo ajuda a evitar a perda das melhores soluções encontradas durante a evolução.

### 5.10. Reparo das soluções

Uma solução é inviável quando o custo total dos projetos selecionados ultrapassa o orçamento.

Para corrigir esse problema, o algoritmo remove projetos selecionados até que o custo total respeite a restrição orçamentária.

A cada etapa, é removido o projeto com a menor razão entre benefício e custo:

$$
r_i = \frac{b_i}{c_i}
$$

Em caso de empate, é removido primeiro o projeto com menor índice na lista.

O reparo é aplicado tanto aos indivíduos da população inicial quanto aos descendentes produzidos durante a reprodução.

Uma solução sem projetos selecionados também é válida. Nesse caso, o custo total e o benefício total são iguais a zero.

### 5.11. Controle da simulação

A interface permite acompanhar e controlar a execução do algoritmo por meio dos recursos disponíveis na aplicação, incluindo:

- Executar a simulação;
- Pausar e retomar a execução;
- Avançar uma geração por vez;
- Reiniciar a simulação;
- Consultar o resultado final de todas as gerações.

A execução termina quando o número de gerações configurado é atingido.

A opção de visualizar o resultado final de todas as gerações permite concluir a execução sem precisar acompanhar individualmente todas as etapas da animação.

Ao reiniciar, a aplicação cria uma nova população inicial, reinicia o histórico e utiliza a semente configurada.

**Importante:** alterações nos projetos ou nos parâmetros exigem o reinício da simulação para que sejam aplicadas à nova execução.

### 5.12. Animações e logs

Durante a execução, a interface apresenta os eventos do algoritmo para ajudar a compreender o processo evolutivo.

Os logs podem representar eventos como:

- Seleção dos pais;
- Realização ou ausência de cruzamento;
- Ponto de corte;
- Cromossomos descendentes;
- Mutações nos genes;
- Reparação de soluções que ultrapassam o orçamento;
- Preservação dos indivíduos de elite;
- Formação das novas gerações.

A animação permite acompanhar visualmente os cromossomos e as etapas da evolução. Os logs complementam essa visualização, registrando os eventos ocorridos durante a simulação.

### 5.13. Visualização dos resultados

A aplicação apresenta informações sobre a geração atual e a evolução das soluções, incluindo:

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
- População da geração;
- Logs dos eventos;
- Gráfico de evolução das aptidões.

O gráfico permite acompanhar a variação da melhor aptidão de cada geração, da aptidão média e da melhor aptidão acumulada durante a execução.

## 6. Projetos utilizados como exemplo

A aplicação inicia com quatro projetos de melhoria do campus universitário.

| Projeto | Custo | Benefício |
|---|---:|---:|
| A — Iluminação do campus | R$ 4.000,00 | 7 |
| B — Bicicletários | R$ 3.000,00 | 5 |
| C — Bancos para áreas comuns | R$ 2.000,00 | 3 |
| D — Reforma da área de convivência | R$ 5.000,00 | 8 |

O orçamento inicial é de **R$ 7.000,00**.

Uma solução ótima para esses valores é o cromossomo `1100`, que seleciona os projetos A e B.

| Indicador | Resultado |
|---|---:|
| Cromossomo | `1100` |
| Projetos selecionados | A e B |
| Custo total | R$ 7.000,00 |
| Benefício total | 12 |
| Orçamento restante | R$ 0,00 |

A combinação de todos os quatro projetos possui custo total de R$ 14.000,00 e benefício total de 23. Portanto, ela só é viável quando o orçamento permite esse valor.

Esse exemplo pode ser utilizado para conferir os cálculos de custo, benefício e aptidão da aplicação.

## 7. Instruções de execução

### 7.1. Requisitos

Para executar a aplicação localmente, são necessários:

- Um navegador atualizado, como Google Chrome, Mozilla Firefox ou Microsoft Edge;
- Os arquivos do projeto;
- Visual Studio Code e Live Server, caso prefira executar por meio dessa ferramenta.

Não é necessário instalar Python, Node.js, um banco de dados ou dependências de backend para executar a versão estática.

### 7.2. Clonando o repositório

No terminal, execute:

```bash
git clone https://github.com/MonnikLuianne/simulador-de-algoritmo-genetico.git
```

Entre na pasta do projeto:

```bash
cd simulador-de-algoritmo-genetico
```

### 7.3. Executando com o Visual Studio Code

1. Abra a pasta do projeto no Visual Studio Code.
2. Instale a extensão **Live Server**, caso ainda não esteja instalada.
3. Abra o arquivo `index.html`.
4. Clique com o botão direito no arquivo.
5. Selecione **Open with Live Server**.
6. A aplicação será aberta no navegador.

Como o projeto utiliza módulos JavaScript, recomenda-se executar a aplicação por meio do Live Server ou de outro servidor estático local, em vez de abrir o HTML diretamente pelo sistema de arquivos.

### 7.4. Utilizando a aplicação

1. Confira os projetos cadastrados ou adicione novos projetos.
2. Edite os nomes, os custos e os benefícios, se necessário.
3. Defina o orçamento disponível.
4. Configure o tamanho da população e o número de gerações.
5. Configure as taxas de cruzamento e mutação.
6. Defina o tamanho do torneio, a quantidade de indivíduos de elite e a semente aleatória.
7. Inicie a simulação.
8. Acompanhe as gerações, os cromossomos, os logs, os indicadores e o gráfico.
9. Utilize os controles de pausa e avanço de geração para acompanhar o algoritmo passo a passo.
10. Utilize a opção de resultado final para concluir e consultar a execução completa.
11. Reinicie a simulação quando desejar iniciar uma nova execução ou aplicar alterações.

## 8. Publicação no GitHub Pages

A aplicação pode ser publicada pelo GitHub Pages por ser um projeto estático, sem necessidade de servidor backend.

O procedimento geral é:

1. Enviar os arquivos do projeto para um repositório no GitHub.
2. Acessar **Settings** no repositório.
3. Abrir a seção **Pages**.
4. Em *Build and deployment*, selecionar a publicação a partir de uma branch.
5. Escolher a branch principal, geralmente `main`, e a pasta raiz (`/root`).
6. Salvar as configurações.
7. Aguardar a conclusão da publicação.
8. Acessar o endereço fornecido pelo GitHub Pages.

Após alterações no código, é necessário enviá-las ao GitHub e aguardar a conclusão da implantação antes de verificar a versão publicada.

**Repositório:** https://github.com/MonnikLuianne/simulador-de-algoritmo-genetico

**Aplicação publicada:** https://monnikluianne.github.io/simulador-de-algoritmo-genetico/

## 9. Testes e validação

A validação da aplicação deve contemplar os cálculos, os operadores genéticos, a evolução da população, os controles da interface e a reprodutibilidade das execuções.

Os seguintes cenários são recomendados para verificar o funcionamento:

| Cenário | Resultado esperado |
|---|---|
| Orçamento de R$ 7.000,00 com os projetos padrão | O cromossomo `1100` apresenta custo de R$ 7.000,00 e benefício 12. |
| Orçamento igual a zero | As soluções reparadas possuem todos os genes iguais a `0`. |
| Orçamento de R$ 14.000,00 com os projetos padrão | O cromossomo `1111` é viável e apresenta benefício 23. |
| Solução acima do orçamento | O reparo remove projetos até que a solução respeite o orçamento. |
| Taxa de mutação igual a 0% | Nenhum gene sofre mutação. |
| Taxa de mutação igual a 100% | Todos os genes dos descendentes submetidos à mutação são invertidos. |
| Taxa de cruzamento igual a 0% | O cruzamento não é realizado. |
| Taxa de cruzamento igual a 100% | O cruzamento é realizado para os pares de pais processados. |
| Semente e configurações repetidas | A execução deve reproduzir os mesmos resultados quando a configuração e a sequência de operações pseudoaleatórias são mantidas. |
| Execução com elitismo | A melhor aptidão da geração não deve diminuir quando o melhor indivíduo é preservado e a avaliação permanece consistente. |
| Configurações inválidas | A aplicação deve impedir o início da simulação e informar os erros de validação. |
| Avanço de geração | O número da geração, a população e o histórico devem ser atualizados. |
| Reinício da simulação | A execução anterior deve ser encerrada e o histórico reiniciado. |
| Resultado final de todas as gerações | A simulação deve avançar até a quantidade de gerações configurada e apresentar os resultados finais. |

Os cenários apresentados constituem uma referência para os testes funcionais. Os resultados devem ser registrados conforme as execuções efetivamente realizadas, sem considerar um cenário como aprovado antes de verificá-lo.

## 10. Limitações e observações

- O algoritmo genético é um método de busca heurística e não garante encontrar a solução ótima em todas as configurações e execuções.
- A qualidade das soluções depende dos parâmetros utilizados, da população inicial e das operações genéticas.
- A semente aleatória permite reproduzir uma execução quando a configuração e a sequência de operações pseudoaleatórias são mantidas.
- O reparo assegura que as soluções avaliadas respeitem o orçamento, mas a remoção de projetos conforme a razão benefício/custo é uma estratégia de reparo, não uma garantia geral de otimalidade.
- A aplicação funciona no navegador e não utiliza backend.
- Não há persistência automática dos projetos ou do estado da simulação em banco de dados; o estado é mantido durante a utilização da página.
- A edição de projetos ou parâmetros exige reiniciar a simulação para aplicar as alterações.

## 11. Autoria

**Instituição:** Universidade Federal do Piauí (UFPI)

**Disciplina:** Inteligência Artificial

**Trabalho:** Simulador de Algoritmo Genético

**Integrantes:**

- Monnik Luianne Oliveira Nascimento Veloso Barbosa
- João Pedro Pereira da Luz
- Guilherme Ribeiro Nunes Batista

**Professor:** Pedro Almir Martins de Oliveira

## 12. Considerações finais

O projeto demonstra a aplicação prática de algoritmos genéticos em um problema de seleção de projetos com restrição orçamentária.

A implementação reúne representação binária, avaliação de aptidão, seleção por torneio, cruzamento de um ponto, mutação, elitismo e reparo de soluções inviáveis.

A interface permite acompanhar a evolução das populações, observar os efeitos dos operadores genéticos e comparar os resultados obtidos ao longo das gerações. Dessa forma, o simulador auxilia na compreensão do funcionamento de um algoritmo genético e da influência dos parâmetros sobre a busca por soluções de maior benefício total, respeitando o orçamento disponível.

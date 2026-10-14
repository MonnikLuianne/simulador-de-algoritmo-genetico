# Simulador de Algoritmo Genético

Projeto desenvolvido para a disciplina de **Inteligência Artificial**, com o objetivo de implementar e visualizar o funcionamento de um algoritmo genético aplicado ao problema de seleção de projetos com orçamento limitado.

O simulador permite configurar os projetos, definir os parâmetros do algoritmo genético, acompanhar as gerações e analisar a melhor solução encontrada.

## Integrantes

- Monnik Luianne Oliveira Nascimento Veloso Barbosa
- João Pedro Pereira da Luz
- Guilherme Ribeiro Nunes Batista

**Professor:** Pedro Almir Martins de Oliveira

## Objetivo do projeto

O problema consiste em selecionar um conjunto de projetos de forma que o benefício total seja maximizado, sem ultrapassar o orçamento disponível.

Cada projeto possui:

- **Custo:** valor necessário para executar o projeto.
- **Benefício:** pontuação associada à realização do projeto.

A seleção dos projetos é representada por um cromossomo binário, no qual cada gene indica se determinado projeto foi selecionado.

- `1`: o projeto foi selecionado.
- `0`: o projeto não foi selecionado.

Por exemplo, o cromossomo `1100` indica que os dois primeiros projetos foram selecionados, enquanto os dois últimos não foram escolhidos.

## Formulação matemática

Considere:

- \(n\): número de projetos.
- \(c_i\): custo do projeto \(i\).
- \(b_i\): benefício do projeto \(i\).
- \(x_i\): variável binária que indica se o projeto \(i\) foi selecionado.
- \(O\): orçamento disponível.

A variável de decisão é definida por:

$$
x_i \in \{0,1\}, \quad i=1,\ldots,n
$$

### Função objetivo

O objetivo é maximizar o benefício total dos projetos selecionados:

$$
\boxed{\text{Maximizar } B = \sum_{i=1}^{n} b_i x_i}
$$

### Restrição orçamentária

O custo total dos projetos selecionados não pode ultrapassar o orçamento disponível:

$$
\boxed{\sum_{i=1}^{n} c_i x_i \leq O}
$$

### Função de avaliação (fitness)

A aptidão de um cromossomo válido corresponde à soma dos benefícios dos projetos selecionados:

$$
f(x) = \sum_{i=1}^{n} b_i x_i
$$

Como o objetivo é maximizar o benefício, cromossomos com maior valor de fitness representam soluções melhores.

### Reparo de soluções inviáveis

Quando o custo total de um cromossomo ultrapassa o orçamento, o simulador remove projetos até que a solução se torne viável.

Para decidir qual projeto remover, utiliza-se a razão entre benefício e custo:

$$
r_i = \frac{b_i}{c_i}
$$

Enquanto o custo total exceder o orçamento, remove-se o projeto selecionado com a menor razão \(r_i\). Em caso de empate, é removido o projeto de menor índice.

O procedimento termina quando:

$$
\sum_{i=1}^{n} c_i x_i \leq O
$$

## Funcionamento do algoritmo genético

O algoritmo genético busca boas soluções por meio de uma população de cromossomos que evolui ao longo de várias gerações.

O simulador implementa as seguintes etapas:

1. **Inicialização da população:** criação aleatória dos cromossomos iniciais, com genes iguais a `0` ou `1`.
2. **Avaliação:** cálculo do custo e do benefício de cada cromossomo após o reparo das soluções inviáveis.
3. **Seleção por torneio:** escolha dos indivíduos que atuarão como pais, comparando candidatos sorteados sem repetição dentro de cada torneio.
4. **Cruzamento de um ponto:** combinação de dois pais a partir de um ponto de corte para produzir novos cromossomos.
5. **Mutação por inversão de bit:** alteração de um gene de `0` para `1` ou de `1` para `0`, de acordo com a probabilidade configurada.
6. **Reparo:** correção dos descendentes que ultrapassarem o orçamento.
7. **Elitismo:** preservação dos melhores indivíduos da geração anterior, sem alterações.
8. **Formação da próxima geração:** composição da nova população com os descendentes e os indivíduos preservados.
9. **Repetição:** execução das etapas até atingir o número de gerações configurado.

### Parâmetros configuráveis

O simulador permite configurar:

- **Orçamento:** valor máximo disponível para os projetos.
- **Tamanho da população:** quantidade de cromossomos por geração.
- **Número de gerações:** quantidade de gerações que serão processadas.
- **Taxa de cruzamento:** probabilidade de realizar cruzamento entre os pais.
- **Taxa de mutação:** probabilidade de mutação de cada gene.
- **Tamanho do torneio:** quantidade de candidatos comparados em cada seleção.
- **Quantidade de indivíduos de elite:** número de melhores indivíduos preservados.
- **Semente aleatória:** valor inteiro utilizado para permitir a reprodução de uma execução com a mesma configuração.

Em caso de empate na seleção por torneio, é escolhido o candidato com o menor índice na população.

## Projetos padrão

O simulador inicia com os seguintes projetos:

| Gene | Projeto | Custo | Benefício |
|---|---|---:|---:|
| A | Iluminação do campus | 4000 | 7 |
| B | Bicicletários | 3000 | 5 |
| C | Bancos para áreas comuns | 2000 | 3 |
| D | Reforma da área de convivência | 5000 | 8 |

**Orçamento inicial:** 7000.

### Exemplo de solução

Uma solução possível é o cromossomo `1100`, que seleciona os projetos A e B.

Seu custo total é:

$$
C = 4000 + 3000 = 7000
$$

Seu benefício total é:

$$
B = 7 + 5 = 12
$$

Como o custo não ultrapassa o orçamento, a solução é viável.

Para os projetos padrão e o orçamento de 7000, o cromossomo `1100` representa uma solução ótima, com benefício total igual a 12.

## Funcionalidades do simulador

- Adicionar, editar e remover projetos.
- Validar os dados informados antes de iniciar a simulação.
- Configurar os parâmetros do algoritmo genético.
- Executar e pausar a simulação.
- Avançar entre as gerações.
- Reiniciar a simulação.
- Reproduzir uma execução utilizando a mesma semente e configuração.
- Visualizar os cromossomos da população.
- Acompanhar o melhor fitness da geração e o melhor fitness acumulado.
- Consultar o fitness médio da população.
- Visualizar o histórico das gerações em um gráfico.
- Consultar a melhor solução encontrada, incluindo cromossomo, projetos selecionados, custo, benefício e orçamento restante.
- Acompanhar os eventos do algoritmo por meio de registros e animações.

## Estrutura do projeto

```text
simulador-de-algoritmo-genetico/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── validation.js
│   ├── random.js
│   ├── evaluation.js
│   ├── repair.js
│   ├── geneticAlgorithm.js
│   └── simulation.js
└── README.md
```

### Responsabilidade dos arquivos

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Estrutura da página do simulador. |
| `css/style.css` | Estilização da interface, dos cromossomos, do gráfico e das animações. |
| `js/main.js` | Integração da interface com a simulação e atualização dos elementos visuais. |
| `js/validation.js` | Validação dos projetos e dos parâmetros informados. |
| `js/random.js` | Geração de números pseudoaleatórios a partir de uma semente. |
| `js/evaluation.js` | Cálculo do custo, do benefício e do fitness dos cromossomos. |
| `js/repair.js` | Reparo das soluções que ultrapassam o orçamento. |
| `js/geneticAlgorithm.js` | Implementação dos operadores e das etapas do algoritmo genético. |
| `js/simulation.js` | Controle das gerações, do histórico e do estado da simulação. |

## Como executar

O projeto utiliza HTML, CSS e JavaScript, sem necessidade de instalar bibliotecas para executar a versão estática.

1. Clone o repositório:

   ```bash
   git clone https://github.com/MonnikLuianne/simulador-de-algoritmo-genetico.git
   ```

2. Entre na pasta do projeto:

   ```bash
   cd simulador-de-algoritmo-genetico
   ```

3. Abra o arquivo `index.html` no navegador.

Também é possível utilizar a extensão **Live Server** do Visual Studio Code para executar o projeto em um servidor local.

## Testes e validação

Para avaliar o funcionamento do simulador, recomenda-se verificar:

- Se o custo de cada solução respeita o orçamento após o reparo.
- Se o fitness corresponde à soma dos benefícios dos projetos selecionados.
- Se o elitismo preserva os melhores indivíduos.
- Se o histórico possui um registro para a geração inicial e para cada geração executada.
- Se o melhor fitness acumulado nunca diminui.
- Se reiniciar a simulação com a mesma semente e os mesmos parâmetros reproduz os resultados.
- Se a população e os parâmetros inválidos são rejeitados.
- Se o simulador para ao atingir o número de gerações configurado.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Git e GitHub
- GitHub Pages

## Acesso ao projeto

**Repositório:**  
https://github.com/MonnikLuianne/simulador-de-algoritmo-genetico

**Simulador online:**  
https://monnikluianne.github.io/simulador-de-algoritmo-genetico/

## Considerações finais

O projeto permite explorar, de forma interativa, como um algoritmo genético pode ser aplicado a um problema de otimização com restrição de orçamento. A visualização dos cromossomos, das operações genéticas e da evolução do fitness facilita a compreensão do processo de busca por soluções de maior benefício.

A implementação também evidencia a importância da seleção, do cruzamento, da mutação, do elitismo e do reparo na construção de soluções viáveis ao longo das gerações.

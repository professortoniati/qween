# 🏷️ PromoBusca

Interface web (HTML + CSS + JavaScript puro) para pesquisar produtos com promoção e
comparar preços, organizando a lista **do menor para o maior valor** (máximo de **20 resultados**).

## ✨ Funcionalidades

- 🔍 **Caixa de busca estilo Google**: digite o nome do produto e pressione **Enter** para iniciar a pesquisa.
- 📊 **Lista ordenada** do menor → maior preço, com ranking numerado e destaque 🏆 para o melhor preço.
- 🏪 Cada resultado mostra: **nome do produto, preço atual, preço antigo riscado, % de desconto, nome da loja e link "Acessar loja"**.
- ⏳ Estado de carregamento (spinner), estado vazio inicial e limite de 20 resultados (`MAX_RESULTS`).
- 🏷️ Tags de exemplos com um clique e suporte a deep-link: `index.html?q=iphone`.
- 📱 Layout responsivo.

## 🚀 Como executar

Basta abrir o `index.html` no navegador, ou servir a pasta:

```bash
python3 -m http.server 8099
# acesse http://localhost:8099
```

## 🗂️ Arquivos

| Arquivo      | Descrição                                  |
|--------------|--------------------------------------------|
| `index.html` | Estrutura da página (busca, status, lista) |
| `style.css`  | Visual inspirado na busca do Google        |
| `app.js`     | Lógica de pesquisa, ordenação e renderização |

## 🔌 Usando dados reais (importante)

Navegadores não conseguem raspar sites de lojas diretamente (bloqueio de CORS).
Por isso, a função `searchOffers()` em `app.js` **simula** ofertas realistas e
determinísticas a partir do termo buscado. Para usar dados reais, substitua o
corpo dessa função por uma chamada a:

- Uma API de comparação de preços (Buscapé, Zoom, Google Shopping…), ou
- Um backend próprio que faça a busca nas lojas e retorne JSON no formato:

```js
[{ title, store, price, oldPrice, discount, url }, ...]
```

O restante da interface (ordenação, limite de 20, renderização) continua igual.

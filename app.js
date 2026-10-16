/* =========================================================
 * PromoBusca — app.js
 * Interface de pesquisa de produtos com promoção.
 * Ao digitar o produto e pressionar Enter, monta uma lista
 * (máx. 20 resultados) ordenada do menor para o maior preço,
 * mostrando preço, nome da loja e link para acessar.
 *
 * Como navegadores não podem raspar sites diretamente (CORS),
 * os resultados aqui são GERADOS de forma realista a partir do
 * termo buscado. Basta trocar a função `searchOffers` por uma
 * chamada a uma API real (Buscapé, Zoom, Google Shopping…) ou a
 * um backend próprio — o restante do código continua igual.
 * ========================================================= */

"use strict";

const MAX_RESULTS = 20;

/* ---------- "Banco" simulado de lojas confiáveis ---------- */
const STORES = [
  { name: "Amazon Brasil",      domain: "amazon.com.br" },
  { name: "Mercado Livre",      domain: "mercadolivre.com.br" },
  { name: "Magalu",             domain: "magazineluiza.com.br" },
  { name: "Casas Bahia",        domain: "casasbahia.com.br" },
  { name: "Ponto",              domain: "pontofrio.com.br" },
  { name: "Shopee",             domain: "shopee.com.br" },
  { name: "Americanas",         domain: "americanas.com.br" },
  { name: "Kabum",              domain: "kabum.com.br" },
  { name: "Pichau",             domain: "pichau.com.br" },
  { name: "TerabyteShop",       domain: "terabyteshop.com.br" },
  { name: "Fast Shop",          domain: "fastshop.com.br" },
  { name: "Extra",              domain: "extra.com.br" },
  { name: "Walmart",            domain: "walmart.com.br" },
  { name: "Mobly",              domain: "mobly.com.br" },
  { name: "Madeira Madeira",    domain: "madeiramadeira.com.br" },
];

/* Categorias para variar nomes/preços de forma plausível */
const VARIANTS = ["Padrão", "Edição Promocional", "Oferta Relâmpago", "Leve 3 Pague 2", "Black Friday Antecipada", "Refurbished", "Kit Combo", "Versão 2026"];

/* ---------- Referências do DOM ---------- */
const form        = document.getElementById("search-form");
const input       = document.getElementById("search-input");
const btnClear    = document.getElementById("btn-clear");
const btnSearch   = form.querySelector(".btn-search");
const statusArea  = document.getElementById("status-area");
const statusText  = document.getElementById("status-text");
const resultsArea = document.getElementById("results-area");
const resultsList = document.getElementById("results-list");
const resultsTitle= document.getElementById("results-title");
const emptyState  = document.getElementById("empty-state");
const quickTags   = document.getElementById("quick-tags");

/* ---------- Utilidades ---------- */

/** PRNG determinístico (seed a partir do texto) → mesma busca, mesmos preços. */
function seededRandom(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Estima uma faixa de preço base plausível pelo tipo de produto. */
function estimateBasePrice(query, rand) {
  const q = query.toLowerCase();
  const rules = [
    { re: /(iphone|samsung galaxy|celular|smartphone|motorola|xiaomi)/, min: 900,  max: 7000 },
    { re: /(notebook|laptop|macbook|ultrafino)/,                        min: 2200, max: 9500 },
    { re: /(tv|televis[ãao]|smart tv)/,                                  min: 1200, max: 6000 },
    { re: /(air fryer|panela|cozinha|cafeteira|liquidificador)/,         min: 150,  max: 900 },
    { re: /(t[êe]nis|nike|adidas|sap[tc]enho|corrida)/,                  min: 180,  max: 950 },
    { re: /(fone|headphone|earbuds|caixinha|speaker|jbl)/,               min: 80,   max: 1800 },
    { re: /(playstation|ps5|xbox|nintendo|console|video game|games)/,    min: 1500, max: 5500 },
    { re: /(monitor|gpu|placa de v[íi]deo|rtx|gamer)/,                   min: 700,  max: 6500 },
    { re: /(rel[óo]gio|watch|garmin|smartwatch)/,                        min: 250,  max: 4500 },
    { re: /(cadeira|sof[áa]|\babmesa|m[óo]vel|arm[áa]rio|estante)/,      min: 300,  max: 3500 },
  ];
  for (const r of rules) {
    if (r.re.test(q)) return r.min + rand() * (r.max - r.min);
  }
  return 60 + rand() * 900; // item genérico
}

/* ---------- Motor de "pesquisa" (simulado) ----------
 * Para usar dados reais, substitua o corpo desta função por um fetch(), ex.:
 *   const resp = await fetch(`/api/offers?q=${encodeURIComponent(query)}`);
 *   return (await resp.json()).slice(0, MAX_RESULTS);
 */
async function searchOffers(query) {
  const rand = seededRandom(query.trim().toLowerCase());
  const base = estimateBasePrice(query, rand);

  // embaralha as lojas deterministicamente
  const shuffled = [...STORES].sort(() => rand() - 0.5);
  const count = Math.min(MAX_RESULTS, 8 + Math.floor(rand() * 13)); // 8..20 ofertas

  const offers = [];
  for (let i = 0; i < count; i++) {
    const store = shuffled[i % shuffled.length];
    const spread = 0.72 + rand() * 0.66;           // variação ±33% em torno da base
    const promoPct = Math.floor(5 + rand() * 40);  // 5% a 45% de desconto
    const current = base * spread;
    const original = current / (1 - promoPct / 100);

    const variant = VARIANTS[Math.floor(rand() * VARIANTS.length)];
    const title = `${query.trim()} — ${variant}${i % 3 === 0 ? ` (${store.name})` : ""}`;

    offers.push({
      title,
      store: store.name,
      price: Math.round(current * 100) / 100,
      oldPrice: Math.round(original * 100) / 100,
      discount: promoPct,
      url: `https://www.${store.domain}/s?q=${encodeURIComponent(query.trim())}`,
    });
  }

  // Ordena do MENOR para o MAIOR valor
  offers.sort((a, b) => a.price - b.price);

  // simula latência de rede
  await new Promise((res) => setTimeout(res, 600 + rand() * 700));
  return offers;
}

/* ---------- Renderização ---------- */
function renderResults(query, offers) {
  resultsList.innerHTML = "";

  if (!offers.length) {
    resultsList.innerHTML = `<li class="empty"><p>Nenhum resultado encontrado para “${escapeHtml(query)}”.</p></li>`;
    resultsTitle.textContent = `Resultados para "${query}"`;
    return;
  }

  offers.forEach((offer, idx) => {
    const li = document.createElement("li");
    li.className = "result-item" + (idx === 0 ? " best" : "");
    li.style.animationDelay = `${Math.min(idx * 40, 400)}ms`;
    li.innerHTML = `
      <div class="rank">${idx + 1}${idx === 0 ? "🏆" : ""}</div>
      <div class="info">
        <div class="product-name" title="${escapeHtml(offer.title)}">${escapeHtml(offer.title)}</div>
        <div class="store-row">
          <span class="store-badge">🏪 ${escapeHtml(offer.store)}</span>
          <span class="promo-tag">-${offer.discount}%</span>
          <span>${idx === 0 ? "Melhor preço da lista" : "Em promoção"}</span>
        </div>
      </div>
      <div class="price-col">
        <div class="old-price">${fmtBRL.format(offer.oldPrice)}</div>
        <div class="price">${fmtBRL.format(offer.price)}</div>
        <a class="visit-link" href="${escapeHtml(offer.url)}" target="_blank" rel="noopener noreferrer">Acessar loja ↗</a>
      </div>
    `;
    resultsList.appendChild(li);
  });

  resultsTitle.textContent = `Resultados para "${query}" (${offers.length})`;
}

/* ---------- Fluxo da busca ---------- */
let searching = false;

async function runSearch(query) {
  const q = query.trim();
  if (!q || searching) return;

  searching = true;
  btnSearch.disabled = true;
  emptyState.classList.add("hidden");
  resultsArea.classList.add("hidden");
  statusArea.classList.remove("hidden");
  statusText.textContent = `Pesquisando "${q}" em ${STORES.length} lojas…`;

  try {
    const offers = await searchOffers(q);
    renderResults(q, offers.slice(0, MAX_RESULTS));
    statusArea.classList.add("hidden");
    resultsArea.classList.remove("hidden");
    resultsArea.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    console.error(err);
    statusText.textContent = "Ops! Algo deu errado na pesquisa. Tente novamente.";
  } finally {
    searching = false;
    btnSearch.disabled = false;
    input.focus();
  }
}

/* ---------- Eventos ---------- */

// Enter (ou submit do formulário) inicia a pesquisa
form.addEventListener("submit", (e) => {
  e.preventDefault();
  runSearch(input.value);
});

// Botão limpar
btnClear.addEventListener("click", () => {
  input.value = "";
  input.focus();
});

// Tags de exemplo
quickTags.addEventListener("click", (e) => {
  const tag = e.target.closest(".tag");
  if (!tag) return;
  input.value = tag.dataset.q;
  runSearch(tag.dataset.q);
});

// Suporte a deep-link: index.html?q=iphone
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const q = params.get("q");
  if (q) {
    input.value = q;
    runSearch(q);
  } else {
    input.focus();
  }
});

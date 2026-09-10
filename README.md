# LP Curitiba Folia 2026 — Ingresso Formô

Landing page de vendas construída a partir do PSD `ED HERO LP CURITIBA FOLIA.psd`
e do briefing `briefing curitiba folia lp.docx`.

## Rodar localmente

```bash
node server.js
```
Abre em http://localhost:5173

## Onde mexer

| O quê | Arquivo |
|---|---|
| Copy, seções, FAQ | `site/index.html` |
| Identidade visual, cores, glass button | `site/assets/css/style.css` |
| Link do checkout, data do countdown, nome do lote | `site/assets/js/main.js` (bloco `CONFIG` no topo) |

```js
const CONFIG = {
  CHECKOUT_URL: '',                       // cole a URL da plataforma de venda
  EVENT_DATE: new Date(2026, 11, 12, 14, 0, 0),
  LOTE_LABEL: 'Lote promocional'
};
```
Enquanto `CHECKOUT_URL` estiver vazio, todos os botões rolam até a seção de oferta.
Assim que preencher, todos os CTAs passam a apontar para o checkout em nova aba.

Já existe um gancho de tracking pronto: cada clique em CTA dispara
`dataLayer.push({event:'cta_click', cta:'hero|turma|oferta|final|sticky|topbar'})`.
Basta colar o GTM/Pixel no `<head>`.

## Logo do hero

O smart object do PSD trazia a marca em duas camadas (`SOL` e `LOGO CURITIBA`), então
exportei separado:

- `logo-sol.webp` — só a estrela laranja, gira em loop (`sol-spin`, 26s, linear)
- `logo-letras.webp` — a marca em si, parada por cima

As duas têm a mesma moldura de 492×464, então basta empilhar no `.lockup` que o
alinhamento fica idêntico ao do PSD. A rotação para sozinha quando o visitante usa
"reduzir movimento". `logo-folia.webp` (marca fechada) continua no topbar e no rodapé.

## Barra de patrocinadores

Fica no rodapé, abaixo da assinatura. O PNG `BARRA PATROCINIOS.png` foi fatiado em quatro
logos (`spon-coca`, `spon-schweppes`, `spon-atm`, `spon-all`). Todos os recortes têm a mesma
altura de origem (145px), então basta uma altura igual no CSS (`--sb-h`) para manter a
proporção exata do material original. As tarjas "Patrocínio" e "Realização" viraram texto
em Codec Cold — no PNG elas estavam cortadas na borda.

Beats e Therezópolis continuam na linha de cima do rodapé, sem categoria, como estavam no KV.
Se eles pertencerem a "Patrocínio" ou "Realização", é só mover para dentro do grupo certo
em `index.html`.

## Marca Formô

`site/assets/img/formo.png` é a marca recortada do PNG original e guardada como **máscara**
(só o canal alpha). No CSS ela é pintada com `currentColor`:

```css
.formo{ -webkit-mask:url('../img/formo.png') no-repeat center/contain; background:currentColor }
```

Ou seja: a mesma imagem vira branca no hero, laranja na Área Formô, amarela no card de
oferta, azul onde precisar — sem gerar um arquivo por cor. Para mudar o tamanho use as
classes (`--tiny --sm --md --lg --xl --inline --mq`) ou a variável `--fw`.

Onde ela aparece:

| Seção | Uso |
|---|---|
| Topbar | lockup `Folia × formô` |
| Hero | assinatura "Experiência oficial + marca" sob a logo |
| Marquee | a marca entra no lugar das estrelas, em laranja |
| Você ainda não viveu | selo no canto do card laranja |
| Área Formô | marca d'água gigante ao fundo + título "Conheça a Área ⟨marca⟩" |
| Área Formô / After | "After ⟨marca⟩" no card azul |
| Oferta | kicker "O ingresso ⟨marca⟩" e nome no card do ingresso |
| CTA final | assinatura `Curitiba Folia × formô` |
| Rodapé | mesma assinatura |
| Barra fixa | "Ingresso ⟨marca⟩" |

## Ingressos atravessando a tela

A cada 25s um par de ingressos cruza a tela da direita para a esquerda, rodopiando devagar
(menos de uma volta) enquanto passa rápido — 3s de travessia. Cada passagem sorteia altura,
tamanho, duração e sentido do giro, então nunca sai igual.

Ajuste em `CONFIG.TICKETS_FLY` no `main.js`:

```js
TICKETS_FLY: { firstDelay: 12000, interval: 25000 }
```

`firstDelay` é a primeira passagem (12s — cedo o bastante para o visitante ver);
`interval` é o intervalo entre as seguintes. Não roda com "reduzir movimento" ligado,
nem com a aba em segundo plano, nem no modo QA.

## Trio elétrico

Na seção "Você ainda não viveu essa festa?" o trio (`trio-caminhao.webp`, extraído do PSD)
atravessa a faixa de baixo da esquerda para a direita, em loop de 19s (13s no mobile).
A animação fica **pausada** até a seção entrar na tela, então quem chega rolando vê o trio
entrando na hora certa. A altura da faixa é calculada a partir da largura do caminhão
(`--trio-w`, proporção 1500×727), então ele nunca aparece cortado.

## Contagem regressiva

Aponta para **sábado, 12 de dezembro de 2026, às 14h** (`EVENT_DATE` no `main.js`).
O horário é um chute — assim que a organização divulgar a abertura dos portões, troque ali.
A data em si está conferida.

## Vídeo do hero

O fundo do hero é o aftermovie 2025, cortado em um trecho de 28s (62s–90s do original),
sem áudio, em loop:

- `site/assets/video/hero-loop.mp4` — 1280×720, ~5,3 MB (desktop)
- `site/assets/video/hero-loop-mobile.mp4` — 854×480, ~3 MB (até 768px)
- `site/assets/img/hero-poster.jpg` — primeiro quadro, aparece enquanto o vídeo carrega

O `main.js` escolhe a versão pelo tamanho da tela, mantém o vídeo mudo (exigência dos
navegadores para autoplay), pausa quando o hero sai da tela e cai para o poster quando o
visitante está com "economia de dados" ou "reduzir movimento" ligado.

Para trocar o trecho, regere os arquivos a partir do original em `VIDEOS/`.

## Publicar no GitHub

O `.gitignore` já exclui o que não pode subir: `PSD/` (168 MB — acima do limite de 100 MB
por arquivo do GitHub), `VIDEOS/` (76 MB do aftermovie original), o briefing e os PNGs
brutos. O que vai para o repositório são os ~10 MB de `site/` já processados.

> **Use repositório privado.** As fontes em `site/assets/fonts/` são licenciadas
> (Codec Cold e HWT Artz). Distribuí-las num repositório público é quebra de licença.
> Se precisar que o repositório seja público, tire a pasta `fonts/` do commit e sirva as
> fontes por um projeto web do Adobe Fonts / Colophon.

```bash
git init
git add .
git commit -m "LP Curitiba Folia 2026 — Ingresso Formô"
git branch -M main
git remote add origin git@github.com:SEU-USUARIO/lp-curitiba-folia.git
git push -u origin main
```

## Modo QA

`http://localhost:5173/?qa=1` desliga as animações de entrada e a altura de tela do hero,
e congela o trio no meio da faixa — serve para capturar ou imprimir a página inteira de uma vez.

## Paleta (extraída do PSD)

`#FBE9D9` creme · `#F46018` laranja · `#2B4CBC` azul · `#3EA4E7` azul claro ·
`#FFCE4C` amarelo · `#F4A311` dourado · `#DB0000` vermelho

## Tipografia

- **Codec Cold** (Light/Regular/Bold/Heavy/UltraBlack) — textos, botões, títulos de seção
- **HWT Artz** — headlines de impacto (mesmo uso do PSD)

Os `.woff2` em `site/assets/fonts/` foram convertidos das fontes instaladas nesta máquina
(HWT Artz vem do Adobe Fonts). Para publicar em produção é preciso a licença de webfont:
Codec Cold via Colophon/Monotype e HWT Artz via projeto web do Adobe Fonts (código de embed).

## Assets não usados

As molduras em pincel foram removidas do site (pedido do cliente). Os arquivos ficaram
guardados em `site/assets/_nao-usados/` junto com outras peças do PSD que não entraram
(foto do hero, trio elétrico, desenho da pedreira). Nada aí é carregado pela página.

## Assets

Todas as imagens em `site/assets/img/` foram extraídas camada a camada do PSD
(logo, artistas, ingressos, trio elétrico, foto do hero, moldura em pincel, formas orgânicas,
texturas de grain) e convertidas para `.webp`.

## Gatilhos de venda aplicados

1. CTA fixo no topo (aparece na rolagem) + barra fixa no rodapé no mobile
2. Contagem regressiva para 12/12
3. Preço com âncora ("tudo isso por R$80") + lista de tudo que está incluso
4. Escassez de lote ("o valor sobe a cada lote esgotado") — ajuste o texto conforme a política real
5. Selos de confiança (ingresso digital, compra segura, abadá incluso)
6. Prova social/pertencimento (turma, multidão, área exclusiva)
7. Repetição de CTA a cada bloco de argumentação (hero → turma → oferta → final)
8. FAQ quebrando objeções antes do checkout

> Revise os textos de escassez e o selo "Compra 100% segura" conforme a plataforma
> de checkout que vocês usarem.

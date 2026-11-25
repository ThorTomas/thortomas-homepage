# thortomas.cz – osobní web

Osobní stránka Tomáše Thoře. Next.js (React) + Chakra UI + framer-motion + three.js.
Vychází z webu [Takuyi Matsuyamy](https://www.craftz.dog/) (fork [craftzdog-homepage](https://github.com/craftzdog/craftzdog-homepage)); uznání autora je v patičce a musí tam zůstat (podmínka licence, viz `LICENSE`).

## Spuštění na počítači

Potřebuješ [Node.js](https://nodejs.org/) 20 nebo novější. V PowerShellu v této složce:

```
npm install
npm run dev
```

Web pak běží na http://localhost:3000 a po uložení souboru se sám obnoví.

## Sestavení pro server

```
npm run build
```

Vytvoří složku `out/` s obyčejnými statickými soubory (HTML, JS, obrázky). Tu stačí nahrát na server a servírovat jakýmkoli webserverem (Caddy, nginx), není potřeba Node. Náhled sestavené verze: `npm run preview`.

## Kde co je

| Co chci změnit | Soubor |
| --- | --- |
| Texty (česky i anglicky) | `lib/i18n.js` |
| Pořadí a skladba sekcí na úvodní stránce, odkazy na sítě | `pages/index.js` |
| Projekty v portfoliu (pole `works`, zatím prázdné) | `pages/works.js` |
| Menu, odkaz Zdroj (`SOURCE_URL`) | `components/navbar.js` |
| Barvy a písmo | `lib/theme.js` |
| 3D scéna: optická sestava s malým Mjölnirem | `components/scenes/optical-bench.js` |
| Model kladiva | `components/scenes/hammer.js` |
| Plátno a kamera | `components/hero-scene.js` |
| Profilová fotka | `public/images/tomas.jpg` (originál: `profile_img.jpeg`) |

Adresa s `?lang=cs` nebo `?lang=en` otevře web v konkrétním jazyce.

## Co zbývá

- Zdrojový kód: https://github.com/ThorTomas/thortomas_web
- Zkontrolovat texty v `lib/i18n.js`, hlavně české názvy studijních programů a předmětu.
- Nasazení na server `farm` přes Cloudflare Tunnel.

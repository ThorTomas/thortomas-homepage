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
| 3D scéna optická sestava s malým Mjölnirem (výchozí) | `components/scenes/optical-bench.js` |
| Model kladiva (sdílený oběma scénami) | `components/scenes/hammer.js` |
| 3D scéna laser a kámen | `components/scenes/laser-rock.js` |
| 3D scéna Mjölnir | `components/scenes/mjolnir.js` |
| Plátno, kamera, přepínač scén | `components/hero-scene.js` |
| Profilová fotka | `public/images/tomas.jpg` (originál: `profile_img.jpeg`) |

Adresa s `?scene=optics`, `?scene=laser` nebo `?scene=mjolnir` otevře konkrétní scénu, `?lang=cs` nebo `?lang=en` konkrétní jazyk.

## Co zbývá

- Vybrat jednu ze tří 3D scén (nebo nechat přepínač).
- Odkaz Zdroj zatím vede na profil github.com/ThorTomas; po založení repozitáře změnit `SOURCE_URL`.
- Zkontrolovat texty v `lib/i18n.js`, hlavně české názvy studijních programů a předmětu.
- Nasazení na server `farm` přes Cloudflare Tunnel.

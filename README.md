# Tomáš Thoř's Homepage

[https://thortomas.cz](https://thortomas.cz) (coming soon)

## Stack

- [Next.js](https://nextjs.org/) - React framework, exported as a static site
- [Chakra UI](https://chakra-ui.com/) - Component library for React
- [Three.js](https://threejs.org/) - 3D library for JavaScript
- [Framer Motion](https://www.framer.com/motion/) - Animation library for React

## Getting started

Requires Node.js 20 or newer.

```
npm install
npm run dev     # development server at http://localhost:3000
npm run build   # static export to ./out
```

## Project structure

```
$PROJECT_ROOT
│   # Page files
├── pages
│   # React components
├── components
│   │   # 3D scene (laser beam path charging a small hammer)
│   └── scenes
│   # Texts in English and Czech, theme
├── lib
│   # Static files (images, icons)
└── public
```

## License

MIT License.

Based on [Takuya Matsuyama's homepage](https://github.com/craftzdog/craftzdog-homepage), inspired also by [Martin Křivda's homepage](https://www.martinkrivda.cz/). The 3D scene is original.

If you fork this project, keep a link to [Takuya's homepage](https://www.craftz.dog/) as the original license requires. See [LICENSE](./LICENSE) for details.

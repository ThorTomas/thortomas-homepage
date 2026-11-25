import { createContext, useContext, useEffect, useState, useCallback } from 'react'

// All texts of the site live here. Edit both languages together.
export const dict = {
  en: {
    meta: {
      description:
        'Tomáš Thoř – computer vision and machine learning for space laser applications.'
    },
    nav: {
      about: 'About',
      portfolio: 'Portfolio',
      source: 'Source',
      viewSource: 'View source',
      switchLang: 'Přepnout do češtiny'
    },
    hero: {
      greeting:
        "Hello, I work on computer vision and machine learning for space lasers!",
      tagline:
        'Computer Vision & Machine Learning ( Researcher / PhD student / Trail runner )'
    },
    work: {
      title: 'Work',
      items: [
        {
          period: '2025 - present',
          org: 'HiLASE Centre',
          text: 'I work on machine learning and computer vision for space laser applications and on the diagnostics of optical systems.',
          linkLabel: 'Company website',
          href: 'https://www.hilase.cz/'
        },
        {
          period: '2026 - present',
          org: 'Machine Vision Lab, Faculty of Mechanical Engineering, CTU in Prague',
          text: 'Alongside my PhD studies, I take part in teaching.',
          linkLabel: 'Group website',
          href: 'https://cvut-fs-12110.github.io/machine-vision-lab/'
        }
      ]
    },
    projects: {
      title: 'Personal projects',
      button: 'My portfolio',
      items: [
        {
          period: 'In development',
          name: 'OPrep',
          badge: 'soon',
          text: 'OPrep is in development and will be deployed soon.'
        }
      ]
    },
    bio: {
      title: 'Education',
      items: [
        {
          year: '2026 - present',
          title: 'Machine and Process Control (Ph.D.)',
          school: 'Machine Vision Lab, Faculty of Mechanical Engineering, CTU in Prague'
        },
        {
          year: '2023 - 2025',
          title: 'Signal Processing (Ing.)',
          school: 'Faculty of Electrical Engineering, CTU in Prague',
          thesisLabel: "Master's thesis",
          thesisHref:
            'https://dspace.cvut.cz/bitstream/handle/10467/123164/F3-DP-2025-Thor-Tomas-DP_Thor-Tomas_final.pdf?sequence=-1&isAllowed=y'
        },
        {
          year: '2019 - 2023',
          title: 'Medical Electronics and Bioinformatics (Bc.)',
          school: 'Faculty of Electrical Engineering, CTU in Prague',
          thesisLabel: "Bachelor's thesis",
          thesisHref: 'https://dspace.cvut.cz/handle/10467/108568'
        }
      ]
    },
    interests: {
      title: 'I ♥',
      lines: [
        'Trail running 🏃 / orienteering 🧭',
        'Organising sports events 🏁',
        'Leading summer camps ⛺'
      ]
    },
    web: { title: 'On the web' },
    works: {
      title: 'Portfolio',
      emptyTitle: 'Nothing has launched yet.',
      emptyText: 'Projects will appear here as soon as they are ready.'
    },
    notFound: {
      title: 'Not found',
      text: "The page you're looking for was not found.",
      back: 'Return to home'
    },
    footer: {
      inspired: 'Inspired by',
      and: '&'
    }
  },
  cs: {
    meta: {
      description:
        'Tomáš Thoř – počítačové vidění a strojové učení pro vesmírné laserové aplikace.'
    },
    nav: {
      about: 'O mně',
      portfolio: 'Portfolio',
      source: 'Zdroj',
      viewSource: 'Zdrojový kód',
      switchLang: 'Switch to English'
    },
    hero: {
      greeting:
        'Ahoj, věnuji se počítačovému vidění a strojovému učení pro vesmírné lasery!',
      tagline:
        'Počítačové vidění a strojové učení ( výzkumník / doktorand / trailový běžec )'
    },
    work: {
      title: 'Práce',
      items: [
        {
          period: '2025 - dosud',
          org: 'HiLASE Centre',
          text: 'Věnuji se strojovému učení a počítačovému vidění pro vesmírné laserové aplikace a diagnostice optických systémů.',
          linkLabel: 'Web společnosti',
          href: 'https://www.hilase.cz/'
        },
        {
          period: '2026 - dosud',
          org: 'Machine Vision Lab, Fakulta strojní, ČVUT v Praze',
          text: 'Vedle doktorského studia se podílím na výuce.',
          linkLabel: 'Web skupiny',
          href: 'https://cvut-fs-12110.github.io/machine-vision-lab/'
        }
      ]
    },
    projects: {
      title: 'Osobní projekty',
      button: 'Moje portfolio',
      items: [
        {
          period: 'Ve vývoji',
          name: 'OPrep',
          badge: 'soon',
          text: 'OPrep je ve vývoji a brzy bude nasazen.'
        }
      ]
    },
    bio: {
      title: 'Vzdělání',
      items: [
        {
          year: '2026 - dosud',
          title: 'Řízení strojů a procesů (Ph.D.)',
          school: 'Machine Vision Lab, Fakulta strojní, ČVUT v Praze'
        },
        {
          year: '2023 - 2025',
          title: 'Zpracování signálů (Ing.)',
          school: 'Fakulta elektrotechnická, ČVUT v Praze',
          thesisLabel: 'Diplomová práce',
          thesisHref:
            'https://dspace.cvut.cz/bitstream/handle/10467/123164/F3-DP-2025-Thor-Tomas-DP_Thor-Tomas_final.pdf?sequence=-1&isAllowed=y'
        },
        {
          year: '2019 - 2023',
          title: 'Lékařská elektronika a bioinformatika (Bc.)',
          school: 'Fakulta elektrotechnická, ČVUT v Praze',
          thesisLabel: 'Bakalářská práce',
          thesisHref: 'https://dspace.cvut.cz/handle/10467/108568'
        }
      ]
    },
    interests: {
      title: 'Já ♥',
      lines: [
        'Trailový běh 🏃 / orientační běh 🧭',
        'Pořádání sportovních akcí 🏁',
        'Vedení letních táborů ⛺'
      ]
    },
    web: { title: 'Na webu' },
    works: {
      title: 'Portfolio',
      emptyTitle: 'Zatím tu nic není.',
      emptyText: 'Projekty se tu objeví, jakmile budou spuštěné.'
    },
    notFound: {
      title: 'Stránka nenalezena',
      text: 'Stránka, kterou hledáte, neexistuje.',
      back: 'Zpět na úvod'
    },
    footer: {
      inspired: 'Inspirováno',
      and: '&'
    }
  }
}

const STORAGE_KEY = 'lang'
const I18nContext = createContext({ lang: 'en', setLang: () => {}, t: dict.en })

function detectLang() {
  try {
    const q = new URLSearchParams(window.location.search).get('lang')
    if (q && dict[q]) return q
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved && dict[saved]) return saved
  } catch (e) {
    /* storage unavailable */
  }
  const nav = (navigator.language || 'en').toLowerCase()
  return nav.startsWith('cs') || nav.startsWith('sk') ? 'cs' : 'en'
}

export function I18nProvider({ children }) {
  // The static HTML is English; the visitor's language is applied after load.
  const [lang, setLangState] = useState('en')

  useEffect(() => {
    setLangState(detectLang())
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback(next => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch (e) {
      /* storage unavailable */
    }
  }, [])

  return (
    <I18nContext.Provider value={{ lang, setLang, t: dict[lang] }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => useContext(I18nContext)

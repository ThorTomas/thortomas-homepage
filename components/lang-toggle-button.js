import { Button } from '@chakra-ui/react'
import { useI18n } from '../lib/i18n'

const LangToggleButton = () => {
  const { lang, setLang, t } = useI18n()
  const next = lang === 'cs' ? 'en' : 'cs'

  return (
    <Button
      aria-label={t.nav.switchLang}
      title={t.nav.switchLang}
      variant="outline"
      fontSize="sm"
      px={3}
      mr={2}
      onClick={() => setLang(next)}
    >
      {next.toUpperCase()}
    </Button>
  )
}

export default LangToggleButton

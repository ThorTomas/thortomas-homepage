import { Box, Link } from '@chakra-ui/react'
import { useI18n } from '../lib/i18n'

// The link to craftz.dog is required by the licence of the original template.
const Footer = () => {
  const { t } = useI18n()
  return (
    <Box align="center" mt={10}>
      <Box opacity={0.7}>&copy; {new Date().getFullYear()} Tomáš Thoř</Box>
      <Box fontSize="sm" opacity={0.9}>
        {t.footer.inspired}{' '}
        <Link href="https://www.craftz.dog/" target="_blank" rel="noreferrer">
          TM
        </Link>{' '}
        {t.footer.and}{' '}
        <Link
          href="https://www.martinkrivda.cz/"
          target="_blank"
          rel="noreferrer"
        >
          MK
        </Link>
        .
      </Box>
    </Box>
  )
}

export default Footer

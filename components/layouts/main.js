import Head from 'next/head'
import dynamic from 'next/dynamic'
import NavBar from '../navbar'
import { Box, Container } from '@chakra-ui/react'
import Footer from '../footer'
import HeroSceneLoader from '../hero-scene-loader'
import { useI18n } from '../../lib/i18n'

const LazyHeroScene = dynamic(() => import('../hero-scene'), {
  ssr: false,
  loading: () => <HeroSceneLoader />
})

const Main = ({ children, router }) => {
  const { t } = useI18n()
  return (
    <Box as="main" pb={8}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={t.meta.description} />
        <meta name="author" content="Tomáš Thoř" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <meta property="og:site_name" content="Tomáš Thoř" />
        <meta property="og:title" content="Tomáš Thoř" />
        <meta property="og:type" content="website" />
        <title>Tomáš Thoř - Homepage</title>
      </Head>

      <NavBar path={router.asPath} />

      <Container maxW="container.md" pt={14}>
        <LazyHeroScene />

        {children}

        <Footer />
      </Container>
    </Box>
  )
}

export default Main

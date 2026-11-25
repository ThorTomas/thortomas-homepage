import { Container, Heading, Box, Text } from '@chakra-ui/react'
import Layout from '../components/layouts/article'
import Section from '../components/section'
import { useI18n } from '../lib/i18n'

// Projects go into this list once they are launched:
// { id, title, description: { en, cs }, href }
const works = []

const Works = () => {
  const { t, lang } = useI18n()
  return (
    <Layout title={t.works.title}>
      <Container>
        <Heading as="h3" fontSize={20} mb={4}>
          {t.works.title}
        </Heading>

        <Section>
          {works.length === 0 ? (
            <Box
              borderWidth={1}
              borderStyle="dashed"
              borderRadius="lg"
              p={8}
              textAlign="center"
            >
              <Text fontWeight="bold">{t.works.emptyTitle}</Text>
              <Text opacity={0.8}>{t.works.emptyText}</Text>
            </Box>
          ) : (
            works.map(w => (
              <Box key={w.id} mb={4}>
                <Text fontSize={20}>{w.title}</Text>
                <Text fontSize={14}>{w.description[lang]}</Text>
              </Box>
            ))
          )}
        </Section>
      </Container>
    </Layout>
  )
}

export default Works

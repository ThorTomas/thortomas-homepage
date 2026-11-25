import NextLink from 'next/link'
import {
  Link,
  Container,
  Heading,
  Box,
  Button,
  List,
  ListItem,
  Badge,
  Text,
  useColorModeValue
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import Paragraph from '../components/paragraph'
import { BioSection, BioYear, EntryTitle } from '../components/bio'
import Layout from '../components/layouts/article'
import Section from '../components/section'
import { IoLogoInstagram, IoLogoGithub, IoLogoLinkedin } from 'react-icons/io5'
import Image from 'next/image'
import { useI18n } from '../lib/i18n'

const socials = [
  {
    href: 'https://github.com/ThorTomas',
    label: '@ThorTomas',
    icon: <IoLogoGithub />
  },
  {
    href: 'https://www.linkedin.com/in/thortoma/',
    label: '@thortoma',
    icon: <IoLogoLinkedin />
  },
  {
    href: 'https://www.instagram.com/thor.the.stone.breaker/',
    label: '@thor.the.stone.breaker',
    icon: <IoLogoInstagram />
  }
]

const Education = ({ items }) =>
  items.map(item => (
    <BioSection key={item.year}>
      <BioYear>{item.year}</BioYear>
      <Box>
        <Text fontWeight="bold">{item.title}</Text>
        <Text fontSize="sm">{item.school}</Text>
        {item.thesisHref && (
          <Button
            as="a"
            href={item.thesisHref}
            target="_blank"
            rel="noreferrer"
            size="xs"
            variant="outline"
            colorScheme="teal"
            mt={1}
          >
            {item.thesisLabel}
          </Button>
        )}
      </Box>
    </BioSection>
  ))

const Home = () => {
  const { t } = useI18n()
  return (
    <Layout>
      <Container>
        <Box
          borderRadius="lg"
          mb={6}
          p={3}
          textAlign="center"
          bg={useColorModeValue('whiteAlpha.500', 'whiteAlpha.200')}
          css={{ backdropFilter: 'blur(10px)' }}
        >
          {t.hero.greeting}
        </Box>

        <Box display={{ md: 'flex' }}>
          <Box flexGrow={1}>
            <Heading as="h2" variant="page-title">
              Tomáš Thoř
            </Heading>
            <p>{t.hero.tagline}</p>
          </Box>
          <Box
            flexShrink={0}
            mt={{ base: 4, md: 0 }}
            ml={{ md: 6 }}
            textAlign="center"
          >
            <Box
              borderColor="whiteAlpha.800"
              borderWidth={2}
              borderStyle="solid"
              w="100px"
              h="100px"
              display="inline-block"
              borderRadius="full"
              overflow="hidden"
            >
              <Image
                src="/images/tomas.jpg"
                alt="Tomáš Thoř"
                width="100"
                height="100"
              />
            </Box>
          </Box>
        </Box>

        <Section delay={0.1}>
          <Heading as="h3" variant="section-title">
            {t.work.title}
          </Heading>
          {t.work.items.map(item => (
            <Box key={item.org} mb={3}>
              <EntryTitle>
                {item.period} | {item.org}
              </EntryTitle>
              <Paragraph>{item.text}</Paragraph>
              <Link href={item.href} target="_blank" rel="noreferrer">
                {item.linkLabel}
              </Link>
            </Box>
          ))}
        </Section>

        <Section delay={0.2}>
          <Heading as="h3" variant="section-title">
            {t.projects.title}
          </Heading>
          {t.projects.items.map(item => (
            <Box key={item.name} mb={3}>
              <EntryTitle>
                {item.period} | {item.name}
                {item.badge && (
                  <Badge ml={2} colorScheme="teal" verticalAlign="middle">
                    {item.badge}
                  </Badge>
                )}
              </EntryTitle>
              <Paragraph>{item.text}</Paragraph>
            </Box>
          ))}
          <Box align="center" my={4}>
            <Button
              as={NextLink}
              href="/works"
              scroll={false}
              rightIcon={<ChevronRightIcon />}
              colorScheme="teal"
            >
              {t.projects.button}
            </Button>
          </Box>
        </Section>

        <Section delay={0.2}>
          <Heading as="h3" variant="section-title">
            {t.bio.title}
          </Heading>
          <Education items={t.bio.items} />
        </Section>

        <Section delay={0.3}>
          <Heading as="h3" variant="section-title">
            {t.interests.title}
          </Heading>
          <Box pl={4}>
            {t.interests.lines.map(line => (
              <Text key={line}>{line}</Text>
            ))}
          </Box>
        </Section>

        <Section delay={0.3}>
          <Heading as="h3" variant="section-title">
            {t.web.title}
          </Heading>
          <List>
            {socials.map(s => (
              <ListItem key={s.href}>
                <Link href={s.href} target="_blank" rel="noreferrer">
                  <Button variant="ghost" colorScheme="teal" leftIcon={s.icon}>
                    {s.label}
                  </Button>
                </Link>
              </ListItem>
            ))}
          </List>
        </Section>
      </Container>
    </Layout>
  )
}

export default Home

import { Box } from '@chakra-ui/react'
import styled from '@emotion/styled'

// One row of the education timeline: years on the left, details on the right.
export const BioSection = styled(Box)`
  display: flex;
  gap: 1em;
  margin-bottom: 0.9em;
`

export const BioYear = styled.span`
  font-weight: bold;
  flex: 0 0 7.2em;
`

// Bold "period | name" line above a work or project entry.
export const EntryTitle = styled.p`
  font-weight: bold;
  margin-top: 0.6em;
`

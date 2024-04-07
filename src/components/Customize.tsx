import useSWR from 'swr'
import { useAtom } from 'jotai'
import { Badge, Box, CircularProgress, Flex, Heading, Select, Text } from '@chakra-ui/react'

import { mswVersionAtom, tanstackVersionAtom } from '../kubb'
import { useBgColor, useBorderColor } from '../utils'

import type { ChangeEvent } from 'react'

type PackageInfo = {
  tags: {
    alpha: string
    beta: string
    latest: string
  }
  versions: string[]
}

const fetchPackageInfo = async (packageName: string): Promise<PackageInfo> => {
  const api = await fetch(`https://data.jsdelivr.com/v1/package/npm/${packageName}`)

  return api.json()
}

interface Props {
  isLoading: boolean
}

export default function Customize({ isLoading }: Props) {
  const [versionMsw, setVersionMsw] = useAtom(mswVersionAtom)
  const [versionTanstackQuery, setVersionTanstackQuery] = useAtom(tanstackVersionAtom)
  const { data: packageInfoMSW } = useSWR('msw', fetchPackageInfo)
  const { data: packageInfoTanstackQuery } = useSWR('@tanstack/query-core', fetchPackageInfo)
  const bg = useBgColor()
  const borderColor = useBorderColor()

  const onMswVersionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setVersionMsw(event.target.value)
  }

  const onTanstackQueryVersionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setVersionTanstackQuery(event.target.value)
  }

  return (
    <Flex direction="column">
      <Heading size="md" mb="8px">
        Customize
      </Heading>
      <Flex direction="column" p="2" bg={bg} borderColor={borderColor} borderWidth="1px">
        <Box flex="1" paddingBottom={4}>
          <Badge marginBottom={2}>MSW</Badge>
          {packageInfoMSW && (
            <Select variant="filled" value={versionMsw} onChange={onMswVersionChange}>
              {['1', '2'].map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </Select>
          )}
        </Box>
        <Box flex="1" paddingBottom={4}>
          <Badge marginBottom={2}>@tanstack/query</Badge>
          {packageInfoTanstackQuery && (
            <Select variant="filled" value={versionTanstackQuery} onChange={onTanstackQueryVersionChange}>
              {['4', '5'].map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </Select>
          )}
        </Box>
        <Flex alignItems="center" my="2" height="8">
          {isLoading ||
            !packageInfoMSW ||
            (!packageInfoTanstackQuery && (
              <>
                <CircularProgress size="7" isIndeterminate />
                <Text ml="2">Please wait...</Text>
              </>
            ))}
        </Flex>
      </Flex>
    </Flex>
  )
}

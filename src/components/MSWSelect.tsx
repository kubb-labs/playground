import useSWR from 'swr'
import { useAtom } from 'jotai'
import { CircularProgress, Flex, Heading, Select, Text } from '@chakra-ui/react'

import { mswVersionAtom } from '../kubb'
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

  return await api.json()
}

interface Props {
  isLoading: boolean
}

export default function MSWSelect({ isLoading }: Props) {
  const [version, setVersion] = useAtom(mswVersionAtom)
  const { data: packageInfo, error } = useSWR('msw', fetchPackageInfo)
  const bg = useBgColor()
  const borderColor = useBorderColor()

  const handleCurrentVersionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setVersion(event.target.value)
  }

  const tags = ['1', '2']

  return (
    <Flex direction="column">
      <Heading size="md" mb="8px">
        MSW version
      </Heading>
      <Flex direction="column" p="2" bg={bg} borderColor={borderColor} borderWidth="1px">
        {packageInfo && (
          <Select value={version} onChange={handleCurrentVersionChange}>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </Select>
        )}
        <Flex alignItems="center" my="2" height="8">
          {isLoading ||
            (!packageInfo && !error && (
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

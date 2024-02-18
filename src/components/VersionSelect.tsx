import useSWR from 'swr'
import { useAtom } from 'jotai'
import { CircularProgress, Flex, Heading, Select, Text } from '@chakra-ui/react'

import { defaultVersion, versionAtom } from '../kubb'
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

export default function VersionSelect({ isLoading }: Props) {
  const [version, setVersion] = useAtom(versionAtom)
  const { data: packageInfo, error } = useSWR('@kubb/core', fetchPackageInfo)
  const bg = useBgColor()
  const borderColor = useBorderColor()

  const handleCurrentVersionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setVersion(event.target.value)
  }

  // const tags = packageInfo?.tags['alpha'] ? ['canary', 'alpha', 'beta'] : []

  const tags = ['canary', 'beta']

  return (
    <Flex direction="column">
      <Heading size="md" mb="8px">
        Version
      </Heading>
      <Flex direction="column" p="2" bg={bg} borderColor={borderColor} borderWidth="1px">
        {packageInfo ? (
          <Select variant="filled" value={version} onChange={handleCurrentVersionChange}>
            <option>{defaultVersion} (latest)</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </Select>
        ) : (
          <Select variant="filled">
            <option>{defaultVersion} (latest)</option>
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

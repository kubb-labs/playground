/* eslint-disable no-restricted-globals */
import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { Flex, Heading } from '@chakra-ui/react'
import * as React from 'react'

import ConfigEditorModal from './ConfigEditorModal'

import { STORAGE_KEY, configAtom } from '../state'
import { useBgColor, useBorderColor } from '../utils'

export default function Configuration() {
  const [config, setConfig] = useAtom(configAtom)
  const bg = useBgColor()
  const borderColor = useBorderColor()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }, [config])

  const handleLogLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setConfig((config) => {
      return {
        ...config,
        logLevel: event.target.value as any,
      }
    })
  }

  return (
    <Flex direction="column">
      <Heading size="md" mb="8px">
        Configuration
      </Heading>
      <Flex direction="column" p="2" paddingTop={0} bg={bg} borderColor={borderColor} borderWidth="1px">
        <ConfigEditorModal />
      </Flex>
    </Flex>
  )
}

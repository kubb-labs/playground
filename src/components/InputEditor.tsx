/* eslint-disable no-restricted-globals */
/* eslint-disable consistent-return */
import { useEffect, useRef } from 'react'
import Editor, { useMonaco } from '@monaco-editor/react'
import { useAtom } from 'jotai'
import { Box, Flex, Heading, useToast, HStack } from '@chakra-ui/react'

import { Base64 } from 'js-base64'
import { ungzip } from 'pako'

import { codeAtom, configAtom } from '../state'
import { editorOptions, useBorderColor, useMonacoThemeValue } from '../utils'
import { mswVersionAtom, tanstackVersionAtom, versionAtom } from '../kubb'

import type { editor } from 'monaco-editor'
import type { TransformationResult } from '../kubb'

const STORAGE_KEY = 'v1.code'

interface Props {
  output: TransformationResult
}

export default function InputEditor(_props: Props) {
  const [code, setCode] = useAtom(codeAtom)
  const [config] = useAtom(configAtom)
  const [version] = useAtom(versionAtom)
  const [tanstackVersion] = useAtom(tanstackVersionAtom)
  const [mswVersion] = useAtom(mswVersionAtom)
  const monacoTheme = useMonacoThemeValue()
  const borderColor = useBorderColor()
  const monaco = useMonaco()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const toast = useToast()

  useEffect(() => {
    monaco?.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSyntaxValidation: true,
      noSemanticValidation: true,
      noSuggestionDiagnostics: true,
    })
  }, [monaco])

  useEffect(() => {
    const url = new URL(location.href)
    const encodedInput = url.searchParams.get('code')
    const storedInput = localStorage.getItem(STORAGE_KEY)
    if (encodedInput) {
      setCode(ungzip(Base64.toUint8Array(encodedInput), { to: 'string' }))
    } else if (storedInput) {
      setCode(storedInput)
    }
  }, [setCode])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, code)
  }, [code])

  const handleEditorDidMount = (instance: editor.IStandaloneCodeEditor) => {
    editorRef.current = instance
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value != null) {
      setCode(value)
    }
  }

  const language = 'typescript'

  return (
    <Flex direction="column" gridArea="input" minW={0} minH={0}>
      <Flex justifyContent="space-between" alignItems="center" marginBottom={'20px'}>
        <Heading size="md">Input (JSON/YAML)</Heading>
      </Flex>
      <Box width="full" height="full" borderColor={borderColor} borderWidth="1px">
        <Editor
          value={code}
          language={language}
          defaultLanguage={language}
          theme={monacoTheme}
          options={editorOptions}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
        />
      </Box>
    </Flex>
  )
}

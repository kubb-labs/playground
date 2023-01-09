import React, { useEffect, useRef } from 'react'
import Editor, { useMonaco } from '@monaco-editor/react'
import { Box, Flex, Heading, HStack, Select } from '@chakra-ui/react'
import stripAnsi from 'strip-ansi'
import { useAtom } from 'jotai'

import type { File } from '@kubb/core'

import { editorOptions as sharedEditorOptions, useBorderColor, useMonacoThemeValue } from '../utils'
import { fileNameAtom } from '../kubb'

import type { TransformationOutput, TransformationResult } from '../kubb'
import type { editor } from 'monaco-editor'

function isTransformedCode(value: unknown): value is TransformationOutput {
  return typeof (value as TransformationOutput).code === 'string'
}

function stringifyOutput(output: TransformationResult): string {
  if (output.err) {
    return stripAnsi(output.val)
  }
  if (isTransformedCode(output.val)) {
    return output.val.code
  }

  return JSON.stringify(output.val, null, 2)
}

interface Props {
  output: TransformationResult
  files?: File[]
}

const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  ...sharedEditorOptions,
  readOnly: true,
  wordWrap: 'on',
  renderControlCharacters: false,
  tabSize: 4,
  autoIndent: 'full',
}

export default function OutputEditor({ output, files }: Props) {
  const editorRef = useRef<editor.IStandaloneCodeEditor>()
  const borderColor = useBorderColor()
  const monacoTheme = useMonacoThemeValue()
  const monaco = useMonaco()
  const [fileName, setFileName] = useAtom(fileNameAtom)

  useEffect(() => {
    monaco?.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSyntaxValidation: true,
      noSemanticValidation: true,
      noSuggestionDiagnostics: true,
    })
  }, [monaco])

  const outputContent = stringifyOutput(output)
  const editorLanguage = output.err ? 'text' : output.val.language

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current?.updateOptions({
        readOnly: false,
      })
      editorRef.current
        .getAction('editor.action.formatDocument')
        .run()
        .then(() => {
          editorRef.current?.updateOptions({
            readOnly: true,
          })
        })
    }
  }, [editorRef, outputContent])

  const handleFileNameChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFileName(event.target.value)
  }

  return (
    <Flex direction="column" gridArea="output" minW={0} minH={0}>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading size="md" mb="8px">
          Output
        </Heading>
        <HStack spacing="10px">
          <Select size="xs" id="logLevel" value={fileName} onInput={handleFileNameChange}>
            {files?.map((file) => {
              return <option value={file.fileName}>{file.path}</option>
            })}
          </Select>
        </HStack>
      </Flex>
      <Box height="full" borderColor={borderColor} borderWidth="1px">
        <Editor
          onMount={(editor) => {
            editorRef.current = editor
          }}
          value={outputContent}
          language={editorLanguage}
          defaultLanguage="javascript"
          path={'output.js'}
          theme={monacoTheme}
          options={editorOptions}
        />
      </Box>
    </Flex>
  )
}

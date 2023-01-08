import { useEffect } from 'react'
import Editor, { useMonaco } from '@monaco-editor/react'
import { Box, Flex, Heading } from '@chakra-ui/react'
import stripAnsi from 'strip-ansi'

import { editorOptions as sharedEditorOptions, useBorderColor, useMonacoThemeValue } from '../utils'

import type { editor } from 'monaco-editor'
import type { TransformationOutput, TransformationResult } from '../kubb'

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
}

const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  ...sharedEditorOptions,
  readOnly: true,
  wordWrap: 'on',
  renderControlCharacters: false,
  tabSize: 4,
}

export default function OutputEditor({ output }: Props) {
  const borderColor = useBorderColor()
  const monacoTheme = useMonacoThemeValue()
  const monaco = useMonaco()

  useEffect(() => {
    monaco?.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSyntaxValidation: true,
      noSemanticValidation: true,
      noSuggestionDiagnostics: true,
    })
  }, [monaco])

  const outputContent = stringifyOutput(output)
  const editorLanguage = output.err ? 'text' : 'javascript'

  return (
    <Flex direction="column" gridArea="output" minW={0} minH={0}>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading size="md" mb="8px">
          Output
        </Heading>
      </Flex>
      <Box height="full" borderColor={borderColor} borderWidth="1px">
        <Editor value={outputContent} language={editorLanguage} defaultLanguage="javascript" path={'output.js'} theme={monacoTheme} options={editorOptions} />
      </Box>
    </Flex>
  )
}

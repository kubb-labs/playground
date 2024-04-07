/* eslint-disable no-undef */
import { useEffect, useMemo } from 'react'
import { useAtom } from 'jotai'
import useSWRMutation from 'swr/mutation'
import useSWR from 'swr'
import { Button, Center, CircularProgress, HStack, useToast, VStack } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { loader } from '@monaco-editor/react'
import { Err } from 'ts-results'
import { gzip } from 'pako'
import { CgFileDocument, CgShare } from 'react-icons/cg'
import { Base64 } from 'js-base64'

import type { KubbFile, UserConfig } from '@kubb/core'

import Configuration from './Configuration'
import VersionSelect from './VersionSelect'
import InputEditor from './InputEditor'
import OutputEditor from './OutputEditor'
import Customize from './Customize'

import { format } from '../format'
import { mswVersionAtom, fileNameAtom, tanstackVersionAtom, versionAtom, inputVisibleAtom } from '../kubb'
import { codeAtom, configAtom } from '../state'

import type { ParserBody, TransformationResult } from '../kubb'

function getIssueReportUrl({ code, version, config, playgroundLink }: { code: string; version: string; config: UserConfig; playgroundLink: string }): string {
  const reportUrl = new URL(`https://github.com/kubb-project/kubb/issues/new?assignees=&labels=C-bug&template=bug_report.yml`)

  reportUrl.searchParams.set('code', code)
  reportUrl.searchParams.set('config', JSON.stringify(config, null, 2))
  reportUrl.searchParams.set('repro-link', playgroundLink)
  reportUrl.searchParams.set('version', version)

  return reportUrl.toString()
}

const Main = styled.main`
  display: grid;
  padding: 1em;
  gap: 1em;

  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  grid-template-areas: 'sidebar' 'input' 'output';

  min-height: 100vh;

  @media screen and (min-width: 600px) {
    grid-template-columns: 256px 1fr;
    grid-template-rows: repeat(2, 1fr);
    grid-template-areas: 'sidebar input' 'sidebar output';
  }

  @media screen and (min-width: 1200px) {
    grid-template-columns: 256px repeat(2, 1fr);
    grid-template-rows: 1fr;
    grid-template-areas: 'sidebar input output';
  }
`

const fetchOutput = async (url: string, { arg }: { arg: ParserBody }) => {
  const file = await fetch(`/api/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: arg.input }),
  }).then(async (response) => {
    const json = await response.json()
    if (response.status === 500) {
      throw json.error
    }

    return json as { url: string }
  })

  return fetch(`/api/parse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file: file.url,
      version: arg.version,
      tanstackVersion: arg.tanstackVersion,
      mswVersion: arg.mswVersion,
      config:
        arg.config && file.url
          ? {
              ...arg.config,
              input: {
                path: file.url,
              },
            }
          : arg.config,
    }),
  }).then(async (response) => {
    const json = await response.json()
    if (response.status === 500) {
      throw json.error
    }

    const files: KubbFile.File[] = json
      .map((file) => {
        return { ...file, path: file.path.split('/gen/')[1] }
      })
      .filter((file) => file.path)
      .reduce((acc, file) => {
        if (!acc.find((item) => item.path === file.path)) {
          return [...acc, file]
        }
        return acc
      }, [] as KubbFile.File[])

    return files
  })
}

// interface KubbModule {
//   default(): Promise<unknown>
//   build: any
// }

// export async function loadKubbCore(version?: string): Promise<KubbModule> {
//   const build: KubbModule = await import(
//     /* webpackIgnore: true */
//     'https://cdn.jsdelivr.net/npm/@kubb/core@0.37.18/dist/index.global.js'
//   )

//   console.log({ build })

//   await build()

//   return build
// }

export default function Workspace() {
  const { data: monaco } = useSWR('monaco', () => loader.init())
  // const d = useSWR('load', () => loadKubbCore())
  const [version] = useAtom(versionAtom)
  const [inputVisible, setInputVisible] = useAtom(inputVisibleAtom)
  const [tanstackVersion] = useAtom(tanstackVersionAtom)
  const [mswVersion] = useAtom(mswVersionAtom)
  const [fileName] = useAtom(fileNameAtom)
  const { trigger, isMutating, data: files, error } = useSWRMutation(`/api/parse`, fetchOutput)
  const [code] = useAtom(codeAtom)
  const [config] = useAtom(configAtom)

  useEffect(() => {
    if (code) {
      trigger({ input: code, config, version, tanstackVersion, mswVersion })
    }
  }, [code, version, tanstackVersion, mswVersion, config])

  const output = useMemo(() => {
    if (error) {
      return Err(String(error))
    }

    if (isMutating) {
      return Err('Loading Kubb...')
    }
    const code = files?.find((file) => file.baseName === fileName)?.source || ''
    let language: 'text' | 'javascript' | 'json' = 'text'

    if (fileName.endsWith('.js') || fileName.endsWith('.ts')) {
      language = 'javascript'
    } else if (fileName.endsWith('.json')) {
      language = 'json'
    }

    return {
      val: {
        code: format(code, language),
        fileName,
        language,
      },
    } as unknown as TransformationResult
  }, [code, isMutating, files, fileName, error, config])
  const toast = useToast()

  useEffect(() => {
    if (error) {
      toast({
        title: 'Failed to load Kubb.',
        description: String(error),
        status: 'error',
        duration: 5000,
        position: 'top',
        isClosable: true,
      })
    }
  }, [error, toast])

  const isLoadingMonaco = !monaco

  const shareUrl = useMemo(() => {
    const url = new URL(globalThis.location.href)
    const encodedInput = Base64.fromUint8Array(gzip(code))
    const encodedConfig = Base64.fromUint8Array(gzip(JSON.stringify(config)))

    url.searchParams.set('version', version)
    url.searchParams.set('tanstack_version', tanstackVersion)
    url.searchParams.set('msw_version', mswVersion)
    url.searchParams.set('config', encodedConfig)
    url.searchParams.set('code', encodedInput)

    return url.toString()
  }, [code, config, version])

  const issueReportUrl = useMemo(
    () =>
      getIssueReportUrl({
        code,
        config,
        version,
        playgroundLink: shareUrl,
      }),
    [code, config, version, shareUrl],
  )

  const handleIssueReportClick = () => {
    if (code.length > 2000) {
      toast({
        title: 'Code too long',
        description: 'Your input is too large to share. Please copy the code and paste it into the issue.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }
    window.open(issueReportUrl, '_blank')
  }

  const handleShare = async () => {
    if (!navigator.clipboard) {
      toast({
        title: 'Error',
        description: 'Clipboard is not supported in your environment.',
        status: 'error',
        duration: 3000,
        position: 'top',
        isClosable: true,
      })
      return
    }

    window.history.replaceState(null, '', shareUrl)
    await navigator.clipboard.writeText(shareUrl)
    toast({
      title: 'URL is copied to clipboard.',
      status: 'success',
      duration: 3000,
      position: 'top',
      isClosable: true,
    })
  }

  if (isLoadingMonaco && !files) {
    return (
      <Center width="full" height="88vh" display="flex" flexDirection="column">
        <CircularProgress isIndeterminate mb="3" />
        <div>
          Loading Kubb {version}
          {isLoadingMonaco && ' and editor'}...
        </div>
      </Center>
    )
  }

  return (
    <Main
      style={{
        gridTemplateAreas: inputVisible ? undefined : "'sidebar output output'",
      }}
    >
      <VStack spacing={4} alignItems="unset" gridArea="sidebar">
        <Configuration />
        <Customize isLoading={isMutating} />
        <VersionSelect isLoading={isMutating} />
        <HStack spacing="10px">
          <Button size="xs" onClick={() => setInputVisible(!inputVisible)}>
            {inputVisible ? 'Hide' : 'Show'} input
          </Button>
          <Button size="xs" leftIcon={<CgFileDocument />} onClick={handleIssueReportClick}>
            Report Issue
          </Button>
          <Button size="xs" leftIcon={<CgShare />} onClick={handleShare}>
            Share
          </Button>
        </HStack>
      </VStack>
      {inputVisible && <InputEditor output={output} />}
      <OutputEditor files={files} output={output} />
    </Main>
  )
}

import { WebContainer } from '@webcontainer/api'
import { files } from './files'

let instance: WebContainer

export function sandboxFactory() {
  async function createWebContainer() {
    if (instance) {
      return instance
    }

    instance = await WebContainer.boot()

    await instance.mount(files)

    // Wait for `server-ready` event
    instance.on('server-ready', (port, url) => {
      console.log('server-ready', url)
    })

    return instance
  }

  async function startShell(instance: WebContainer, terminalEl: HTMLTextAreaElement) {
    const shellProcess = await instance.spawn('jsh', {})

    shellProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          terminalEl.value = data
        },
      })
    )
    const input = shellProcess.input.getWriter()

    // terminal.onData((data) => {
    //   input.write(data)
    // })

    return shellProcess
  }

  async function writeIndexJS(instance: WebContainer, content: string) {
    await instance.fs.writeFile('/index.js', content)
  }

  async function start(instance: WebContainer, terminalEl: HTMLTextAreaElement | null) {
    if (!terminalEl) {
      return
    }

    await writeIndexJS(instance, files['index.js'].file.contents)

    return startShell(instance, terminalEl)
  }

  return {
    start,
    create: createWebContainer,
  }
}

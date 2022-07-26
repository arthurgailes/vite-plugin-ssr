export { createDebugger }
export { isDebugEnabled }
export type { Debug }

import { assert } from './assert'
import { isBrowser } from './isBrowser'
import { isCallable } from './isCallable'
import { objectAssign } from './objectAssign'
assert(!isBrowser()) // Ensure the npm package `debug` to not be included in client-side bundles

export const debugGlob = createDebugger('vps:glob')

// For `route.ts`: it's isomorphic and should not load `debug` on the client-side, instead it uses `debug()` only on the server-side.
// @ts-ignore
globalThis.__vite_plugin_ssr_createDebugger = createDebugger

type Debug = ReturnType<typeof createDebugger>

type Namespace = `vps:${string}`

type Options = {
  serialization?: {
    emptyArray?: string
  }
}

function createDebugger(namespace: Namespace, optionsGlobal?: Options) {
  const debugWithOptions = (options: Options) => {
    return (...msgs: unknown[]) => {
      if (!isDebugEnabled(namespace)) return
      const msgsStr = msgs.map((msg) => strMsg(msg, { ...optionsGlobal, ...options }))
      console.log('\x1b[1m%s\x1b[0m', namespace, ...msgsStr)
    }
  }
  const debug = (...msgs: unknown[]) => debugWithOptions({})(...msgs)
  objectAssign(debug, { options: debugWithOptions })
  return debug
}

function isDebugEnabled(namespace: Namespace) {
  let DEBUG: undefined | string
  // - `process` can be undefined in edge workers
  // - We want bundlers to be able to statically replace `process.env.*`
  try {
    DEBUG = process.env.DEBUG
  } catch {}
  return DEBUG?.includes(namespace)
}

function strMsg(msg: unknown, options: Options): string {
  if (typeof msg === 'string') {
    return msg
  }
  if (Array.isArray(msg)) {
    if (msg.length === 0) {
      return options.serialization?.emptyArray ?? '[]'
    }
    return '\n' + msg.map((entry) => strEntry(entry)).join('\n')
  }
  return strEntry(msg)
}

const padding1 = '   - '
const padding2 = '     '
function strEntry(entry: unknown) {
  return padding1 + (typeof entry === 'string' ? entry : strObj(entry))
}

function strObj(obj: unknown, newLines = false) {
  let str: string
  if (newLines) {
    str = JSON.stringify(obj, replacer, 2)
    str = str.split('\n').join('\n' + padding2)
  } else {
    str = JSON.stringify(obj, replacer, undefined)
  }
  return str
  function replacer(this: Record<string, unknown>, _key: string, value: unknown) {
    if (isCallable(value)) {
      return value.toString().split(/\s+/).join(' ')
    }
    return value
  }
}

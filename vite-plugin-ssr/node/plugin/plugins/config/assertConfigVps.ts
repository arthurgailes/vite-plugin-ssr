export { assertConfigVpsResolved }
export { assertConfigVpsUser }

import { assert, assertUsage, hasProp, isObject } from '../../../utils'
import { ConfigVpsResolved } from './ConfigVps'

function assertConfigVpsUser(
  vitePluginSsr: unknown,
  userInputFormat: null | ((args: { configPath: string; configPathInObject: string; configProp: string }) => string)
): asserts vitePluginSsr is ConfigVpsResolved {
  assert(isObject(vitePluginSsr))
  assertConfig(
    'disableAutoFullBuild',
    'should be a boolean',
    hasProp(vitePluginSsr, 'disableAutoFullBuild', 'boolean') ||
      hasProp(vitePluginSsr, 'disableAutoFullBuild', 'undefined')
  )
  assertPageFilesConfig(vitePluginSsr)
  assertPrerenderConfig(vitePluginSsr)
  assertConfig(
    'includeCSS',
    'should be an array of strings',
    hasProp(vitePluginSsr, 'includeCSS', 'string[]') || hasProp(vitePluginSsr, 'includeCSS', 'undefined')
  )
  assertConfig(
    'includeAssetsImportedByServer',
    'should be a boolean',
    hasProp(vitePluginSsr, 'includeAssetsImportedByServer', 'boolean') ||
      hasProp(vitePluginSsr, 'includeAssetsImportedByServer', 'undefined')
  )

  return

  function assertPrerenderConfig(
    vitePluginSsr: Record<string, unknown>
  ): asserts vitePluginSsr is Pick<ConfigVpsResolved, 'prerender'> {
    assertConfig(
      'prerender',
      'should be an object or a boolean',
      hasProp(vitePluginSsr, 'prerender', 'object') ||
        hasProp(vitePluginSsr, 'prerender', 'boolean') ||
        hasProp(vitePluginSsr, 'prerender', 'undefined')
    )

    const prerender = vitePluginSsr.prerender ?? {}
    if (prerender && typeof prerender !== 'boolean') {
      assertConfig(
        'prerender.partial',
        'should be a boolean',
        hasProp(prerender, 'partial', 'undefined') || hasProp(prerender, 'partial', 'boolean')
      )
      assertConfig(
        'prerender.noExtraDir',
        'should be a boolean',
        hasProp(prerender, 'noExtraDir', 'undefined') || hasProp(prerender, 'noExtraDir', 'boolean')
      )
      assertConfig(
        'prerender.parallel',
        'should be a boolean or a number',
        hasProp(prerender, 'parallel', 'undefined') ||
          hasProp(prerender, 'parallel', 'boolean') ||
          hasProp(prerender, 'parallel', 'number')
      )
      assertConfig(
        'prerender.disableAutoRun',
        'should be a boolean',
        hasProp(prerender, 'disableAutoRun', 'undefined') || hasProp(prerender, 'disableAutoRun', 'boolean')
      )
    }
  }

  function assertPageFilesConfig(
    vitePluginSsr: Record<string, unknown>
  ): asserts vitePluginSsr is Pick<ConfigVpsResolved, 'pageFiles'> {
    assertConfig(
      'pageFiles',
      'should be an object',
      hasProp(vitePluginSsr, 'pageFiles', 'undefined') || hasProp(vitePluginSsr, 'pageFiles', 'object')
    )
    if (!vitePluginSsr.pageFiles) {
      return
    }
    if (vitePluginSsr.pageFiles?.include !== undefined) {
      assertConfig(
        'pageFiles.include',
        'should be a string array',
        hasProp(vitePluginSsr.pageFiles, 'include', 'string[]')
      )
    }
  }

  function assertConfig(configPath: string, errMsg: string, condition: boolean): asserts condition {
    if (!userInputFormat) {
      assert(condition)
    } else {
      const p = configPath.split('.')
      assert(p.length <= 2)
      const configPathInObject = p.length === 2 ? `${p[0]}: { ${p[1]} }` : configPath
      const configProp = p[p.length - 1]
      assert(configProp)
      assertUsage(condition, `${userInputFormat({ configPath, configPathInObject, configProp })} ${errMsg}.`)
    }
  }
}

function assertConfigVpsResolved<T>(config: T): asserts config is T & { vitePluginSsr: ConfigVpsResolved } {
  assert(hasProp(config, 'vitePluginSsr', 'object'))
  const { vitePluginSsr } = config
  // Internal assertion
  assertConfigVpsUser(vitePluginSsr, null)
}

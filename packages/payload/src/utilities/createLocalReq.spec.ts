import { describe, expect, it, vi } from 'vitest'

import type { CMS } from '../index.js'

import { createLocalReq } from './createLocalReq.js'

describe('createLocalReq - URL construction', () => {
  const mockCMS = {
    config: {
      serverURL: undefined,
      i18n: {
        fallbackLanguage: 'en',
        supportedLanguages: { en: {} },
        translations: {},
      },
      localization: undefined,
    },
    logger: {
      error: vi.fn(),
    },
  } as unknown as CMS

  it('should use req.url when provided and serverURL is undefined', async () => {
    const req = {
      url: 'http://example.com/api/test',
    }

    const result = await createLocalReq({ req }, mockCMS)

    expect(result.url).toBe('http://example.com/api/test')
    expect(mockCMS.logger.error).not.toHaveBeenCalled()
  })

  it('should use serverURL when req.url is not provided', async () => {
    const cmsWithServerURL = {
      config: {
        serverURL: 'http://configured-server.com',
        i18n: {
          fallbackLanguage: 'en',
          supportedLanguages: { en: {} },
          translations: {},
        },
        localization: undefined,
      },
      logger: {
        error: vi.fn(),
      },
    } as unknown as CMS

    const req = {}

    const result = await createLocalReq({ req, urlSuffix: '/api' }, cmsWithServerURL)

    expect(result.url).toContain('http://configured-server.com/api')
    expect(cmsWithServerURL.logger.error).not.toHaveBeenCalled()
  })

  it('should prioritize req.url over serverURL', async () => {
    const cmsWithServerURL = {
      config: {
        serverURL: 'http://configured-server.com',
        i18n: {
          fallbackLanguage: 'en',
          supportedLanguages: { en: {} },
          translations: {},
        },
        localization: undefined,
      },
      logger: {
        error: vi.fn(),
      },
    } as unknown as CMS

    const req = {
      url: 'http://actual-request.com/api/test',
    }

    const result = await createLocalReq({ req }, cmsWithServerURL)

    expect(result.url).toBe('http://actual-request.com/api/test')
    expect(cmsWithServerURL.logger.error).not.toHaveBeenCalled()
  })

  it('should fall back to localhost when neither req.url nor serverURL provided', async () => {
    const req = {}

    const result = await createLocalReq({ req }, mockCMS)

    expect(result.url).toBe('http://localhost/')
    expect(mockCMS.logger.error).not.toHaveBeenCalled()
  })

  it('should append urlSuffix to serverURL when used', async () => {
    const cmsWithServerURL = {
      config: {
        serverURL: 'http://configured-server.com',
        i18n: {
          fallbackLanguage: 'en',
          supportedLanguages: { en: {} },
          translations: {},
        },
        localization: undefined,
      },
      logger: {
        error: vi.fn(),
      },
    } as unknown as CMS

    const req = {}

    const result = await createLocalReq({ req, urlSuffix: '/api/preview' }, cmsWithServerURL)

    expect(result.url).toContain('/api/preview')
    expect(cmsWithServerURL.logger.error).not.toHaveBeenCalled()
  })

  it('should append urlSuffix to fallback URL when neither req.url nor serverURL provided', async () => {
    const req = {}

    const result = await createLocalReq({ req, urlSuffix: '/api/test' }, mockCMS)

    expect(result.url).toBe('http://localhost/api/test')
    expect(mockCMS.logger.error).not.toHaveBeenCalled()
  })
})

import { createServerFeature } from '@hanzo/cms-richtext-lexical'

/**
 * Editor-side AI: rewrite a selection from the inline toolbar, draft from the
 * slash menu, generate an image from the fixed toolbar. The client half calls
 * the plugin's endpoints, so it needs `hanzoAIPlugin` in the same config.
 */
export const HanzoAIFeature = createServerFeature({
  feature: {
    ClientFeature: '@hanzo/cms-plugin-ai/client#HanzoAIFeatureClient',
  },
  key: 'hanzoAI',
})

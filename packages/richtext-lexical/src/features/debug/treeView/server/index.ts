import { createServerFeature } from '../../../../utilities/createServerFeature.js'

export const TreeViewFeature = createServerFeature({
  feature: {
    ClientFeature: '@hanzo/cms-richtext-lexical/client#TreeViewFeatureClient',
  },
  key: 'treeView',
})

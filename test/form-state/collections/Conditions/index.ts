import type { CollectionConfig } from '@hanzo/cms'

export const conditionsSlug = 'conditions'

export const ConditionsCollection: CollectionConfig = {
  slug: conditionsSlug,
  fields: [
    {
      name: 'showField',
      type: 'checkbox',
    },
    {
      name: 'conditionalCustomField',
      type: 'text',
      admin: {
        condition: (data) => data?.showField === true,
        components: {
          Field: './collections/Conditions/CustomField.js#CustomTextField',
        },
      },
    },
  ],
}

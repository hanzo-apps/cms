import type { CollectionConfig } from '@hanzo/cms'

export const textareaFields: CollectionConfig['fields'] = [
  {
    name: 'textareaFieldServerComponent',
    type: 'textarea',
    admin: {
      components: {
        Field: '@/collections/Fields/textarea/components/server/Field#CustomTextareaFieldServer',
        Label:
          '@/collections/Fields/textarea/components/server/Label#CustomTextareaFieldLabelServer',
      },
    },
  },
  {
    name: 'textareaFieldClientComponent',
    type: 'textarea',
    admin: {
      components: {
        Field: '@/collections/Fields/textarea/components/client/Field#CustomTextareaFieldClient',
        Label:
          '@/collections/Fields/textarea/components/client/Label#CustomTextareaFieldLabelClient',
      },
    },
  },
]

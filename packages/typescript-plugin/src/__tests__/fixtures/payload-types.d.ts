declare type RawCMSComponent = {
  clientProps?: object
  exportName?: string
  path: string
  serverProps?: object
}

declare type CMSComponent = false | RawCMSComponent | string

declare type CustomComponent = CMSComponent

declare interface FieldConfig {
  admin?: {
    components?: {
      Cell?: CMSComponent
      Description?: CMSComponent
      Field?: CMSComponent
      Label?: CMSComponent
    }
  }
  name: string
  type: string
}

declare interface AdminConfig {
  components?: {
    actions?: CustomComponent[]
    graphics?: {
      Icon?: CMSComponent
      Logo?: CMSComponent
    }
    Nav?: CMSComponent
    views?: Record<
      string,
      {
        Component?: CMSComponent
        path?: string
      }
    >
  }
}

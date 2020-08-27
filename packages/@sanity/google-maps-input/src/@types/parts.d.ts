declare module 'part:*'
declare module 'all:part:*' {
  const parts: unknown[]
  export default parts
}
declare module 'config:@sanity/google-maps-input' {
  interface Config {
    apiKey: string
    defaultZoom?: number
    defaultLocation?: {
      lat: number
      lng: number
    }
  }
  const config: Config
  export default config
}

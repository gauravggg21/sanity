import {SchemaType} from '@sanity/field/diff'

export function isPTSchemaType(schemaType: SchemaType) {
  // TODO: check up on hoisting / graphql!
  return schemaType.jsonType === 'object' && schemaType.name === 'block'
}

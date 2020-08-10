import {ComponentType} from 'react'
import {Diff} from '@sanity/diff'
import {Annotation} from '../panes/documentPane/history/types'

export type DiffComponent<T extends Diff<Annotation> = Diff<Annotation>> = ComponentType<
  DiffProps<T>
>

export type DiffProps<T extends Diff<Annotation> = Diff<Annotation>> = {
  diff: T
  schemaType: SchemaType<T>
  items?: {fromType?: string; toType: string}[]
}

export interface ObjectField {
  name: string
  type: SchemaType
}

export interface SchemaType<T extends Diff<Annotation> = Diff<Annotation>> {
  name: string
  title?: string
  jsonType: string
  type?: SchemaType<T>
  to?: {name: string}[]
  diffComponent?: DiffComponent<T>
  fields?: ObjectField[]
}

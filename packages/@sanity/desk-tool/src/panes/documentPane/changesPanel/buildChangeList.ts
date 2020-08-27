import {
  ObjectDiff,
  ObjectSchemaType,
  Path,
  ArraySchemaType,
  ArrayDiff,
  SchemaType,
  Diff,
  ChangeNode,
  ChangeTitlePath
} from '@sanity/field/diff'
import {toString as pathToString} from '@sanity/util/paths'
import {resolveDiffComponent} from '../../../diffs/resolveDiffComponent'
import {getArrayDiffItemType} from './helpers'

export function buildDocumentChangeList(schemaType: ObjectSchemaType, diff: ObjectDiff) {
  const changes = buildChangeList(schemaType, diff)
  return changes.length === 1 && changes[0].type === 'group' && changes[0].path.length === 0
    ? changes[0].changes
    : changes
}

export function buildChangeList(
  schemaType: SchemaType,
  diff: Diff,
  path: Path = [],
  titlePath: ChangeTitlePath = []
): ChangeNode[] {
  const diffComponent = resolveDiffComponent(schemaType)

  if (!diffComponent && schemaType.jsonType === 'object' && diff.type === 'object') {
    return buildObjectChangeList(schemaType, diff, path, titlePath)
  }

  if (!diffComponent && schemaType.jsonType === 'array' && diff.type === 'array') {
    return buildArrayChangeList(schemaType, diff, path, titlePath)
  }

  return [
    {
      type: 'field',
      diff,
      path,
      titlePath,
      schemaType,
      key: pathToString(path),
      diffComponent
    }
  ]
}

function buildObjectChangeList(
  schemaType: ObjectSchemaType,
  diff: ObjectDiff,
  path: Path = [],
  titlePath: ChangeTitlePath = []
): ChangeNode[] {
  const changes: ChangeNode[] = []

  for (const field of schemaType.fields) {
    const fieldDiff = diff.fields[field.name]
    if (!fieldDiff || !fieldDiff.isChanged) {
      continue
    }

    const fieldPath = path.concat([field.name])
    const fieldTitlePath = titlePath.concat([field.type.title || field.name])

    changes.push(...buildChangeList(field.type, fieldDiff, fieldPath, fieldTitlePath))
  }

  if (changes.length > 1) {
    return [
      {
        type: 'group',
        groupType: 'object',
        key: pathToString(path),
        path,
        titlePath,
        changes: reduceTitlePaths(changes, titlePath.length)
      }
    ]
  }

  return changes
}

function buildArrayChangeList(
  schemaType: ArraySchemaType,
  arrayDiff: ArrayDiff,
  path: Path = [],
  titlePath: ChangeTitlePath = []
): ChangeNode[] {
  const changedOrMoved = arrayDiff.items.filter(
    item => item.hasMoved || item.diff.action !== 'unchanged'
  )

  if (changedOrMoved.length === 0) {
    return []
  }

  const list: ChangeNode[] = []
  const changes = changedOrMoved.reduce((acc, itemDiff) => {
    const memberTypes = getArrayDiffItemType(itemDiff.diff, schemaType)
    const memberType = memberTypes.toType || memberTypes.fromType
    if (!memberType) {
      // eslint-disable-next-line no-console
      console.warn('Could not determine schema type for item at %s', pathToString(path))
      return acc
    }

    const index = arrayDiff.items.indexOf(itemDiff)
    const itemPath = path.concat(index)
    const itemTitlePath = titlePath.concat({
      hasMoved: itemDiff.hasMoved,
      toIndex: itemDiff.toIndex,
      fromIndex: itemDiff.fromIndex
    })

    acc.push(...buildChangeList(memberType, itemDiff.diff, itemPath, itemTitlePath))
    return acc
  }, list)

  if (changes.length > 1) {
    return [
      {
        type: 'group',
        groupType: 'array',
        key: pathToString(path),
        path,
        titlePath,
        changes: reduceTitlePaths(changes, titlePath.length)
      }
    ]
  }

  return changes
}

function reduceTitlePaths(changes: ChangeNode[], byLength = 1): ChangeNode[] {
  return changes.map(change => {
    change.titlePath = change.titlePath.slice(byLength)
    return change
  })
}

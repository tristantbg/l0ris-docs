import { documents } from './documents'
import { localeTypes } from './locale'
import { objects } from './objects'
import { blocks } from './objects/blocks'
import { home } from './singletons/home'
import { settings } from './singletons/settings'

export const singletons = [home, settings]

export const schemaTypes = [
  ...localeTypes,
  ...objects,
  ...blocks,
  ...documents,
  ...singletons,
]

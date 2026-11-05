import type { Access, CollectionConfig, Where } from 'payload'
import { isDeletedField } from '../fields/isDeleted'

const isAdmin: Access = ({ req }) => req.user?.collection === 'admins'
const publicServiceQuery: Where = {
  and: [{ _status: { equals: 'published' } }, { enabled: { equals: true } }],
}

export const Services: CollectionConfig = {
  slug: 'services',
  trash: true,
  admin: {
    group: 'Website',
    useAsTitle: 'title',
    defaultColumns: ['title', 'enabled', '_status', 'sortOrder'],
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: ({ req }) => (req.user?.collection === 'admins' ? true : publicServiceQuery),
    update: isAdmin,
  },
  versions: { drafts: true, maxPerDoc: 15 },
  fields: [
    isDeletedField,
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'summary', type: 'textarea', required: true },
    { name: 'deliverables', type: 'textarea' },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Only enable services the studio has confirmed it offers.' },
    },
    { name: 'isSample', type: 'checkbox', defaultValue: true },
    { name: 'sortOrder', type: 'number', defaultValue: 100 },
  ],
}

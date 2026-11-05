import type { Access, CollectionConfig } from 'payload'
import { isDeletedField } from '../fields/isDeleted'

const isAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const JournalArticles: CollectionConfig = {
  slug: 'journal-articles',
  trash: true,
  labels: { singular: 'Journal article', plural: 'Journal' },
  admin: {
    group: 'Website',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', '_status', 'publishedOn'],
    description:
      'Public journal pages are build-time snapshots. After publishing edits or new articles, rebuild and deploy the site for them to appear.',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: ({ req }) =>
      req.user?.collection === 'admins' ? true : { _status: { equals: 'published' } },
    update: isAdmin,
  },
  versions: {
    drafts: { autosave: true, schedulePublish: true },
    maxPerDoc: 20,
  },
  fields: [
    isDeletedField,
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Use a lowercase, hyphen-separated URL slug. Changing a published slug changes its public URL.',
      },
    },
    { name: 'category', type: 'text' },
    { name: 'excerpt', type: 'textarea', required: true },
    { name: 'body', type: 'textarea', required: true },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'publishedOn', type: 'date' },
    { name: 'isSample', type: 'checkbox', defaultValue: true },
  ],
}

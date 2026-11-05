import type { Access, CollectionConfig, Where } from 'payload'
import { isDeletedField } from '../fields/isDeleted'

const isAdmin: Access = ({ req }) => req.user?.collection === 'admins'
const publicProjectQuery: Where = {
  and: [{ _status: { equals: 'published' } }, { recordStatus: { equals: 'active' } }],
}

export const Projects: CollectionConfig = {
  slug: 'projects',
  trash: true,
  admin: {
    group: 'Portfolio',
    useAsTitle: 'title',
    defaultColumns: ['title', 'projectType', 'location', '_status', 'recordStatus'],
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: ({ req }) => (req.user?.collection === 'admins' ? true : publicProjectQuery),
    update: isAdmin,
  },
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
    },
    maxPerDoc: 20,
  },
  fields: [
    isDeletedField,
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'isSample',
      label: 'Sample / placeholder content',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Keep enabled until the studio verifies this project information.',
      },
    },
    {
      name: 'recordStatus',
      label: 'Portfolio status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'projectType',
      type: 'select',
      required: true,
      options: [
        { label: 'Full-home interiors', value: 'full-home' },
        { label: 'Apartment interiors', value: 'apartment' },
        { label: 'Villa interiors', value: 'villa' },
        { label: 'Kitchen', value: 'kitchen' },
        { label: 'Bedroom and wardrobes', value: 'bedroom' },
        { label: 'Living and dining', value: 'living-dining' },
        { label: 'Renovation', value: 'renovation' },
        { label: 'Commercial interiors', value: 'commercial' },
      ],
    },
    {
      name: 'location',
      type: 'text',
      admin: {
        description: 'Only enter a locality when it has been verified.',
      },
    },
    { name: 'scope', type: 'text' },
    { name: 'summary', type: 'textarea', required: true },
    { name: 'designApproach', type: 'textarea' },
    {
      name: 'materials',
      type: 'array',
      fields: [{ name: 'material', type: 'text', required: true }],
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Primary image used for project cards and the project hero.',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      admin: {
        description: 'Drag rows to reorder the project gallery.',
      },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'sortOrder', type: 'number', defaultValue: 100 },
  ],
}

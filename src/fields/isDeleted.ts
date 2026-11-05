import type { Field } from 'payload'

// Mirrors Payload's trash `deletedAt` as a plain 'Y'/'N' flag for SQL filtering and reporting.
export const isDeletedField: Field = {
  name: 'isDeleted',
  label: 'Deleted',
  type: 'select',
  defaultValue: 'N',
  index: true,
  options: [
    { label: 'No', value: 'N' },
    { label: 'Yes', value: 'Y' },
  ],
  admin: {
    position: 'sidebar',
    readOnly: true,
    description: 'Set automatically when the record is moved to or restored from Trash.',
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const deletedAt =
          data && 'deletedAt' in data ? data.deletedAt : (originalDoc?.deletedAt ?? null)
        return deletedAt ? 'Y' : 'N'
      },
    ],
  },
}

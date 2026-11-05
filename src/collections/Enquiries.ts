import type { Access, CollectionConfig, FieldAccess } from 'payload'
import { isDeletedField } from '../fields/isDeleted'

const isAdmin: Access = ({ req }) => req.user?.collection === 'admins'
const isAdminField: FieldAccess = ({ req }) => req.user?.collection === 'admins'

export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  trash: true,
  admin: {
    group: 'Operations',
    useAsTitle: 'name',
    defaultColumns: ['name', 'mobile', 'city', 'status', 'createdAt'],
  },
  access: {
    create: () => true,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  // Avoid duplicating personal contact details into version history.
  versions: false,
  fields: [
    isDeletedField,
    { name: 'name', type: 'text', required: true },
    { name: 'mobile', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'city', type: 'text', required: true },
    {
      name: 'propertyType',
      type: 'select',
      required: true,
      options: ['Apartment', 'Villa', 'Independent home', 'Commercial space', 'Other'],
    },
    { name: 'propertySize', type: 'text' },
    {
      name: 'requiredServices',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        'Full-home interiors',
        'Apartment interiors',
        'Villa interiors',
        'Modular kitchen',
        'Bedrooms and wardrobes',
        'Living and dining',
        'Renovation',
        'Commercial interiors',
        'Turnkey design and execution',
      ],
    },
    { name: 'preferredStartDate', type: 'date' },
    {
      name: 'budgetRange',
      type: 'select',
      options: ['Under ₹10 lakh', '₹10–20 lakh', '₹20–40 lakh', '₹40–75 lakh', '₹75 lakh+'],
    },
    { name: 'description', type: 'textarea' },
    {
      name: 'preferredContact',
      type: 'select',
      required: true,
      options: ['Phone', 'WhatsApp', 'Email'],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      access: { create: isAdminField, update: isAdminField },
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Qualified', value: 'qualified' },
        { label: 'Consultation scheduled', value: 'scheduled' },
        { label: 'Closed', value: 'closed' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      access: { create: isAdminField, read: isAdminField, update: isAdminField },
    },
  ],
  hooks: {
    beforeChange: [
      // Public submissions must not be able to create already-trashed records.
      ({ data, operation, req }) => {
        if (operation === 'create' && req.user?.collection !== 'admins') delete data.deletedAt
        return data
      },
    ],
  },
}

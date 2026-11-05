import * as migration_20261104_123151_initial from './20261104_123151_initial';
import * as migration_20261104_163042_add_media_storage_fields from './20261104_163042_add_media_storage_fields';
import * as migration_20261105_124317_disable_enquiry_versions from './20261105_124317_disable_enquiry_versions';
import * as migration_20261105_132421_soft_delete from './20261105_132421_soft_delete';

export const migrations = [
  {
    up: migration_20261104_123151_initial.up,
    down: migration_20261104_123151_initial.down,
    name: '20261104_123151_initial',
  },
  {
    up: migration_20261104_163042_add_media_storage_fields.up,
    down: migration_20261104_163042_add_media_storage_fields.down,
    name: '20261104_163042_add_media_storage_fields',
  },
  {
    up: migration_20261105_124317_disable_enquiry_versions.up,
    down: migration_20261105_124317_disable_enquiry_versions.down,
    name: '20261105_124317_disable_enquiry_versions',
  },
  {
    up: migration_20261105_132421_soft_delete.up,
    down: migration_20261105_132421_soft_delete.down,
    name: '20261105_132421_soft_delete'
  },
];

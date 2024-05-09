import { Connection } from 'mongoose';
import { PendingFilesSchema } from './schemas/pending-files';

export const pendingFilesProviders = [
  {
    provide: 'PENDING_FILES_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('PendingFiles', PendingFilesSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];

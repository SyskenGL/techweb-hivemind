import { User } from '@prisma/client';

export interface ISafeUser extends Omit<User, 'secret'> {}

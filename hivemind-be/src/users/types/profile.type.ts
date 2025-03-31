import { Prisma } from '@prisma/client';

export const hydratedProfileArgs = Object.freeze(
  Prisma.validator<Prisma.ProfileDefaultArgs>()({
    include: { propic: true, cover: true }
  })
);

export type HydratedProfile = Prisma.ProfileGetPayload<
  typeof hydratedProfileArgs
>;

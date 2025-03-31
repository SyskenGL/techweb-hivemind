import { Injectable } from '@nestjs/common';
import { PrismaService } from '@datastore/prisma/prisma.service';
import { HashtagEngagement } from '@prisma/client';

@Injectable()
export class HashtagsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getTrendingHashtags(): Promise<HashtagEngagement[]> {
    return await this.prismaService.hashtagEngagement.findMany({
      orderBy: [
        { usageCount: 'desc' },
        { totalUsageCount: 'desc' },
        { id: 'desc' }
      ],
      take: 10
    });
  }
}

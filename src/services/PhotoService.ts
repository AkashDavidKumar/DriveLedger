import { eq, desc } from 'drizzle-orm';
import { db } from '../database/db';
import { photos } from '../database/schema';
import * as Crypto from 'expo-crypto';
// @ts-ignore
import { documentDirectory, copyAsync } from 'expo-file-system';

export class PhotoService {
  static async addPhoto(workEntryId: string, sourceUri: string) {
    const filename = `${Crypto.randomUUID()}.jpg`;
    const destinationUri = `${documentDirectory}${filename}`;

    // Copy photo to local app storage
    await copyAsync({
      from: sourceUri,
      to: destinationUri,
    });

    const id = Crypto.randomUUID();
    await db.insert(photos).values({
      id,
      workEntryId,
      localUri: destinationUri,
      createdAt: Date.now(),
    });

    return { id, localUri: destinationUri };
  }

  static async getPhotosForWorkEntry(workEntryId: string) {
    return await db.select().from(photos)
      .where(eq(photos.workEntryId, workEntryId))
      .orderBy(desc(photos.createdAt));
  }
}

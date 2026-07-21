import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import JSZip from 'jszip';
import dayjs from 'dayjs';
import { db } from '../database/db';
import { workEntries, owners, vehicles, photos } from '../database/schema';
import { sql } from 'drizzle-orm';
import { ReportService } from './ReportService';

const FS = FileSystem as any;
const BACKUP_DIR = `${FS.documentDirectory}backups/`;
const SCHEMA_VERSION = 1;

export class BackupService {
  /**
   * Generates backup metadata payload
   */
  private static async generateManifest() {
    const stats = {
      owners: (await db.select({ count: sql<number>`count(*)` }).from(owners))[0].count,
      vehicles: (await db.select({ count: sql<number>`count(*)` }).from(vehicles))[0].count,
      workEntries: (await db.select({ count: sql<number>`count(*)` }).from(workEntries))[0].count,
      photos: (await db.select({ count: sql<number>`count(*)` }).from(photos))[0].count,
    };

    return {
      appName: 'DriveLedger',
      schemaVersion: SCHEMA_VERSION,
      appVersion: '1.0',
      timestamp: Date.now(),
      dateString: dayjs().format('YYYY-MM-DD_HH-mm'),
      recordCounts: stats,
      settings: { restoreInactiveOwners: false } // Placeholder for settings
    };
  }

  /**
   * Creates a complete backup package locally
   */
  static async createBackup(isSafetyBackup = false) {
    const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
    }

    const zip = new JSZip();
    const manifest = await this.generateManifest();
    
    // Add manifest
    zip.file('metadata.json', JSON.stringify(manifest, null, 2));

    // Add Database
    const dbPath = `${FS.documentDirectory}SQLite/driveledger.db`;
    const dbExists = await FileSystem.getInfoAsync(dbPath);
    if (dbExists.exists) {
      const dbBase64 = await FileSystem.readAsStringAsync(dbPath, { encoding: FileSystem.EncodingType.Base64 });
      zip.file('database/driveledger.db', dbBase64, { base64: true });
    }

    // Add Photos
    const rootFiles = await FileSystem.readDirectoryAsync(FS.documentDirectory as string);
    const photoFiles = rootFiles.filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg'));
    
    const photosFolder = zip.folder('photos');
    for (const photo of photoFiles) {
      const photoPath = `${FS.documentDirectory}${photo}`;
      const photoBase64 = await FileSystem.readAsStringAsync(photoPath, { encoding: FileSystem.EncodingType.Base64 });
      photosFolder?.file(photo, photoBase64, { base64: true });
    }

    // Generate Zip
    const zipBase64 = await zip.generateAsync({ type: 'base64' });
    const prefix = isSafetyBackup ? 'SafetyBackup' : 'DriveLedger_Backup';
    const filename = `${prefix}_${manifest.dateString}.zip`;
    const destPath = `${BACKUP_DIR}${filename}`;

    await FileSystem.writeAsStringAsync(destPath, zipBase64, { encoding: FileSystem.EncodingType.Base64 });
    
    return { path: destPath, filename, manifest };
  }

  /**
   * Validates an extracted backup package
   */
  private static async validateBackupPackage(zip: JSZip) {
    const manifestFile = zip.file('metadata.json');
    if (!manifestFile) throw new Error('Invalid backup: Missing metadata.json');
    
    const manifestStr = await manifestFile.async('string');
    const manifest = JSON.parse(manifestStr);

    if (manifest.appName !== 'DriveLedger') throw new Error('Invalid backup: Not a DriveLedger backup file.');
    if (parseInt(manifest.schemaVersion) > SCHEMA_VERSION) throw new Error(`Incompatible backup version (${manifest.schemaVersion}). Please update the app.`);

    const dbFile = zip.file('database/driveledger.db');
    if (!dbFile) throw new Error('Invalid backup: Missing database file.');

    return manifest;
  }

  /**
   * Imports a backup via Document Picker
   */
  static async importBackup() {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/zip', 'application/x-zip-compressed'] });
    if (result.canceled || !result.assets || result.assets.length === 0) return null;

    const fileUri = result.assets[0].uri;
    const base64Data = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
    
    const zip = await JSZip.loadAsync(base64Data, { base64: true });
    const manifest = await this.validateBackupPackage(zip);
    
    return { zip, manifest, originalName: result.assets[0].name };
  }

  /**
   * Restores a pre-loaded zip object
   */
  static async restoreBackup(zip: JSZip) {
    // 1. Create safety backup
    await this.createBackup(true);

    // 2. Restore DB
    const dbFile = zip.file('database/driveledger.db');
    const dbBase64 = await dbFile!.async('base64');
    const dbDir = `${FS.documentDirectory}SQLite/`;
    
    const dirInfo = await FileSystem.getInfoAsync(dbDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
    }
    
    await FileSystem.writeAsStringAsync(`${dbDir}driveledger.db`, dbBase64, { encoding: FileSystem.EncodingType.Base64 });

    // 3. Restore Photos
    const photosFolder = zip.folder('photos');
    if (photosFolder) {
      // First, clean up existing photos locally to prevent orphans? 
      // The prompt says "Restore all photos". We'll just overwrite/add. 
      // To strictly align with DB, deleting existing local photos would be safer.
      const rootFiles = await FileSystem.readDirectoryAsync(FS.documentDirectory as string);
      for (const f of rootFiles) {
        if (f.toLowerCase().endsWith('.jpg')) {
          await FileSystem.deleteAsync(`${FS.documentDirectory}${f}`, { idempotent: true });
        }
      }

      for (const filename in photosFolder.files) {
        if (!photosFolder.files[filename].dir) {
          const photoBase64 = await photosFolder.file(filename)!.async('base64');
          const pureFilename = filename.replace('photos/', '');
          await FileSystem.writeAsStringAsync(`${FS.documentDirectory}${pureFilename}`, photoBase64, { encoding: FileSystem.EncodingType.Base64 });
        }
      }
    }

    // 4. Invalidate all reports
    ReportService.invalidateCache();
  }

  /**
   * Lists all local backups
   */
  static async listBackups() {
    const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
    if (!dirInfo.exists) return [];

    const files = await FileSystem.readDirectoryAsync(BACKUP_DIR);
    const backups = [];

    for (const file of files) {
      if (file.endsWith('.zip')) {
        const info = await FileSystem.getInfoAsync(`${BACKUP_DIR}${file}`);
        backups.push({
          filename: file,
          path: `${BACKUP_DIR}${file}`,
          size: info.exists ? info.size : 0,
          timestamp: info.exists ? info.modificationTime : 0,
        });
      }
    }
    return backups.sort((a, b) => b.timestamp - a.timestamp); // Newest first
  }

  static async deleteBackup(filename: string) {
    await FileSystem.deleteAsync(`${BACKUP_DIR}${filename}`, { idempotent: true });
  }

  static async exportBackup(path: string) {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path);
    }
  }
}

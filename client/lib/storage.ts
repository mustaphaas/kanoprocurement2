import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata
} from 'firebase/storage';
import { storage } from './firebase';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

export interface FileMetadata {
  name: string;
  fullPath: string;
  size: number;
  timeCreated: string;
  updated: string;
  contentType?: string;
  downloadURL: string;
}

class StorageService {
  // Upload file with progress tracking
  uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (onProgress) {
            const progress: UploadProgress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              state: snapshot.state as any
            };
            onProgress(progress);
          }
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  // Simple file upload without progress tracking
  async uploadFileSimple(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }

  // Upload multiple files
  async uploadMultipleFiles(
    files: File[],
    basePath: string,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<string[]> {
    const uploadPromises = files.map((file, index) => {
      const filePath = `${basePath}/${file.name}`;
      return this.uploadFile(file, filePath, (progress) => {
        if (onProgress) {
          onProgress(index, progress);
        }
      });
    });

    return Promise.all(uploadPromises);
  }

  // Delete file
  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  }

  // Get file download URL
  async getDownloadURL(path: string): Promise<string> {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  }

  // Get file metadata
  async getFileMetadata(path: string): Promise<FileMetadata> {
    const storageRef = ref(storage, path);
    const metadata = await getMetadata(storageRef);
    const downloadURL = await getDownloadURL(storageRef);

    return {
      name: metadata.name,
      fullPath: metadata.fullPath,
      size: metadata.size,
      timeCreated: metadata.timeCreated,
      updated: metadata.updated,
      contentType: metadata.contentType,
      downloadURL
    };
  }

  // List files in a directory
  async listFiles(path: string): Promise<FileMetadata[]> {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);

    const filePromises = result.items.map(async (itemRef) => {
      const metadata = await getMetadata(itemRef);
      const downloadURL = await getDownloadURL(itemRef);

      return {
        name: metadata.name,
        fullPath: metadata.fullPath,
        size: metadata.size,
        timeCreated: metadata.timeCreated,
        updated: metadata.updated,
        contentType: metadata.contentType,
        downloadURL
      };
    });

    return Promise.all(filePromises);
  }

  // Company document upload helpers
  async uploadCompanyDocument(
    companyId: string,
    documentType: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const path = `company-documents/${companyId}/${documentType}_${Date.now()}_${file.name}`;
    return this.uploadFile(file, path, onProgress);
  }

  // Tender document upload helpers
  async uploadTenderDocument(
    tenderId: string,
    documentType: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const path = `tender-documents/${tenderId}/${documentType}_${Date.now()}_${file.name}`;
    return this.uploadFile(file, path, onProgress);
  }

  // Bid document upload helpers
  async uploadBidDocument(
    companyId: string,
    tenderId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const path = `bid-documents/${companyId}/${tenderId}/${Date.now()}_${file.name}`;
    return this.uploadFile(file, path, onProgress);
  }

  // Contract document upload helpers
  async uploadContractDocument(
    contractId: string,
    documentType: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const path = `contract-documents/${contractId}/${documentType}_${Date.now()}_${file.name}`;
    return this.uploadFile(file, path, onProgress);
  }

  // Get company documents
  async getCompanyDocuments(companyId: string): Promise<FileMetadata[]> {
    return this.listFiles(`company-documents/${companyId}`);
  }

  // Get tender documents
  async getTenderDocuments(tenderId: string): Promise<FileMetadata[]> {
    return this.listFiles(`tender-documents/${tenderId}`);
  }

  // Get bid documents
  async getBidDocuments(companyId: string, tenderId: string): Promise<FileMetadata[]> {
    return this.listFiles(`bid-documents/${companyId}/${tenderId}`);
  }

  // Get contract documents
  async getContractDocuments(contractId: string): Promise<FileMetadata[]> {
    return this.listFiles(`contract-documents/${contractId}`);
  }

  // Validate file type and size
  validateFile(file: File, allowedTypes: string[], maxSizeInMB: number = 10): boolean {
    // Check file type
    const fileType = file.type.toLowerCase();
    const isValidType = allowedTypes.some(type => 
      fileType.includes(type) || file.name.toLowerCase().endsWith(type)
    );

    if (!isValidType) {
      throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      throw new Error(`File size too large. Maximum size: ${maxSizeInMB}MB`);
    }

    return true;
  }

  // Validate document files (PDF, DOC, DOCX, JPG, PNG)
  validateDocumentFile(file: File): boolean {
    const allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
    return this.validateFile(file, allowedTypes, 10);
  }

  // Validate image files
  validateImageFile(file: File): boolean {
    const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    return this.validateFile(file, allowedTypes, 5);
  }

  // Generate file path helpers
  generateCompanyDocumentPath(companyId: string, documentType: string, fileName: string): string {
    return `company-documents/${companyId}/${documentType}_${Date.now()}_${fileName}`;
  }

  generateTenderDocumentPath(tenderId: string, documentType: string, fileName: string): string {
    return `tender-documents/${tenderId}/${documentType}_${Date.now()}_${fileName}`;
  }

  generateBidDocumentPath(companyId: string, tenderId: string, fileName: string): string {
    return `bid-documents/${companyId}/${tenderId}/${Date.now()}_${fileName}`;
  }

  generateContractDocumentPath(contractId: string, documentType: string, fileName: string): string {
    return `contract-documents/${contractId}/${documentType}_${Date.now()}_${fileName}`;
  }
}

export const storageService = new StorageService();
export default storageService;

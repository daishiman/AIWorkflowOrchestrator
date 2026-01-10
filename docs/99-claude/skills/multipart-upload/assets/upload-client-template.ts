/**
 * マルチパートアップロードクライアントテンプレート
 * 使用例: このテンプレートをプロジェクトに合わせてカスタマイズ
 */

import fs from "fs";
import FormData from "form-data";
import axios, { AxiosRequestConfig } from "axios";
import crypto from "crypto";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number;
  estimatedTime: number;
}

interface UploadOptions {
  url: string;
  filePath: string;
  chunkSize?: number;
  onProgress?: (progress: UploadProgress) => void;
  timeout?: number;
  maxRetries?: number;
}

/**
 * チェックサム計算
 */
async function calculateChecksum(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

/**
 * シンプル単一ファイルアップロード
 */
export async function uploadFile(options: UploadOptions): Promise<any> {
  const { url, filePath, onProgress, timeout = 60000 } = options;

  // チェックサム計算
  const checksum = await calculateChecksum(filePath);

  // FormData構築
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));
  formData.append("checksum", checksum);

  // アップロード
  const config: AxiosRequestConfig = {
    headers: formData.getHeaders(),
    timeout,
    onUploadProgress: (progressEvent: any) => {
      if (onProgress && progressEvent.total) {
        const progress: UploadProgress = {
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          percentage: (progressEvent.loaded / progressEvent.total) * 100,
          speed: 0, // TODO: 速度計算実装
          estimatedTime: 0, // TODO: 推定時間計算実装
        };
        onProgress(progress);
      }
    },
  };

  const response = await axios.post(url, formData, config);
  return response.data;
}

/**
 * チャンク分割アップロード
 */
export async function uploadFileChunked(options: UploadOptions): Promise<any> {
  const {
    url,
    filePath,
    chunkSize = 5 * 1024 * 1024,
    onProgress,
    timeout = 120000,
  } = options;

  const fileSize = fs.statSync(filePath).size;
  const totalChunks = Math.ceil(fileSize / chunkSize);

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, fileSize);
    const chunk = fs.createReadStream(filePath, { start, end: end - 1 });

    const formData = new FormData();
    formData.append("chunk", chunk);
    formData.append("chunkIndex", chunkIndex.toString());
    formData.append("totalChunks", totalChunks.toString());
    formData.append("fileSize", fileSize.toString());

    const config: AxiosRequestConfig = {
      headers: formData.getHeaders(),
      timeout,
    };

    await axios.post(url, formData, config);

    // 進捗通知
    if (onProgress) {
      const progress: UploadProgress = {
        loaded: end,
        total: fileSize,
        percentage: (end / fileSize) * 100,
        speed: 0,
        estimatedTime: 0,
      };
      onProgress(progress);
    }
  }
}

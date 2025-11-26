#!/usr/bin/env node
/**
 * マルチパートアップロード機能検証スクリプト
 * 使用方法: node validate-upload.mjs <file-path> <api-url>
 */

import fs from 'fs';
import crypto from 'crypto';

// チェックサム計算
function calculateChecksum(filePath) {
  const hash = crypto.createHash('sha256');
  const stream = fs.createReadStream(filePath);
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

// チャンクサイズ検証
function validateChunkSize(fileSize, chunkSize) {
  const minChunk = 1 * 1024 * 1024; // 1MB
  const maxChunk = 50 * 1024 * 1024; // 50MB

  if (chunkSize < minChunk) {
    console.warn(`⚠️  チャンクサイズが小さすぎます: ${chunkSize} bytes (推奨: ${minChunk}+ bytes)`);
    return false;
  }

  if (chunkSize > maxChunk) {
    console.warn(`⚠️  チャンクサイズが大きすぎます: ${chunkSize} bytes (推奨: ${maxChunk} bytes以下)`);
    return false;
  }

  console.log(`✅ チャンクサイズが適切です: ${chunkSize} bytes`);
  return true;
}

// メイン検証
async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('使用方法: node validate-upload.mjs <file-path>');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`❌ ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  const fileSize = fs.statSync(filePath).size;
  console.log(`📦 ファイルサイズ: ${fileSize} bytes (${(fileSize / (1024 * 1024)).toFixed(2)} MB)`);

  // チェックサム計算
  console.log('🔍 チェックサム計算中...');
  const checksum = await calculateChecksum(filePath);
  console.log(`✅ チェックサム (SHA-256): ${checksum}`);

  // 推奨チャンクサイズ
  let recommendedChunkSize;
  if (fileSize < 10 * 1024 * 1024) {
    recommendedChunkSize = fileSize;
    console.log('💡 推奨: チャンク分割不要（単一リクエスト）');
  } else if (fileSize < 100 * 1024 * 1024) {
    recommendedChunkSize = 5 * 1024 * 1024;
    console.log(`💡 推奨チャンクサイズ: 5MB`);
  } else {
    recommendedChunkSize = 10 * 1024 * 1024;
    console.log(`💡 推奨チャンクサイズ: 10MB`);
  }

  validateChunkSize(fileSize, recommendedChunkSize);

  const totalChunks = Math.ceil(fileSize / recommendedChunkSize);
  console.log(`📊 予想チャンク数: ${totalChunks}`);
}

main().catch(console.error);

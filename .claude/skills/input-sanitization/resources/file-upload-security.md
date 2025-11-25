# ファイルアップロードセキュリティ

## 概要

ファイルアップロード機能のセキュリティ対策ガイドです。
MIMEタイプ検証、ファイル名サニタイズ、パストラバーサル防止を解説します。

## リスク一覧

| リスク | 説明 | 対策 |
|-------|------|------|
| マルウェアアップロード | 実行可能ファイルのアップロード | MIMEタイプ検証、拡張子検証 |
| パストラバーサル | ファイル名に`../`を含め他のディレクトリに保存 | ファイル名サニタイズ |
| ファイルサイズ攻撃 | 巨大ファイルでディスク枯渇 | サイズ制限 |
| 同名ファイル上書き | 既存ファイルの上書き | ユニークファイル名生成 |
| 二重拡張子 | `file.jpg.exe`のような偽装 | 拡張子の厳格検証 |

## ファイル検証

### MIMEタイプ検証

```typescript
import { fileTypeFromBuffer } from 'file-type';

// ✅ マジックバイトで実際のファイルタイプを検証
async function validateFileType(
  buffer: Buffer,
  allowedTypes: string[]
): Promise<{ valid: boolean; mimeType: string | null }> {
  const fileType = await fileTypeFromBuffer(buffer);

  if (!fileType) {
    return { valid: false, mimeType: null };
  }

  return {
    valid: allowedTypes.includes(fileType.mime),
    mimeType: fileType.mime,
  };
}

// 使用例
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

async function validateImage(buffer: Buffer): Promise<boolean> {
  const result = await validateFileType(buffer, ALLOWED_IMAGE_TYPES);
  return result.valid;
}
```

### 拡張子検証

```typescript
import path from 'path';

// ✅ 拡張子の許可リスト
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx']);

function validateExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

// ✅ 二重拡張子の検出
function hasDoubleExtension(filename: string): boolean {
  const parts = filename.split('.');
  if (parts.length <= 2) return false;

  // 危険な実行可能拡張子のチェック
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.php', '.js', '.jar'];
  return parts.slice(1).some((part) =>
    dangerousExtensions.includes(`.${part.toLowerCase()}`)
  );
}

// ✅ 総合的な検証
function validateFilename(filename: string): { valid: boolean; error?: string } {
  if (!validateExtension(filename)) {
    return { valid: false, error: 'File extension not allowed' };
  }

  if (hasDoubleExtension(filename)) {
    return { valid: false, error: 'Double extension detected' };
  }

  return { valid: true };
}
```

### ファイルサイズ検証

```typescript
// ✅ サイズ制限の設定
const FILE_SIZE_LIMITS: Record<string, number> = {
  image: 5 * 1024 * 1024,     // 5MB
  document: 10 * 1024 * 1024,  // 10MB
  video: 100 * 1024 * 1024,    // 100MB
  default: 2 * 1024 * 1024,    // 2MB
};

function getMaxSize(fileType: string): number {
  if (fileType.startsWith('image/')) return FILE_SIZE_LIMITS.image;
  if (fileType.startsWith('video/')) return FILE_SIZE_LIMITS.video;
  if (fileType.includes('document') || fileType.includes('pdf')) {
    return FILE_SIZE_LIMITS.document;
  }
  return FILE_SIZE_LIMITS.default;
}

function validateFileSize(size: number, mimeType: string): boolean {
  const maxSize = getMaxSize(mimeType);
  return size <= maxSize;
}
```

## ファイル名サニタイズ

### 安全なファイル名生成

```typescript
import crypto from 'crypto';
import path from 'path';

// ✅ ユニークなファイル名を生成
function generateSafeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${random}${ext}`;
}

// ✅ オリジナルファイル名をサニタイズ
function sanitizeFilename(filename: string): string {
  // 危険な文字を除去
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // 英数字とアンダースコア、ハイフン、ドットのみ
    .replace(/\.{2,}/g, '.')            // 連続ドットを単一に
    .replace(/^\.+|\.+$/g, '')          // 先頭・末尾のドットを除去
    .substring(0, 255);                 // 長さ制限
}

// ✅ パストラバーサル防止
function sanitizePath(userPath: string, baseDir: string): string {
  const normalizedBase = path.resolve(baseDir);
  const sanitizedName = sanitizeFilename(path.basename(userPath));
  const fullPath = path.join(normalizedBase, sanitizedName);

  // ベースディレクトリ外への移動を防止
  if (!fullPath.startsWith(normalizedBase + path.sep)) {
    throw new Error('Invalid file path');
  }

  return fullPath;
}
```

## Express.jsでの実装

### Multer設定

```typescript
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// ✅ 安全なストレージ設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/app/uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, uniqueName);
  },
});

// ✅ ファイルフィルター
const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

// ✅ Multerインスタンス
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5MB
    files: 5,                   // 最大5ファイル
  },
});

// ✅ ルートハンドラー
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // マジックバイト検証
  const buffer = await fs.promises.readFile(req.file.path);
  const isValid = await validateImage(buffer);

  if (!isValid) {
    await fs.promises.unlink(req.file.path);
    return res.status(400).json({ error: 'Invalid file content' });
  }

  res.json({
    filename: req.file.filename,
    size: req.file.size,
  });
});
```

### メモリストレージ（検証後保存）

```typescript
// ✅ メモリに一時保存して検証後にディスクへ
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.post('/upload', memoryUpload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // バッファで検証
  const isValid = await validateImage(req.file.buffer);
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid file content' });
  }

  // 検証後にディスクへ保存
  const filename = generateSafeFilename(req.file.originalname);
  const filepath = path.join('/app/uploads', filename);
  await fs.promises.writeFile(filepath, req.file.buffer);

  res.json({ filename });
});
```

## 画像処理

### 画像の再処理（サニタイズ）

```typescript
import sharp from 'sharp';

// ✅ 画像を再処理してメタデータと潜在的な脅威を除去
async function sanitizeImage(
  inputBuffer: Buffer,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<Buffer> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 80 } = options;

  return sharp(inputBuffer)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality })  // JPEGに変換してメタデータを除去
    .toBuffer();
}

// ✅ EXIFデータの除去
async function removeExifData(inputBuffer: Buffer): Promise<Buffer> {
  return sharp(inputBuffer)
    .rotate()  // EXIF回転を適用
    .toBuffer();
}
```

### SVGのサニタイズ

```typescript
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

// ✅ SVGのサニタイズ（XSS防止）
function sanitizeSvg(svgContent: string): string {
  const window = new JSDOM('').window;
  const purify = DOMPurify(window);

  return purify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ['script', 'style'],
    FORBID_ATTR: ['onload', 'onerror', 'onclick'],
  });
}
```

## クラウドストレージ

### AWS S3への安全なアップロード

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: 'ap-northeast-1' });

// ✅ 署名付きURLでアップロード
async function getUploadUrl(
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; key: string }> {
  const key = `uploads/${Date.now()}-${crypto.randomBytes(8).toString('hex')}/${sanitizeFilename(filename)}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  return { uploadUrl, key };
}

// ✅ サーバーサイドアップロード
async function uploadToS3(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const key = `uploads/${Date.now()}-${crypto.randomBytes(8).toString('hex')}/${sanitizeFilename(filename)}`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // セキュリティヘッダー
    ContentDisposition: 'attachment',  // ダウンロード強制
  }));

  return key;
}
```

## ウイルススキャン

### ClamAVとの統合

```typescript
import NodeClam from 'clamscan';

const clamav = new NodeClam();

// ✅ ウイルススキャン
async function scanFile(filepath: string): Promise<{
  isInfected: boolean;
  viruses: string[];
}> {
  await clamav.init({
    removeInfected: false,
    scanLog: '/var/log/clamscan.log',
  });

  const { isInfected, viruses } = await clamav.scanFile(filepath);

  return { isInfected, viruses };
}

// ✅ アップロード処理に統合
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // ウイルススキャン
  const scanResult = await scanFile(req.file.path);
  if (scanResult.isInfected) {
    await fs.promises.unlink(req.file.path);
    return res.status(400).json({
      error: 'File contains malware',
      viruses: scanResult.viruses,
    });
  }

  res.json({ filename: req.file.filename });
});
```

## チェックリスト

### 検証
- [ ] MIMEタイプをマジックバイトで検証しているか？
- [ ] 拡張子を許可リストで検証しているか？
- [ ] ファイルサイズを制限しているか？
- [ ] 二重拡張子をチェックしているか？

### サニタイズ
- [ ] ファイル名をサニタイズしているか？
- [ ] パストラバーサルを防止しているか？
- [ ] 画像からメタデータを除去しているか？

### ストレージ
- [ ] アップロードディレクトリをWebルート外に配置しているか？
- [ ] 適切なファイル権限を設定しているか？
- [ ] ウイルススキャンを実装しているか？

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース |

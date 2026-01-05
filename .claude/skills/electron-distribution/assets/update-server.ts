/**
 * カスタム更新サーバーテンプレート
 *
 * S3などのストレージと連携する更新サーバーの実装例
 */

import express from "express";
import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import semver from "semver";

// =====================================
// 設定
// =====================================

const app = express();
const PORT = process.env.PORT || 3000;

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

const BUCKET = process.env.S3_BUCKET || "your-app-releases";
const SIGNED_URL_EXPIRY = 60 * 60; // 1時間

// =====================================
// 型定義
// =====================================

interface ReleaseInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
  files: {
    url: string;
    sha512: string;
    size: number;
  }[];
}

interface VersionMetadata {
  version: string;
  platform: string;
  arch: string;
  filename: string;
  sha512: string;
  size: number;
  releaseDate: string;
  releaseNotes?: string;
}

// =====================================
// ヘルパー関数
// =====================================

/**
 * S3から最新バージョンを取得
 */
async function getLatestVersion(
  platform: string,
): Promise<VersionMetadata | null> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: `releases/${platform}/`,
    });

    const response = await s3.send(command);
    const versions: string[] = [];

    response.Contents?.forEach((obj) => {
      const match = obj.Key?.match(/releases\/[^/]+\/([^/]+)\//);
      if (match) {
        const version = match[1];
        if (semver.valid(version)) {
          versions.push(version);
        }
      }
    });

    if (versions.length === 0) return null;

    // 最新バージョンを取得
    const latestVersion = versions.sort(semver.rcompare)[0];

    // メタデータを取得
    const metadataCommand = new GetObjectCommand({
      Bucket: BUCKET,
      Key: `releases/${platform}/${latestVersion}/metadata.json`,
    });

    const metadataResponse = await s3.send(metadataCommand);
    const metadataString = await metadataResponse.Body?.transformToString();

    if (!metadataString) return null;

    return JSON.parse(metadataString) as VersionMetadata;
  } catch (error) {
    console.error("Error getting latest version:", error);
    return null;
  }
}

/**
 * 署名付きダウンロードURLを生成
 */
async function getDownloadUrl(
  platform: string,
  version: string,
  filename: string,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: `releases/${platform}/${version}/${filename}`,
  });

  return getSignedUrl(s3, command, { expiresIn: SIGNED_URL_EXPIRY });
}

/**
 * リリースノートを取得
 */
async function getReleaseNotes(version: string): Promise<string | undefined> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: `releases/notes/${version}.md`,
    });

    const response = await s3.send(command);
    return response.Body?.transformToString();
  } catch {
    return undefined;
  }
}

// =====================================
// エンドポイント
// =====================================

/**
 * 更新確認エンドポイント
 * electron-updater が呼び出す
 */
app.get("/update/:platform/:currentVersion", async (req, res) => {
  const { platform, currentVersion } = req.params;

  console.log(`Update check: platform=${platform}, version=${currentVersion}`);

  try {
    const latestMetadata = await getLatestVersion(platform);

    if (!latestMetadata) {
      console.log("No releases found");
      return res.status(204).send();
    }

    // 現在のバージョンが最新か確認
    if (!semver.gt(latestMetadata.version, currentVersion)) {
      console.log("Already up to date");
      return res.status(204).send();
    }

    // ダウンロードURLを生成
    const downloadUrl = await getDownloadUrl(
      platform,
      latestMetadata.version,
      latestMetadata.filename,
    );

    // リリースノートを取得
    const releaseNotes = await getReleaseNotes(latestMetadata.version);

    const response: ReleaseInfo = {
      version: latestMetadata.version,
      releaseDate: latestMetadata.releaseDate,
      releaseNotes,
      files: [
        {
          url: downloadUrl,
          sha512: latestMetadata.sha512,
          size: latestMetadata.size,
        },
      ],
    };

    console.log(`Update available: ${latestMetadata.version}`);
    res.json(response);
  } catch (error) {
    console.error("Update check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * ダウンロードエンドポイント
 * ファイルの直接ダウンロード
 */
app.get("/download/:platform/:version/:filename", async (req, res) => {
  const { platform, version, filename } = req.params;

  console.log(
    `Download: platform=${platform}, version=${version}, file=${filename}`,
  );

  try {
    const downloadUrl = await getDownloadUrl(platform, version, filename);
    res.redirect(downloadUrl);
  } catch (error) {
    console.error("Download error:", error);
    res.status(404).json({ error: "File not found" });
  }
});

/**
 * リリースノートエンドポイント
 */
app.get("/releases/:version/notes", async (req, res) => {
  const { version } = req.params;

  try {
    const notes = await getReleaseNotes(version);
    if (notes) {
      res.type("text/markdown").send(notes);
    } else {
      res.status(404).json({ error: "Release notes not found" });
    }
  } catch (error) {
    console.error("Release notes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * ヘルスチェック
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// =====================================
// サーバー起動
// =====================================

app.listen(PORT, () => {
  console.log(`Update server running on port ${PORT}`);
});

// =====================================
// electron-builder設定例
// =====================================

/*
# electron-builder.yml
publish:
  - provider: generic
    url: https://your-update-server.com/update

# または環境変数で指定
# ELECTRON_UPDATER_UPDATE_URL=https://your-update-server.com/update
*/

// =====================================
// S3バケット構造
// =====================================

/*
your-app-releases/
├── releases/
│   ├── darwin/
│   │   └── 1.2.3/
│   │       ├── Your-App-1.2.3-mac.dmg
│   │       ├── Your-App-1.2.3-mac.zip
│   │       └── metadata.json
│   ├── win32/
│   │   └── 1.2.3/
│   │       ├── Your-App-1.2.3-win.exe
│   │       └── metadata.json
│   └── linux/
│       └── 1.2.3/
│           ├── Your-App-1.2.3.AppImage
│           └── metadata.json
└── notes/
    ├── 1.2.3.md
    ├── 1.2.2.md
    └── 1.2.1.md
*/

// =====================================
// メタデータファイル例
// =====================================

/*
// metadata.json
{
  "version": "1.2.3",
  "platform": "darwin",
  "arch": "x64",
  "filename": "Your-App-1.2.3-mac.dmg",
  "sha512": "base64-encoded-sha512-hash",
  "size": 98765432,
  "releaseDate": "2024-01-15T10:30:00.000Z",
  "channel": "stable"
}
*/

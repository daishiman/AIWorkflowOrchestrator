# fix-macos-build-ci - 実装ガイド

## メタ情報

| 項目     | 内容                                  |
| -------- | ------------------------------------- |
| 機能名   | GitHub Actions macOS ビルドエラー修正 |
| 作成日   | 2026-01-13                            |
| 対象読者 | 開発者・DevOpsエンジニア・学習者      |

---

# Part 1: 概念的な説明（中学生でもわかる版）

## 1. この修正って何？

### 1.1 身近な例で考えてみよう

**比喩**: macOS のアプリを配布するには「箱詰め」が必要です。

```
DMG（ディスクイメージ）= きれいな化粧箱
┌─────────────────────────────────┐
│  「アプリをApplicationsに     │
│    ドラッグしてね」の説明付き  │
│  ┌───────┐        ┌──────────┐ │
│  │ App  │───────→│Applications│
│  └───────┘        └──────────┘ │
└─────────────────────────────────┘

ZIP（圧縮ファイル）= シンプルな段ボール箱
┌─────────────────────────────────┐
│  解凍するだけでアプリが使える   │
│  ┌───────┐                     │
│  │ App  │                     │
│  └───────┘                     │
└─────────────────────────────────┘
```

### 1.2 何が問題だったの？

GitHub Actions（クラウド上のロボット）は、化粧箱（DMG）を作る特殊な道具（`hdiutil`）を**使えない**のです。

```
ローカルMac:
┌────────────────────┐
│ hdiutil コマンド   │ ← 実機なので使える！
│ DMG作成可能 ✅     │
└────────────────────┘

GitHub Actions (macos-14 runner):
┌────────────────────┐
│ 仮想化環境         │ ← Apple Siliconの制限
│ hdiutil 使用不可 ❌ │
│ "Device not       │
│  configured"       │
└────────────────────┘
```

### 1.3 どうやって解決したの？

**解決策**: CIでは段ボール箱（ZIP）だけを作ることにしました！

| 配布方法 | 化粧箱（DMG） | 段ボール（ZIP） |
| -------- | ------------- | --------------- |
| 見た目   | おしゃれ      | シンプル        |
| 機能     | 同じ          | 同じ            |
| CI対応   | ❌            | ✅              |

---

## 2. どうやって直したの？

### 2.1 変更の全体像

```
Before（修正前）:
┌─────────────────────────┐
│ electron-builder.yml    │
│ ┌─────────────────────┐ │
│ │ mac:                │ │
│ │   target:           │ │
│ │     - dmg ←エラー原因│ │
│ │     - zip           │ │
│ └─────────────────────┘ │
└─────────────────────────┘
         ↓
         ↓ 4行削除
         ↓
After（修正後）:
┌─────────────────────────┐
│ electron-builder.yml    │
│ ┌─────────────────────┐ │
│ │ mac:                │ │
│ │   target:           │ │
│ │     - zip ←これだけ │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### 2.2 なぜこの解決策？

| 選択肢       | メリット             | デメリット | 採用 |
| ------------ | -------------------- | ---------- | ---- |
| ZIPのみ      | 確実に動く、シンプル | DMGがない  | ✅   |
| 別ツール導入 | DMGが作れる          | 設定が複雑 | ❌   |
| 専用マシン   | 完全な機能           | コスト高   | ❌   |

**判断理由**: 最小限の変更で問題解決 + ZIPでも十分機能する

---

## 3. 影響範囲

```
変更したファイル（1つだけ）:
apps/desktop/electron-builder.yml
         │
         ↓ 影響
┌─────────────────────────────────┐
│ GitHub Actions CI               │
│ ├── build-macos-arm64 ✅ 成功   │
│ ├── build-macos-x64   ✅ 成功   │
│ └── その他ジョブ      変更なし  │
└─────────────────────────────────┘
         │
         ↓ 影響なし
┌─────────────────────────────────┐
│ ローカル開発                    │
│ DMG作成は引き続き可能           │
│ （electron-builderのCLIで指定） │
└─────────────────────────────────┘
```

---

# Part 2: 技術的な詳細（開発者向け）

## 1. 問題の技術的背景

### 1.1 エラー内容

```
hdiutil: create failed - Device not configured
```

### 1.2 発生条件

| 条件             | 値                          |
| ---------------- | --------------------------- |
| Runner           | macos-14 (Apple Silicon)    |
| electron-builder | v26.0.0                     |
| ビルドターゲット | DMG                         |
| 原因             | 仮想化環境での hdiutil 制限 |

### 1.3 技術的原因

```
GitHub Actions macos-14 runner:
┌────────────────────────────────────┐
│ Apple Silicon 仮想化環境           │
│ ┌────────────────────────────────┐ │
│ │ hdiutil create                 │ │
│ │   ↓                            │ │
│ │ DiskImages framework           │ │
│ │   ↓                            │ │
│ │ IOKit デバイス接続 ← 制限あり  │ │
│ │   ↓                            │ │
│ │ "Device not configured"        │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

---

## 2. 実装内容

### 2.1 変更ファイル

```
apps/desktop/electron-builder.yml
```

### 2.2 変更差分

```yaml
# Before: DMG + ZIP
mac:
  target:
    - target: dmg          # ← 削除
      arch:                # ← 削除
        - x64              # ← 削除
        - arm64            # ← 削除
    - target: zip
      arch:
        - x64
        - arm64

# After: ZIP only
mac:
  target:
    - target: zip
      arch:
        - x64
        - arm64
```

### 2.3 設計判断の根拠

| 設計判断         | 選択肢           | 採用理由                                     |
| ---------------- | ---------------- | -------------------------------------------- |
| ターゲット形式   | ZIP only         | CI環境での確実な動作を優先                   |
| DMGセクション    | 削除せず残す     | 将来のリリースワークフローで再有効化の可能性 |
| アーキテクチャ   | x64 + arm64 維持 | 両アーキテクチャのユニバーサル対応           |
| ワークフロー変更 | 不要             | `if-no-files-found: warn` で欠落を許容済み   |

---

## 3. CI/CD影響

### 3.1 ワークフロー構成

```
.github/workflows/build-electron.yml
├── build-shared        # 共通ビルド
├── build-macos-x64     # macOS Intel
├── build-macos-arm64   # macOS Apple Silicon ← 修正対象
├── build-windows       # Windows
└── build-linux         # Linux
```

### 3.2 ビルド成果物

| ジョブ            | Before                 | After            |
| ----------------- | ---------------------- | ---------------- |
| build-macos-arm64 | DMG + ZIP（失敗）      | ZIP のみ（成功） |
| build-macos-x64   | DMG + ZIP（成功/失敗） | ZIP のみ（成功） |
| その他            | 変更なし               | 変更なし         |

### 3.3 アーティファクト

```yaml
# ワークフローのアップロード設定（変更なし）
- uses: actions/upload-artifact@v4
  with:
    name: electron-macos-arm64
    path: apps/desktop/dist/*.{dmg,zip} # DMGは生成されないが問題なし
    if-no-files-found: warn # ← warnなので失敗しない
```

---

## 4. 検証方法

### 4.1 ローカル検証

```bash
# YAMLの構文チェック
yamllint apps/desktop/electron-builder.yml

# ビルド試行（ZIPのみ）
cd apps/desktop
pnpm electron:build --mac --arm64
```

### 4.2 CI検証（PR作成後）

```bash
# ワークフロー実行確認
gh run list --workflow=build-electron.yml --limit=1

# 実行詳細
gh run view <run-id>

# アーティファクト確認
gh run view <run-id> --json artifacts
```

---

## 5. 将来の対応

### 5.1 リリース時のDMG生成

```yaml
# リリースワークフローでの対応案
# .github/workflows/release-electron.yml（将来作成）
jobs:
  release:
    runs-on: macos-latest # または self-hosted runner
    steps:
      - name: Build with DMG
        run: |
          # ローカル環境またはself-hosted runnerでDMG生成
          pnpm electron:build --mac --dmg
```

### 5.2 代替案（将来検討）

| 方法               | 説明                           | コスト |
| ------------------ | ------------------------------ | ------ |
| Self-hosted runner | 自前のMacマシンでビルド        | 高     |
| appdmg             | hdiutilを使わないDMG生成ツール | 中     |
| create-dmg         | Node.js製DMG作成ツール         | 中     |

---

## 6. 用語集

このセクションでは、本実装で使用した技術用語を説明する。

| 用語             | 読み方                     | 説明                                                                            |
| ---------------- | -------------------------- | ------------------------------------------------------------------------------- |
| DMG              | ディーエムジー             | Disk Image。macOSのアプリ配布形式。仮想ディスクイメージ                         |
| hdiutil          | エイチディーアイユーティル | macOSのディスクイメージ操作コマンド。DMG作成に使用                              |
| electron-builder | エレクトロンビルダー       | Electronアプリのビルド・パッケージングツール                                    |
| GitHub Actions   | ギットハブアクションズ     | GitHub提供のCI/CDサービス。自動ビルド・テストを実行                             |
| macos-14 runner  | マックオーエス14ランナー   | GitHub ActionsのApple Silicon対応仮想マシン環境                                 |
| ZIP              | ジップ                     | 圧縮ファイル形式。macOSアプリの配布にも使用可能                                 |
| CI/CD            | シーアイシーディー         | Continuous Integration/Continuous Delivery。継続的インテグレーション/デリバリー |
| Apple Silicon    | アップルシリコン           | Apple製のARMベースプロセッサ（M1, M2, M3など）                                  |
| x64              | エックス64                 | Intel 64ビットアーキテクチャ                                                    |
| arm64            | アームロクジュウヨン       | ARM 64ビットアーキテクチャ（Apple Siliconで使用）                               |
| Artifact         | アーティファクト           | CIの成果物。ビルドされたバイナリやログなど                                      |
| YAML             | ヤムル                     | Yet Another Markup Language。設定ファイル形式                                   |

---

## 7. 参考資料

| 資料                   | URL/パス                                                       |
| ---------------------- | -------------------------------------------------------------- |
| electron-builder docs  | https://www.electron.build/                                    |
| GitHub Actions runners | https://docs.github.com/en/actions/using-github-hosted-runners |
| 関連Issue              | #212, #230                                                     |
| 設計書                 | `outputs/phase-2/modification-design.md`                       |

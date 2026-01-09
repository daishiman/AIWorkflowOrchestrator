# スコープ定義 - スライド依存関係管理システム

## 1. ドキュメント情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | task-feat-slide-dependency-management-003 |
| バージョン | 1.0.0                                     |
| 作成日     | 2026-01-09                                |
| 作成者     | Claude (event-driven-file-watching skill) |

---

## 2. スコープ概要

### 2.1 目的

本システムは、プレゼンテーションスライド作成ワークフローにおいて、structure.md（構造データ）とindex.html（プレゼンテーションファイル）の依存関係を自動管理し、4つのスキルフェーズをシームレスに呼び出せる機能を提供する。

### 2.2 対象範囲

**In Scope（スコープ内）**:

1. structure.mdとindex.htmlのファイル監視機能
2. ファイル変更検知時の自動同期トリガー
3. 4つのスキルフェーズ（hearing, structure, html, modifier）の呼び出し機能
4. 同期状態のUI表示とインタラクション
5. 手動同期機能
6. スキル実行の進捗表示とキャンセル機能

**Out of Scope（スコープ外）**:

1. スキル自体の実装（既存のpresentation-slide-generatorスキルを利用）
2. プレゼンテーションのプレビュー機能
3. マルチユーザー同時編集対応
4. クラウドストレージ連携
5. バージョン管理（Git連携等）
6. プロジェクトのエクスポート機能

---

## 3. ファイル監視要件（event-driven-file-watching）

### 3.1 監視対象

| ファイル     | 監視イベント   | トリガーアクション     | デバウンス |
| ------------ | -------------- | ---------------------- | ---------- |
| structure.md | change         | html-generator自動実行 | 500ms      |
| structure.md | unlink（削除） | 警告表示               | -          |
| index.html   | change         | 同期状態チェック       | 500ms      |
| index.html   | unlink（削除） | 「未生成」状態に更新   | -          |

### 3.2 監視設定（Chokidar Configuration）

```typescript
interface WatcherConfig {
  // 永続的な監視を有効化
  persistent: true;

  // 初回スキャンの変更イベントを無視
  ignoreInitial: true;

  // 書き込み完了を待機する設定
  awaitWriteFinish: {
    stabilityThreshold: 500; // 500ms安定したら完了とみなす
    pollInterval: 100; // 100ms間隔でチェック
  };

  // 除外パターン
  ignored: [
    "**/node_modules/**",
    "**/.git/**",
    "**/.DS_Store",
    "**/Thumbs.db",
    "**/*.tmp",
    "**/*.bak",
  ];

  // クロスプラットフォーム対応
  usePolling: false; // ネイティブイベントを優先
  interval: 100; // ポーリング時の間隔（フォールバック用）

  // 安定性設定
  atomic: true; // アトミック書き込み対応
  alwaysStat: false; // 必要時のみstat取得
}
```

### 3.3 イベントフロー

```
┌─────────────────┐
│ File System     │
│ (structure.md)  │
└────────┬────────┘
         │ change event
         ▼
┌─────────────────┐
│ Chokidar        │
│ Watcher         │
└────────┬────────┘
         │ debounced event (500ms)
         ▼
┌─────────────────┐
│ Change Context  │
│ Validator       │──────┐ source === 'skill'
└────────┬────────┘      │
         │ source === 'user'  ▼ Skip
         ▼               ┌─────────────┐
┌─────────────────┐      │ No Action   │
│ Event Emitter   │      └─────────────┘
└────────┬────────┘
         │ IPC event
         ▼
┌─────────────────┐
│ Renderer        │
│ (UI Update)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Skill Executor  │
│ (html-generator)│
└─────────────────┘
```

### 3.4 変更コンテキスト管理

```typescript
// 変更元を識別するためのコンテキスト
interface ChangeContext {
  source: "user" | "skill" | "unknown";
  timestamp: number;
  skillPhase?: SkillPhase;
}

// コンテキストマップ（パス → コンテキスト）
const changeContextMap = new Map<string, ChangeContext>();

// スキル実行開始時にコンテキストを設定
const markAsSkillChange = (path: string, phase: SkillPhase): void => {
  changeContextMap.set(path, {
    source: "skill",
    timestamp: Date.now(),
    skillPhase: phase,
  });
};

// 変更イベント発生時の判定
const shouldTriggerRegeneration = (path: string): boolean => {
  const context = changeContextMap.get(path);
  if (!context) return true;

  // スキルによる変更かつ1秒以内なら無視
  if (context.source === "skill") {
    const elapsed = Date.now() - context.timestamp;
    if (elapsed < 1000) {
      changeContextMap.delete(path); // コンテキストをクリア
      return false;
    }
  }

  return true;
};
```

---

## 4. システム境界

### 4.1 システムコンテキスト図

```
                    ┌─────────────────────────────────────────────┐
                    │         スライド依存関係管理システム           │
                    │                                             │
┌─────────┐         │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│ ユーザー │ ────────▶ │ UI Layer │ │ File     │ │ Skill    │  │
│         │ ◀──────── │          │ │ Watcher  │ │ Executor │  │
└─────────┘         │  └──────────┘  └──────────┘  └──────────┘  │
                    │         │            │            │         │
                    │         ▼            ▼            ▼         │
                    │  ┌─────────────────────────────────────┐   │
                    │  │           State Manager              │   │
                    │  │         (Zustand Store)              │   │
                    │  └─────────────────────────────────────┘   │
                    │                     │                       │
                    └─────────────────────┼───────────────────────┘
                                          │
                    ┌─────────────────────┼───────────────────────┐
                    │         外部システム │                       │
                    │                     ▼                       │
                    │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
                    │  │ File     │  │ Claude   │  │ Electron │  │
                    │  │ System   │  │ Agent SDK│  │ IPC      │  │
                    │  └──────────┘  └──────────┘  └──────────┘  │
                    └─────────────────────────────────────────────┘
```

### 4.2 外部インターフェース

| インターフェース | 種別       | 説明                            |
| ---------------- | ---------- | ------------------------------- |
| Claude Agent SDK | API        | スキル実行のためのSDK呼び出し   |
| Electron IPC     | 通信       | Main-Renderer間のプロセス間通信 |
| File System      | I/O        | ファイルの読み書きと監視        |
| chokidar         | ライブラリ | ファイルシステム監視            |
| Zustand          | ライブラリ | 状態管理                        |

---

## 5. 前提条件

### 5.1 技術的前提

| 前提条件               | 説明                                      |
| ---------------------- | ----------------------------------------- |
| Electron環境           | Electron 28+でのMain/Rendererプロセス構成 |
| Node.js 18+            | ESM対応、fs/promises API使用              |
| TypeScript strict mode | 厳密な型チェック有効                      |
| pnpm monorepo          | @repo/desktop, @repo/shared構成           |

### 5.2 依存タスク

| タスクID                               | 内容                     | 状態 |
| -------------------------------------- | ------------------------ | ---- |
| task-feat-agent-sdk-integration-001    | Claude Agent SDK統合基盤 | 必須 |
| task-feat-slide-directory-settings-002 | 出力ディレクトリ設定機能 | 必須 |

### 5.3 既存スキル依存

| スキル              | 用途                 |
| ------------------- | -------------------- |
| hearing-facilitator | ヒアリングフェーズ   |
| structure-designer  | 構成設計フェーズ     |
| html-generator      | HTML生成フェーズ     |
| slide-modifier      | スライド修正フェーズ |

---

## 6. 制約事項

### 6.1 技術的制約

| 制約                 | 詳細                                        | 影響                     |
| -------------------- | ------------------------------------------- | ------------------------ |
| Electronプロセス分離 | MainプロセスでのみNode.js APIにアクセス可能 | IPC通信必須              |
| IPC設計準拠          | 既存のIPC設計パターンに従う必要がある       | 設計の柔軟性制限         |
| シングルプロジェクト | 同時に1つのプロジェクトのみ監視可能         | マルチプロジェクト非対応 |

### 6.2 運用制約

| 制約                 | 詳細                                   |
| -------------------- | -------------------------------------- |
| ローカルファイルのみ | クラウドストレージ上のファイルは非対応 |
| 同期実行のみ         | バックグラウンド実行は将来拡張         |

---

## 7. 除外事項の詳細

### 7.1 プレビュー機能

**除外理由**: プレゼンテーションのプレビューは別機能として実装予定。本タスクはファイル管理とスキル呼び出しに専念する。

### 7.2 マルチユーザー対応

**除外理由**: 初期バージョンではシングルユーザーのローカル操作に限定。将来的なコラボレーション機能は別タスクで検討。

### 7.3 バージョン管理

**除外理由**: Git連携やバージョン履歴管理は本システムのスコープ外。ユーザーは外部ツールでバージョン管理を行う想定。

---

## 8. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                               |
| -------------------------------- | ------ | -------- | ---------------------------------- |
| ファイルウォッチャーの無限ループ | 高     | 中       | デバウンス処理、変更元の識別       |
| スキル実行の長時間化             | 中     | 中       | 進捗表示、キャンセル機能           |
| 大量ファイル監視のパフォーマンス | 中     | 低       | 監視対象の制限、ポーリング間隔調整 |
| スキル実行中のファイル変更       | 中     | 中       | ロック機構、キュー管理             |
| プラットフォーム間の動作差異     | 中     | 中       | クロスプラットフォームテスト       |

---

## 9. 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-09 | 初版作成 |

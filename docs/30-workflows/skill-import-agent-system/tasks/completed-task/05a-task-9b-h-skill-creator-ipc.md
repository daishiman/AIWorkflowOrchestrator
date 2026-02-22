# SkillCreatorService IPC登録 - タスク指示書

## メタ情報

| 項目         | 内容                                   |
| ------------ | -------------------------------------- |
| タスクID     | TASK-9B-H-SKILL-CREATOR-IPC            |
| タスク名     | SkillCreatorServiceのIPCハンドラー登録 |
| 分類         | 機能接続                               |
| 対象機能     | スキル作成（skill-creator メタスキル） |
| 優先度       | 高                                     |
| 見積もり規模 | 中規模                                 |
| ステータス   | 未実施                                 |
| 実行順序     | 05a（並列可能 — 04完了後）             |
| 発見元       | skill-system-conflict-report #2        |
| 発見日       | 2026-02-05                             |
| 関連Phase    | Phase 3（Tier 2 機能接続）             |
| 関連Issue    | Issue #692                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`technical-decisions.md` §11 で skill-creator メタスキルの設計が定義済み。その実装体である `SkillCreatorService`（459行）は完成しているが、`skillHandlers.ts` にimportすら存在せず、IPC経由で Renderer から到達できない。

### 1.2 問題点・課題

| 問題                                | 影響                                   |
| ----------------------------------- | -------------------------------------- |
| SkillCreatorService が IPC に未登録 | スキル作成機能が Renderer から利用不可 |
| IPC チャンネルが未定義              | 呼び出すチャンネル自体が存在しない     |
| skillHandlers.ts に import がない   | 459行のコードが完全に到達不能          |

**設計で想定されるIPCチャンネル**:

| チャンネル（想定）          | 用途           | 設計参照 |
| --------------------------- | -------------- | -------- |
| `skill-creator:create`      | スキル新規作成 | §11.4    |
| `skill-creator:progress`    | 作成進捗通知   | §18.3    |
| `skill-creator:validate`    | バリデーション | §11.3    |
| `skill-creator:detect-mode` | 作成モード検出 | §15.3    |

### 1.3 放置した場合の影響

- スキル作成UIが機能しない
- 459行の実装済みコードが無駄
- Tier 2 以降のタスクがブロック

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillCreatorService を IPC ハンドラーに登録し、Renderer からスキル作成機能を利用可能にする。

### 2.2 最終ゴール

1. SkillCreatorService 用の IPC チャンネルが定義されている
2. 全チャンネルのハンドラーが登録されている
3. Preload API にスキル作成用メソッドが追加されている
4. Renderer からスキル作成フローが実行可能

### 2.3 スコープ

#### 含むもの

- IPC チャンネル定義（`channels.ts`）
- IPC ハンドラー登録（`skillHandlers.ts` または新規ファイル）
- Preload API 拡張
- ホワイトリスト登録

#### 含まないもの

- SkillCreatorService 内部ロジックの変更
- スキル作成UI（別タスクで対応）

### 2.4 成果物

| 成果物             | 説明                               |
| ------------------ | ---------------------------------- |
| IPC チャンネル定義 | skill-creator 用チャンネル追加     |
| IPC ハンドラー     | SkillCreatorService のメソッド接続 |
| Preload API 拡張   | skillCreator API ブリッジ          |
| テスト             | ハンドラーの動作検証               |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-1-1-TYPE-ALIGNMENT 完了（型定義統一）
- Layer 3（#7）完了（実行基盤が動作）

### 3.2 依存タスク

- TASK-FIX-1-1-TYPE-ALIGNMENT（完了済み）
- TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION（実行基盤）

### 3.3 必要な知識

- SkillCreatorService のパブリック API
- IPC チャンネル定義パターン
- Preload contextBridge パターン

### 3.4 推奨アプローチ

1. SkillCreatorService のパブリックメソッドを分析
2. 設計書 §11 に基づいてチャンネル定義
3. `withValidation()` ラッパーでハンドラー登録
4. Preload API にブリッジ追加

---

## 4. 実行手順

### Step 1: SkillCreatorService API 分析

#### 手順

1. `SkillCreatorService` のパブリックメソッドをリストアップ
2. 設計書 §11 の想定チャンネルとマッピング
3. 引数・戻り値の型を確認

### Step 2: IPC チャンネル定義

#### 手順

1. `preload/channels.ts` に SKILL_CREATOR 系チャンネルを追加
2. `ALLOWED_INVOKE_CHANNELS` にホワイトリスト登録
3. 必要に応じて `ALLOWED_ON_CHANNELS` にも登録（進捗通知用）

### Step 3: ハンドラー登録

#### 手順

1. `skillCreatorHandlers.ts` を新規作成（SRP: skillHandlers.ts とは分離）
2. 各チャンネルのハンドラーを `withValidation()` で登録
3. SkillCreatorService のインスタンスを注入

### Step 4: Preload API 拡張

#### 手順

1. `skill-api.ts` または新規ファイルに skillCreator API を追加
2. `safeInvoke` / `safeOn` でブリッジ実装

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] skill-creator 用 IPC チャンネルが定義されている
- [ ] 全チャンネルのハンドラーが登録されている
- [ ] ホワイトリストに登録されている
- [ ] Preload API からアクセス可能

### 品質要件

- [ ] 全テストが PASS
- [ ] `withValidation()` ラッパーで登録
- [ ] 型安全性が確保されている

---

## 6. 検証方法

### テストケース

1. skill-creator:create → SkillCreatorService.create() が呼ばれる
2. skill-creator:validate → バリデーション結果が返る
3. 未登録チャンネルへのアクセス → 適切なエラー
4. 進捗通知の受信確認

---

## 7. リスクと対策

| リスク                            | 影響度 | 発生確率 | 対策                                   |
| --------------------------------- | ------ | -------- | -------------------------------------- |
| SkillCreatorService の API 不安定 | 中     | 中       | 設計書 §11 のインターフェースに準拠    |
| チャンネル名の衝突                | 低     | 低       | プレフィックス `skill-creator:` で分離 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-import-agent-system/technical-decisions.md` §11（skill-creator設計）
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/preload/channels.ts`

### 関連タスク

- task-020-task-9b-skill-creator.md（親タスク）
- TASK-FIX-1-1-TYPE-ALIGNMENT（完了済み）

---

## 9. 備考

### ファイル分離の推奨

skillHandlers.ts は既に13個のハンドラーを含む大きなファイル。SRP（単一責務原則）に従い、skill-creator 用ハンドラーは `skillCreatorHandlers.ts` として分離することを推奨。

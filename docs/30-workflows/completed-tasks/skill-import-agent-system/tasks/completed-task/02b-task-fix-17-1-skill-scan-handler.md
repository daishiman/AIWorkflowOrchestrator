# skill:scan ハンドラー追加 - タスク指示書

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | TASK-FIX-17-1-SKILL-SCAN-HANDLER   |
| タスク名     | skill:scan IPCハンドラーの新規追加 |
| 分類         | バグ修正（ハンドラー欠落）         |
| 対象機能     | スキルスキャン IPC                 |
| 優先度       | 高                                 |
| 見積もり規模 | 小規模                             |
| ステータス   | 未実施                             |
| 実行順序     | 02b（並列可能 — グループ01完了後） |
| 発見元       | skill-system-conflict-report #17   |
| 発見日       | 2026-02-05                         |
| 関連Phase    | Phase 1（E2E接続）                 |
| 関連Issue    | -                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`skill:scan` IPCチャンネルは `preload/channels.ts` で定義済み・ホワイトリスト登録済みだが、対応するIPCハンドラーが `skillHandlers.ts` に存在しない。Preload APIのスタブ（#3）を `safeInvoke` に置き換えても、Main Process 側にハンドラーがないため `Error: No handler registered for 'skill:scan'` が発生する。

### 1.2 問題点・課題

| レイヤー        | ファイル                   | 状態                                 |
| --------------- | -------------------------- | ------------------------------------ |
| チャネル定義    | `preload/channels.ts` L184 | `SKILL_SCAN: "skill:scan"` 定義済み  |
| ホワイトリスト  | `preload/channels.ts` L390 | `ALLOWED_INVOKE_CHANNELS` に含まれる |
| Preload API     | `skill-api.ts` L207        | `Promise.resolve([])` スタブ         |
| **IPC Handler** | `skillHandlers.ts`         | **完全に存在しない**                 |

### 1.3 放置した場合の影響

- TASK-FIX-5-1 でスタブを `safeInvoke` に置き換えた際にランタイムエラー発生
- スキル再スキャン機能が永続的に利用不可
- チャンネル定義とハンドラーの不整合がテストで検出されない

---

## 2. 何を達成するか（What）

### 2.1 目的

`skill:scan` チャンネルに対応するIPCハンドラーを追加し、スキル再スキャン機能を動作可能にする。

### 2.2 最終ゴール

1. `SKILL_SCAN` ハンドラーが `skillHandlers.ts` に登録されている
2. `skillService.scanAvailableSkills(true)` を呼び出し、強制リフレッシュされたスキル一覧を返す
3. 既存の `SKILL_LIST` ハンドラーとの整合性が保たれている

### 2.3 スコープ

#### 含むもの

- `skillHandlers.ts` に `SKILL_SCAN` ハンドラー追加
- テスト追加

#### 含まないもの

- Preload API のスタブ解消（TASK-FIX-5-1 で対応）
- SkillService のスキャンロジック変更

### 2.4 成果物

| 成果物                      | 説明                      |
| --------------------------- | ------------------------- |
| 修正された skillHandlers.ts | SKILL_SCAN ハンドラー追加 |
| テストファイル              | ハンドラーの動作検証      |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-1-1-TYPE-ALIGNMENT 完了（型定義統一）

### 3.2 依存タスク

- TASK-FIX-1-1-TYPE-ALIGNMENT（戻り値型の参照）

### 3.3 必要な知識

- Electron IPC ハンドラー登録パターン
- SkillService の scanAvailableSkills API

### 3.4 推奨アプローチ

1. 既存の `SKILL_LIST` ハンドラーを参考にする（類似パターン）
2. `forceRefresh: true` 固定で `scanAvailableSkills` を呼び出し
3. `withValidation()` ラッパーで登録

---

## 4. 実行手順

### Step 1: ハンドラー実装

#### 手順

1. `skillHandlers.ts` に `SKILL_SCAN` ハンドラーを追加

**実装案**:

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_SCAN,
  withValidation(async (_event) => {
    const skills = await skillService.scanAvailableSkills(true);
    return { success: true, data: skills };
  }),
);
```

### Step 2: テスト追加

#### 手順

1. `skillHandlers.test.ts` に SKILL_SCAN のテストケースを追加
2. 正常系（スキル一覧返却）とエラー系（スキャン失敗）をカバー

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SKILL_SCAN` ハンドラーが `skillHandlers.ts` に登録されている
- [ ] `scanAvailableSkills(true)` が呼び出される（強制リフレッシュ）
- [ ] `withValidation()` ラッパーで登録されている

### 品質要件

- [ ] 全テストが PASS
- [ ] テストカバレッジ基準を満たす

---

## 6. 検証方法

### テストケース

1. SKILL_SCAN 呼び出し → スキル一覧が返る
2. スキャンエラー時 → 適切なエラーレスポンス
3. チャンネル定義との整合性確認

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                         |
| ------------------------------ | ------ | -------- | ---------------------------- |
| SKILL_LIST との機能重複        | 低     | 中       | 明確な使い分けを設計書で定義 |
| scanAvailableSkills の戻り値型 | 中     | 低       | 型定義統一（#1）を前提       |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/preload/channels.ts` L184, L390
- `apps/desktop/src/main/services/skill/SkillService.ts`

### 関連タスク

- TASK-FIX-5-1-SKILL-API-UNIFICATION（Preload側のスタブ解消）
- TASK-FIX-1-1-TYPE-ALIGNMENT（型定義統一・完了済み）

---

## 9. 備考

### 発見経緯

逆説思考（「ハンドラー未確認」は「未確認」ではなく「不在」ではないか？）で発見。conflict-report の Issue #3 テーブルで `rescan` の対応ハンドラーを「ハンドラー未確認」と記載していたが、実際にはハンドラー自体が実装されていなかった。

### SKILL_LIST との使い分け

| ハンドラー | 用途                             | forceRefresh |
| ---------- | -------------------------------- | ------------ |
| SKILL_LIST | 通常のスキル一覧取得             | オプション   |
| SKILL_SCAN | ファイルシステムの強制再スキャン | 固定 `true`  |

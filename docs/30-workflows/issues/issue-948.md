# [#948] [UT-UI-05A-GETFILETREE-001] skill:getFileTree IPC実装

## メタ情報

```yaml
task_id: UT-UI-05A-GETFILETREE-001
task_name: skill:getFileTree IPC実装
category: 改善
target_feature: SkillEditorView ファイルツリー取得
priority: 高
scale: 中規模
status: 未実施
source_phase: Phase 11 / Phase 12 再監査
created_date: 2026-03-02
dependencies: []
spec_path: docs/30-workflows/completed-tasks/getfiletree-ipc/unassigned-task/task-ui-05a-getfiletree-ipc-implementation.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

SkillEditorView は `useFileTree` で `skill:getFileTree` 呼び出しを前提に設計されているが、Main/Preload の契約実装が不足している。

### 1.2 問題点・課題

ファイルツリー取得APIが未実装のため、UIが本来の編集対象ファイル一覧を表示できない。

### 1.3 放置した場合の影響

SkillEditorView が機能的に成立せず、実装済みUIの価値が大きく毀損する。

## 2. 何を達成するか（What）

### 2.1 目的

`skill:getFileTree` を Main/Preload/型定義/テストまで一貫実装し、Rendererから安全に利用可能にする。

### 2.2 最終ゴール

SkillEditorView で対象スキル配下のファイルツリーが取得・表示できる。

### 2.3 スコープ

#### 含むもの

`channels.ts`、IPCハンドラ、Preload API、共有型、ユニットテスト更新。

#### 含まないもの

キーボードナビゲーション、モバイルドロワー、UIアニメーション。

### 2.4 成果物

- `apps/desktop/src/main/ipc` のハンドラ実装差分
- `apps/desktop/src/preload` の API/型差分
- `api-ipc-agent.md` / `interfaces-agent-sdk-skill.md` 同期

## 3. どのように実行するか（How）

### 3.1 前提条件

`SkillFileManager` の既存ファイル列挙ロジックを把握済みであること。

### 3.2 依存タスク

なし（優先先行）。

### 3.3 必要な知識

Electron IPC、P42 3段バリデーション、path traversal対策。

### 3.4 推奨アプローチ

既存 `skill:readFile` 系ハンドラと同じセキュリティ境界を流用し、`FileNode[]` 返却に限定する。

## 4. 実行手順

### Phase構成

実装 → テスト → 仕様同期の3フェーズで実施する。

### Phase 1: IPC契約実装

#### 目的

Main/Preloadに `skill:getFileTree` を追加する。

#### 手順

1. `IPC_CHANNELS` に `skill:getFileTree` を追加する。
2. Main側ハンドラで P42 3段バリデーションと sender 検証を実装する。
3. Preload API と公開型に `getFileTree` を追加する。

#### 成果物

IPC契約コード差分。

#### 完了条件

Rendererから `window.skillAPI.getFileTree()` が呼び出せる。

### Phase 2: 検証・同期

#### 目的

テストと仕様書の整合を確保する。

#### 手順

1. ハンドラ/Preloadテストを追加・更新する。
2. `api-ipc-agent.md` と `interfaces-agent-sdk-skill.md` を同期する。
3. `task-workflow.md` の残課題状態を更新する。

#### 成果物

テスト結果と仕様書更新差分。

#### 完了条件

関連テストPASS、仕様書参照が最新化される。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `skill:getFileTree` が Main/Preload で利用可能
- [ ] `FileNode[]` が仕様どおり返却される

### 品質要件

- [ ] P42 3段バリデーションが実装されている
- [ ] sender検証とパストラバーサル対策が通る

### ドキュメント要件

- [ ] `api-ipc-agent.md` が更新される
- [ ] `task-workflow.md` 残課題の参照が正しい

## 6. 検証方法

### テストケース

- 正常系: 有効 `skillName` で `tree` 返却
- 異常系: 非文字列 / 空文字 / trim空文字
- セキュリティ: 不正 sender / path traversal

### 検証手順

1. `pnpm vitest run src/main/ipc src/preload`
2. `pnpm typecheck`
3. SkillEditorView 画面でツリー描画を確認

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                     |
| ---------------------------- | ------ | -------- | ------------------------ |
| 大規模ディレクトリで応答遅延 | 中     | 中       | 深さ制限と遅延測定を導入 |
| 型不一致でRendererクラッシュ | 高     | 低       | 共有型を単一ソース化     |

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`
- `docs/30-workflows/skill-editor-view/phase-5-implementation.md`
- `.claude/rules/06-known-pitfalls.md#P42`

### 参考資料

- Electron Security Checklist

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
SkillEditorView のファイルツリー取得契約が未実装で、画面が実データを表示できない。
```

### 補足事項

旧配置 `docs/30-workflows/skill-editor-view/unassigned-task/UT-UI-05A-GETFILETREE-001.md` はタスク発見時の作業メモとして残し、正本は本ファイルに統一する。

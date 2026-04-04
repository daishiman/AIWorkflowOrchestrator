# Phase 1: 要件定義 -- Skill Output Integration

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 1                        |
| 機能名     | skill-output-integration |
| タスクID   | TASK-SDK-SC-04           |
| 作成日     | 2026-04-02               |
| 依存 Phase | なし（起点）             |

## 目的

SDK セッション完了時に skill-creator が生成したスキル出力（YAML / Markdown）を捕捉し、ファイルシステムへ保存・`SkillRegistry` 登録・UI 通知までのパイプラインに必要な機能要件を定義する。

## 前提条件

> **CRITICAL**: Task 04 を実装する前に、以下の前提条件を満たしている必要がある。

### PC-001: skill-creator SKILL.md へのマーカー追加

現時点の `.claude/skills/skill-creator/SKILL.md` には `<!-- SKILL_START: {skillName} -->` / `<!-- SKILL_END: {skillName} -->` マーカーが存在しない（grep 確認済み）。  
FR-001 のマーカーベース抽出を機能させるには、SKILL.md を更新してスキル出力時にマーカーを付与するよう指示を追記する必要がある。

**追記すべき内容（SKILL.md 更新タスクとして先行実施）**:

```
skill-creator スキルが生成したスキルコンテンツを出力する際、
以下のマーカーで囲む必要がある:
<!-- SKILL_START: {skillName} -->
{生成された SKILL.md コンテンツ}
<!-- SKILL_END: {skillName} -->

この追記は SKILL.md の更新タスク（Task 04 前提条件）として実施する。
```

この更新を行わない場合、FR-001 の処理は FR-001-B のフォールバック戦略（後述）で動作する。

## 実行タスク

### Task 1-1: 現状調査（出力フロー分析）

TASK-SDK-SC-01/02/03 完了後の SDK セッション出力フローを以下の観点で整理する。

| 観点           | 内容                                                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 出力タイミング | SDK セッションが正常終了（`session-complete` イベント）した時点でスキル出力が生成される                                                                                                                             |
| 出力形式       | セッション出力テキスト内に `<!-- SKILL_START: {skillName} -->` ... `<!-- SKILL_END: {skillName} -->` マーカーで囲まれた SKILL.md 内容（PC-001 完了後）、またはフォールバック戦略 B によるアシスタントメッセージ全体 |
| 保存先         | `.claude/skills/{skill-name}/SKILL.md`（`skill-name` はスキル出力内の `name` フィールドから取得）                                                                                                                   |
| 登録先         | `SkillRegistry`（Electron Main プロセス上のスキルレジストリ）                                                                                                                                                       |
| UI 通知        | IPC `skill-creator:output-ready` イベントで Renderer に通知・プレビュー表示                                                                                                                                         |

### Task 1-2: 機能要件定義

#### FR-001: SDK セッション出力からスキル YAML / Markdown 抽出

SDK セッション完了時のテキスト出力から、スキル定義（SKILL.md 内容）を抽出する。

- 抽出マーカー: `<!-- SKILL_START: {skillName} -->` と `<!-- SKILL_END: {skillName} -->` で囲まれた範囲
- スキル名: マーカー内の `{skillName}` 属性、または抽出した内容の `name:` フィールドから取得
- マーカーが存在しない場合: FR-001-B のフォールバック戦略を適用する

#### FR-001-B: マーカー不在時のフォールバック戦略

PC-001 の前提条件タスクが未完了でマーカーが存在しない場合、以下のフォールバック戦略を適用する。

**フォールバック優先順位**:

1. **戦略 A（推奨）**: PC-001 の先行タスクとして SKILL.md へのマーカー追加を実施し、フォールバックを回避する
2. **戦略 B（暫定対応）**: アシスタントメッセージ全体（セッション最終出力テキスト）をスキル内容として扱う
   - スキル名は `name:` フィールドの正規表現抽出で取得
   - `name:` フィールドが見つからない場合は `null` を返し、処理をスキップする
3. **戦略 C（中断）**: `null` を返してスキル抽出を中断し、UI に「スキル出力マーカーが見つかりません」エラーを通知する

**推奨実装**: 戦略 A を先行タスクとして定義し、実装時は戦略 A 完了を前提とする。  
ただし、SKILL.md 未更新の環境での動作保証のため、戦略 B のフォールバック処理を `extractSkillFromOutput()` に組み込む。

#### FR-002: `.claude/skills/{name}/SKILL.md` への自動保存

抽出したスキルを以下のパスに保存する。

- パス: `{projectRoot}/.claude/skills/{skillName}/SKILL.md`
- ディレクトリが存在しない場合は自動作成
- 保存成功時: 保存先のフルパスを返す

#### FR-003: `SkillRegistry` への自動登録

保存した SKILL.md のパスを `SkillRegistry` に登録する。

- 登録メソッド: `SkillRegistry.registerFromPath(skillPath: string): Promise<void>`
- 登録済みスキルが存在する場合: 上書き（更新）する
- 登録失敗時: エラーをログ出力し、UI 通知はキャンセルしない

#### FR-004: 生成完了通知（IPC: `skill-creator:output-ready`）

スキル保存・登録完了後、IPC チャネル `skill-creator:output-ready` を通じて Renderer に通知する。

- ペイロード: `SkillOutputReadyPayload`（スキル名・保存パス・SKILL.md 内容プレビュー）
- 通知は保存・登録の両方が完了してから送信する

#### FR-005: スキルプレビュー表示（SKILL.md 内容）

`SkillCreatorResultPanel` コンポーネントが IPC 通知を受信し、スキル名と SKILL.md 内容をプレビュー表示する。

- スキル名を見出しとして表示
- SKILL.md 内容をコードブロックまたはマークダウンレンダリングで表示
- 「スキルを開く」ボタン: VS Code / エディタでファイルを開く

#### FR-006: 既存スキル上書き確認ダイアログ

同名スキルが既に `.claude/skills/` に存在する場合、上書き確認フラグを立てる。

- フラグ: `SkillOutputReadyPayload.requiresOverwriteConfirm: boolean`
- UI 側で確認ダイアログを表示し、ユーザーが承認した場合は `SkillCreatorOutputHandler.handleOverwriteApproved()` を呼び出して保存処理を再開する

### Task 1-3: 受入基準定義

| ID     | 受入基準                                                                                                        |
| ------ | --------------------------------------------------------------------------------------------------------------- |
| AC-01  | SDK セッション出力テキストから `<!-- SKILL_START: {skillName} -->` マーカーを使ってスキル内容を正しく抽出できる |
| AC-01B | マーカーが存在しない場合、フォールバック戦略 B（アシスタントメッセージ全体を利用）が適用される                  |
| AC-02  | 抽出したスキルが `.claude/skills/{name}/SKILL.md` に保存される                                                  |
| AC-03  | 保存後に `SkillRegistry` にスキルが登録される                                                                   |
| AC-04  | 保存・登録完了後に `skill-creator:output-ready` IPC が発行される                                                |
| AC-05  | `SkillCreatorResultPanel` がスキル名とプレビューを正しく表示する                                                |
| AC-06  | 同名スキルが存在する場合に `requiresOverwriteConfirm: true` が設定される                                        |

### Task 1-4: スコープ外事項の明記

以下は本タスクのスコープ外とする。

- SDK セッション実行ロジック（TASK-SDK-SC-01 で対応済み）
- 質問エンジン実装（TASK-SDK-SC-02 で対応済み）
- 質問 UI コンポーネント（TASK-SDK-SC-03 で対応済み）
- スキルの編集・削除機能（別タスクで対応）
- SKILL.md のバリデーション詳細（スキーマ検証は別タスク）

## 参照資料

| 資料名                        | パス                                                                   |
| ----------------------------- | ---------------------------------------------------------------------- |
| requirements-draft            | `docs/30-workflows/skill-creator-agent-sdk-lane/requirements-draft.md` |
| 既存 channels.ts              | `packages/shared/src/ipc/channels.ts`                                  |
| 既存 skillCreator.ts 型定義   | `packages/shared/src/types/skillCreator.ts`                            |
| SkillCreatorWorkflowEngine.ts | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` |
| SkillRegistry.ts              | `apps/desktop/src/main/services/runtime/SkillRegistry.ts`              |
| タスク概要                    | `./index.md`                                                           |

## 成果物

| 成果物                   | パス                        | 形式     |
| ------------------------ | --------------------------- | -------- |
| 要件定義書（本ファイル） | `./phase-1-requirements.md` | Markdown |

## 完了条件

- [ ] PC-001（skill-creator SKILL.md へのマーカー追加）を前提条件として定義した
- [ ] SDK セッション出力フローを調査し、スキル出力タイミング・形式を特定した
- [ ] FR-001（SDK 出力からスキル抽出）を定義した
- [ ] FR-001-B（マーカー不在時のフォールバック戦略）を定義した
- [ ] FR-002（`.claude/skills/{name}/SKILL.md` への自動保存）を定義した
- [ ] FR-003（`SkillRegistry` への自動登録）を定義した
- [ ] FR-004（`skill-creator:output-ready` IPC 通知）を定義した
- [ ] FR-005（スキルプレビュー表示）を定義した
- [ ] FR-006（既存スキル上書き確認ダイアログ）を定義した
- [ ] 受入基準 AC-01、AC-01B から AC-06 を定義した
- [ ] スコープ外事項を明記した

## 次の Phase: Phase 2 (phase-2-design.md)

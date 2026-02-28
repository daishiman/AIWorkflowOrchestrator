# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 12                         |
| Phase名    | ドキュメント更新           |
| タスクID   | TASK-9I                    |
| 前提Phase  | Phase 11（手動テスト検証） |
| 後続Phase  | Phase 13（PR作成）         |
| ステータス | 完了                       |
| 作成日     | 2026-02-28                 |
| 機能名     | TASK-9I-skill-docs         |

---

## 目的

スキルドキュメント生成機能（SkillDocGenerator サービス、IPC 4チャネル、Preload API 4メソッド、共有型定義 5型）の実装内容を文書化し、システム仕様書を更新する。未タスクがあれば検出・記録する。スキルフィードバックレポートを作成する。

## 背景

ドキュメントは将来のメンテナンスに不可欠である。
Phase 12 は漏れが最も発生しやすい Phase であるため、以下の既知の落とし穴を事前に確認すること。

### 事前確認必須: 既知の落とし穴（06-known-pitfalls.md）

| Pitfall ID | タイトル                                 | 対策                                                                            |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| P1         | LOGS.md 2ファイル更新漏れ                | aiworkflow-requirements と task-specification-creator の**2ファイル両方**を更新 |
| P2         | topic-map.md 再生成忘れ                  | 仕様書に変更があれば**必ず**再生成を実行                                        |
| P3         | 未タスク管理の3ステップ不完全            | (1)指示書 (2)残課題テーブル (3)関連仕様書リンク の全ステップ                    |
| P4         | documentation-changelog 早期「完了」記載 | 全 Step 確認前に「完了」と記載しない                                            |
| P25        | LOGS.md 2ファイル更新漏れ（再発）        | P1と同様。明示的にチェック                                                      |
| P27        | topic-map.md 再生成トリガー判断ミス      | セクション削除・更新も再生成トリガーに含める                                    |
| P28        | スキルフィードバックレポート未作成       | 改善点がなくても「改善点なし」として作成                                        |
| P29        | SKILL.md 変更履歴の更新漏れ              | LOGS.md だけでなく SKILL.md も更新                                              |
| P31        | システム仕様書更新漏れ（複数ファイル）   | IPC関連では5ファイル以上を確認                                                  |
| P38        | 未タスク配置ディレクトリ間違い           | `unassigned-task/` 配下に配置（`tasks/` 直下は不可）                            |
| P43        | サブエージェントの rate limit 中断       | 仕様書更新は3ファイル以下/エージェントに分割する                                |

---

## 実行タスク

> 以下のタスク5つを全て実行してください（全タスク必須）。

- Task 1: 実装ガイド（Part 1/Part 2）を作成する
- Task 2: システム仕様書更新（Step 1-A〜1-D + Step 2）を実行する
- Task 3: ドキュメント更新履歴と artifacts 台帳（`artifacts.json` / `outputs/artifacts.json`）を更新する
- Task 4: 未タスク検出レポートを作成する
- Task 5: スキルフィードバックレポートを作成する

---

### タスク1: 実装ガイド作成

**目的**: スキルドキュメント生成機能の使用方法を文書化する

**実行手順**:

1. Part 1: 概念的説明（初学者・非技術者向け、中学生レベル）を作成する
2. Part 2: 技術的詳細（開発者向け）を作成する
3. IPC ドキュメント（チャンネル仕様）を作成する

#### Part 1: 概念的説明（中学生レベル -- 日常例え必須）

| 要件               | 内容                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------- |
| 対象読者           | 初学者・非技術者（中学生でも理解可能なレベル）                                               |
| 日常の例え話       | 必須（例: 「スキルの説明書を自動で作る機能は、料理のレシピを自動で書いてくれるようなもの」） |
| 専門用語の扱い     | 使用する場合は即座に平易な説明を添える                                                       |
| 説明順序           | 「なぜ必要か」 → 「何をするか」 → 「どう動くか」の順                                         |
| セキュリティの説明 | 日常例（例: 「お店の受付で身分証を確認するようなもの」）で4層セキュリティを説明              |

以下の構成で作成すること:

```markdown
# スキルドキュメント生成機能 実装ガイド

## Part 1: 概念的説明（中学生レベル）

### この機能が必要な理由

スキルの中身を読み解いてドキュメントを手作業で書くのは大変です。
スキルドキュメント生成機能は、この作業を自動化します。

### スキルドキュメント生成とは？

スキルのドキュメントを自動で作る機能は、**料理のレシピを自動で書いてくれるロボット**の
ようなものです。

料理が上手な人のところに行って、「この料理の作り方を教えて」と頼むと、
材料・手順・コツをまとめたレシピカードを作ってくれます。

スキルドキュメント生成も同じで、スキルの中身（設定ファイル、コード、
参照資料）を読み込んで、「このスキルは何をするものか」「どう使うのか」
「どんな機能があるのか」を自動的にまとめてくれます。

### SkillDocGeneratorとは？

これは**レシピを書いてくれるロボット**そのものです。

- スキルのフォルダ構成を読み取る
- SKILL.md ファイルの内容を解析する
- LLM（AIの頭脳）に「わかりやすい説明を書いて」と依頼する
- 完成したドキュメントを返す

### 4つの操作

- **generate**: レシピカードを1から新しく作る（ドキュメント生成）
- **preview**: 下書きを先に見せてもらう（プレビュー）
- **export**: レシピカードを紙に印刷して持ち帰る（ファイルに出力）
- **templates**: レシピカードのテンプレートを一覧で見る（テンプレート取得）

### 安全に使える仕組み

受付（Sender検証）→ 持ち物検査（引数バリデーション）→ 作業実行 → 結果報告（エラーサニタイズ）
のように、4段階で安全性を確保しています。
```

Part 1 必須セクション:

1. **この機能が必要な理由**: スキルの中身を読み解いてドキュメントを手作業で書く負担を解消する目的
2. **何ができるか**: ドキュメント生成・プレビュー・エクスポート・テンプレート選択の4つの操作
3. **どう動くか**: Renderer → Preload → Main Process → LLM のデータフロー（日常の例え話で）
4. **安全に使える仕組み**: 4層セキュリティ検証を非技術者向けに説明

#### Part 2: 技術者向け実装詳細

| 要件                     | 内容                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| 対象読者                 | TypeScript/Electron 開発者                                                                        |
| TypeScript 型定義        | `DocGenerationRequest`, `GeneratedDoc`, `DocSection`, `DocTemplate`, `TemplateSection` のフル定義 |
| IPC チャネル仕様         | 4チャネルの引数型・戻り値型・エラーレスポンス型を記載                                             |
| API シグネチャ           | SkillDocGenerator の public メソッド一覧と使用例                                                  |
| エラーハンドリング       | エラーコード・メッセージ・復旧方法を記載                                                          |
| セキュリティ実装パターン | P42 準拠 3段バリデーション・validateIpcSender の実装例                                            |
| コード例                 | 各 IPC チャネルの呼び出し例（Renderer 側・Main 側の両方）                                         |

以下の構成で作成すること:

```markdown
## Part 2: 技術者向け実装詳細

### 実装概要

| 項目            | 値                                                                           |
| --------------- | ---------------------------------------------------------------------------- |
| IPCチャンネル数 | 4                                                                            |
| 新規ファイル数  | 2（SkillDocGenerator.ts, skill-docs.ts）                                     |
| 修正ファイル数  | 4（skillHandlers.ts, channels.ts, skill-api.ts, types.ts）                   |
| 型定義          | DocGenerationRequest, GeneratedDoc, DocSection, DocTemplate, TemplateSection |

### アーキテクチャ概要

SkillDocGenerator のクラス構造、依存関係、DIパターンの説明

### 共有型定義

packages/shared/src/types/skill-docs.ts の全インターフェースの説明

### 4チャンネルのインターフェース

| チャンネル名         | 引数                                                        | 戻り値        | 説明                 |
| -------------------- | ----------------------------------------------------------- | ------------- | -------------------- |
| skill:docs:generate  | DocGenerationRequest（skillName, format?, sections?）       | GeneratedDoc  | ドキュメント生成     |
| skill:docs:preview   | DocGenerationRequest（skillName, format?, sections?）       | GeneratedDoc  | プレビュー取得       |
| skill:docs:export    | { skillName: string, format?: string, outputPath?: string } | string        | ファイルエクスポート |
| skill:docs:templates | なし                                                        | DocTemplate[] | テンプレート一覧     |

### Preload API

skill-api.ts の docs 操作4メソッドのシグネチャ

### セキュリティ検証フロー

1. validateIpcSender → 2. 引数バリデーション（P42準拠3段） → 3. try/catch → 4. sanitizeErrorMessage

### エッジケース

スキル未存在時・LLMタイムアウト時・不正入力時の挙動
```

Part 2 必須セクション:

1. **アーキテクチャ概要**: SkillDocGenerator のクラス構造、依存関係、DI パターン
2. **共有型定義**: `packages/shared/src/types/skill-docs.ts` の全インターフェース
3. **IPC チャネル仕様**: 4チャネルの詳細（引数・戻り値・エラーパターン）
4. **Preload API**: `skill-api.ts` の docs 操作4メソッドのシグネチャ
5. **セキュリティ実装**: 4層セキュリティの各レイヤー実装コード例
6. **エッジケース**: スキル未存在時・LLM タイムアウト時・不正入力時の挙動

#### テストカテゴリテーブル

| カテゴリ       | テスト対象                        | テスト数（実測値） |
| -------------- | --------------------------------- | ------------------ |
| ユニットテスト | SkillDocGenerator メソッド        | `pnpm test` で実測 |
| IPC テスト     | skillHandlers docs ハンドラー     | `pnpm test` で実測 |
| バリデーション | 引数バリデーション（P42 準拠3段） | `pnpm test` で実測 |
| セキュリティ   | sender 検証・エラーサニタイズ     | `pnpm test` で実測 |
| 統合テスト     | E2E IPC 通信フロー                | `pnpm test` で実測 |

> **注意**: テスト数は Phase 4 の想定値ではなく、`pnpm test` 実行結果の実測値のみを記載すること（P37 対策）。

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`（Part 1 + Part 2 + IPC仕様を含む1ファイル）

---

### タスク2: システム仕様書更新

**目的**: aiworkflow-requirements のシステム仕様を更新する

> **重要**: `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照してください。

**2ステップで実行:**

#### Step 1: タスク完了記録（必須）

##### Step 1-A: タスク完了記録

以下の項目を**全て**実施する:

- [ ] `api-ipc-agent.md` にタスク完了記録を追加する（新規4チャンネル: `skill:docs:generate`, `skill:docs:preview`, `skill:docs:export`, `skill:docs:templates`）
- [ ] `arch-electron-services.md` に SkillDocGenerator サービス追加を記録する（L2コンポーネントとして追加）
- [ ] `interfaces-agent-sdk-skill.md` にドキュメント生成型定義追加を記録する（DocGenerationRequest, GeneratedDoc, DocSection, DocTemplate, TemplateSection）
- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` を更新する
- [ ] `.claude/skills/task-specification-creator/LOGS.md` を更新する（**2ファイル両方** -- P1/P25対策）
- [ ] `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- [ ] `.claude/skills/task-specification-creator/SKILL.md` の変更履歴を更新する（P29対策）

**LOGS.md 記載テンプレート（aiworkflow-requirements）**:

```markdown
## 2026-02-28: スキルドキュメント生成機能（TASK-9I）

| 項目         | 内容                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| タスクID     | TASK-9I                                                                                                                                          |
| 操作         | update-spec                                                                                                                                      |
| 対象ファイル | api-ipc-agent.md, arch-electron-services.md, security-electron-ipc.md, architecture-overview.md, interfaces-agent-sdk-skill.md, task-workflow.md |
| 結果         | success                                                                                                                                          |
| 備考         | スキルドキュメント生成機能の4チャンネル追加、SkillDocGenerator設計追記                                                                           |
```

**LOGS.md 記載テンプレート（task-specification-creator）**:

```markdown
## 2026-02-28 - スキルドキュメント生成機能（TASK-9I）タスク完了

### コンテキスト

- タスクID: TASK-9I
- タスク名: スキルドキュメント生成機能実装
- Phase: 1-13

### 成果

- テストカバレッジ: {{TEST_COUNT}}テスト全件PASS（pnpm test 実測値）
- 実装内容:
  - SkillDocGenerator サービス実装（LLMベースドキュメント自動生成）
  - IPC 4チャンネル追加（skill:docs:generate/preview/export/templates）
  - Preload API拡張（4メソッド）
  - 型定義5型新規作成

### 結果

- ステータス: success
- 完了日時: 2026-02-28
```

**完了タスク記録テンプレート（仕様書用）**:

```markdown
## 完了タスク

### タスク: TASK-9I スキルドキュメント生成機能実装（{{COMPLETION_DATE}}完了）

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| タスクID   | TASK-9I                      |
| ステータス | **完了**                     |
| テスト数   | {{N}}（自動）+ {{N}}（手動） |

> **注意**: テスト数は `pnpm test` 実行結果の実測値のみを記載すること。推定値・概算値は使用不可（P37対策）。
```

##### Step 1-B: 実装状況テーブル更新

- [ ] `arch-electron-services.md` のスキル管理サービスコンポーネント構成テーブルに以下を追加し、ステータスを「完了」とする:

| 階層 | コンポーネント    | 役割                                  |
| ---- | ----------------- | ------------------------------------- |
| L2   | SkillDocGenerator | スキルドキュメント自動生成（TASK-9I） |

- [ ] `api-ipc-agent.md` に4チャンネルの実装ステータスを追加する

##### Step 1-C: 関連タスクテーブル更新

```bash
# TASK-9I を含む仕様書を検索する
grep -rn "TASK-9I" .claude/skills/aiworkflow-requirements/references/
grep -rn "TASK-9I" .claude/skills/task-specification-creator/references/
```

- [ ] 検出された仕様書の関連タスクテーブルを「完了」に更新する

##### Step 1-D: topic-map.md 再生成

```bash
# topic-map.md を再生成する（P2/P27対策 -- 仕様書に変更があれば必ず実行）
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [ ] `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` を再生成した
- [ ] 再生成された topic-map.md に新規セクション（SkillDocGenerator, skill:docs:\*チャンネル等）の行番号が正しく反映されている

#### Step 2: システム仕様更新（本タスクでは**必須**）

**更新判断**: 新規IPCチャンネル4つ（`skill:docs:generate`, `skill:docs:preview`, `skill:docs:export`, `skill:docs:templates`）、新規サービス（SkillDocGenerator）、新規型定義5型（DocGenerationRequest, GeneratedDoc, DocSection, DocTemplate, TemplateSection）を追加するため、システム仕様の更新が**必要**。

**IPC機能開発のため必須の更新対象ファイル**:

| #   | 更新対象ファイル                | 更新内容                                                                                                                        | 必須/任意 |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1   | `api-ipc-agent.md`              | skill:docs:\* 4チャネル一覧追加、引数型・戻り値型定義、バリデーションルール、実装状況テーブル、セキュリティ仕様、完了タスク記録 | 必須      |
| 2   | `security-electron-ipc.md`      | skillDocsAPIセキュリティ実装パターン追加（validateIpcSender + P42準拠3段バリデーション + エラー正規化）                         | 必須      |
| 3   | `architecture-overview.md`      | IPCハンドラー登録一覧に registerSkillDocsHandlers / unregisterSkillDocsHandlers を追加                                          | 必須      |
| 4   | `interfaces-agent-sdk-skill.md` | DocGenerationRequest, GeneratedDoc, DocSection, DocTemplate, TemplateSection 型定義テーブル追加、完了タスク記録                 | 必須      |
| 5   | `task-workflow.md`              | TASK-9I を完了タスクセクションに追加、残課題テーブル更新                                                                        | 必須      |
| 6   | `arch-electron-services.md`     | SkillDocGenerator L2コンポーネントセクション追加（API、データフロー、LLM連携の設計記載）                                        | 必須      |
| 7   | `lessons-learned.md`            | 実装で得られた教訓（LLMドキュメント生成パターン、テンプレート設計等）                                                           | 任意      |

**P43対策: SubAgent分割構成（仕様書更新は3ファイル以下/エージェントに分割する）**:

| SubAgent  | 担当ファイル                                                                    | ファイル数 |
| --------- | ------------------------------------------------------------------------------- | ---------- |
| A         | `api-ipc-agent.md`, `security-electron-ipc.md`, `arch-electron-services.md`     | 3          |
| B         | `architecture-overview.md`, `interfaces-agent-sdk-skill.md`, `task-workflow.md` | 3          |
| C（任意） | `lessons-learned.md`                                                            | 1          |

> **重要**: LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする（P43対策: 中断後の未完了検出を容易にするため）。

**各仕様書の具体的更新内容**:

##### 1. api-ipc-agent.md 更新内容

新規セクション「スキルドキュメント生成 IPC チャネル（TASK-9I）」を追加する:

- チャネル定数定義テーブル:

| 定数名               | チャネル名             | 方向         |
| -------------------- | ---------------------- | ------------ |
| SKILL_DOCS_GENERATE  | `skill:docs:generate`  | invoke (R→M) |
| SKILL_DOCS_PREVIEW   | `skill:docs:preview`   | invoke (R→M) |
| SKILL_DOCS_EXPORT    | `skill:docs:export`    | invoke (R→M) |
| SKILL_DOCS_TEMPLATES | `skill:docs:templates` | invoke (R→M) |

- IPC APIチャネルテーブル（引数型・戻り値型）
- バリデーションルールテーブル（各チャネルの検証項目）
- 完了タスクテーブルに TASK-9I を追記

##### 2. security-electron-ipc.md 更新内容

新規セクション「実装例: skillDocsAPI（TASK-9I）」を追加する（既存の skillScheduleAPI セクションの後に配置）:

- セキュリティ検証フロー:

| 層                          | 検証項目                                 | 実装                                                                           | 返却仕様                                    |
| --------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------- |
| 1. Sender検証               | 送信元ウィンドウの正当性                 | `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })` | 不正時: `toIPCValidationError(validation)`  |
| 2. P42準拠3段バリデーション | `skillName` の型・空文字列・trim空文字列 | `typeof === "string"` + `trim() !== ""`                                        | 不正時: `{ success: false, error: string }` |
| 3. エラー境界               | 例外情報の外部露出を防止                 | `catch` で unknown を `"Internal error"` へ正規化                              | 内部情報漏えい防止                          |

- チャネル別バリデーション詳細テーブル:

| チャネル               | バリデーション項目                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| `skill:docs:generate`  | `skillName` P42 3段 + `format` 文字列チェック（省略可）+ `sections` 配列チェック（省略可） |
| `skill:docs:preview`   | `skillName` P42 3段 + `format` 文字列チェック（省略可）                                    |
| `skill:docs:export`    | `skillName` P42 3段 + `outputPath` 文字列チェック（省略可）                                |
| `skill:docs:templates` | Sender検証のみ                                                                             |

- 完了タスクテーブルに TASK-9I を追記

##### 3. architecture-overview.md 更新内容

`registerAllIpcHandlers` のハンドラー登録一覧に以下を追記:

- `registerSkillDocsHandlers(mainWindow, skillDocGenerator)`
- `unregisterSkillDocsHandlers()`（対応する解除関数）

##### 4. interfaces-agent-sdk-skill.md 更新内容

型定義セクションに以下の5型を追加:

| 型名                   | 定義場所                                  | 説明                       |
| ---------------------- | ----------------------------------------- | -------------------------- |
| `DocGenerationRequest` | `packages/shared/src/types/skill-docs.ts` | ドキュメント生成リクエスト |
| `GeneratedDoc`         | `packages/shared/src/types/skill-docs.ts` | 生成されたドキュメント     |
| `DocSection`           | `packages/shared/src/types/skill-docs.ts` | ドキュメントセクション     |
| `DocTemplate`          | `packages/shared/src/types/skill-docs.ts` | ドキュメントテンプレート   |
| `TemplateSection`      | `packages/shared/src/types/skill-docs.ts` | テンプレートセクション定義 |

各型のプロパティ定義テーブルも追加する。完了タスクテーブルに TASK-9I を追記。

##### 5. task-workflow.md 更新内容

- 完了タスクセクションに TASK-9I（スキルドキュメント生成機能実装）を追加する
- 残課題テーブルに TASK-9I 関連項目がある場合は完了マークする

##### 6. arch-electron-services.md 更新内容

スキル管理サービスのコンポーネント構成テーブルに SkillDocGenerator を L2 として追加:

| 階層 | コンポーネント    | 役割                                  |
| ---- | ----------------- | ------------------------------------- |
| L2   | SkillDocGenerator | スキルドキュメント自動生成（TASK-9I） |

ファイル構成テーブルにも追記:

| ファイル               | 責務                                           |
| ---------------------- | ---------------------------------------------- |
| `SkillDocGenerator.ts` | LLMベーススキルドキュメント自動生成（TASK-9I） |

IPC APIチャネルテーブルに4チャネルを追加。

**更新チェックリスト（P31対策 -- 複数ファイル更新漏れ防止）**:

- [ ] `api-ipc-agent.md` に4チャンネルの仕様を追加した
- [ ] `security-electron-ipc.md` にドキュメント生成操作のセキュリティパターンを追加した
- [ ] `architecture-overview.md` のIPCハンドラー一覧を更新した
- [ ] `interfaces-agent-sdk-skill.md` に5型のインターフェース定義を追加した
- [ ] `task-workflow.md` に完了タスクとして TASK-9I を記録した
- [ ] `arch-electron-services.md` に SkillDocGenerator L2コンポーネントの設計を追加した

##### Step 1-G: 検証コマンド順次実行（Phase 12 同期ガード）

以下のコマンドをリポジトリルートから順に実行する:

```bash
# 1. 未タスク参照リンク検証
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# 2. 索引再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js
git diff --stat -- .claude/skills/*/indexes/topic-map.md .claude/skills/*/indexes/keywords.json

# 3. SKILL検証（全3スキル）
for skill in skill-creator task-specification-creator aiworkflow-requirements; do
  echo "=== $skill ===" && \
  node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
done

# 4. Phase仕様書参照と outputs 実体の整合確認
rg -n "docs/30-workflows/unassigned-task/task-.*\\.md" docs/30-workflows/TASK-9I-skill-docs/phase-*.md
```

判定基準:

- Error 0件で合格
- Warning は3段階分類（許容/要監視/要対応）に基づき対応する

**期待される成果物**:

- `outputs/phase-12/spec-update-summary.md`

---

### タスク3: ドキュメント更新履歴作成 & artifacts 台帳更新

**目的**: 本タスクで行ったドキュメント更新を記録する

**実行手順**:

1. 更新した全仕様書の変更内容を記録する
2. 各 Step の完了結果を詳細に記録する（漏れの可視化）
3. `artifacts.json` の Phase 12 ステータスを `completed` に更新する
4. `outputs/artifacts.json` を `artifacts.json` と同期する

**DON'T**: 全 Step 確認前に「完了」と記載しない（P4対策）

**更新履歴テンプレート**:

```markdown
# TASK-9I ドキュメント更新履歴

## 作成日

2026-02-28

## 更新したファイル

| ファイル                                                  | 変更種別 | 内容                             |
| --------------------------------------------------------- | -------- | -------------------------------- |
| packages/shared/src/types/skill-docs.ts                   | 新規     | ドキュメント生成型定義（5型）    |
| apps/desktop/src/main/services/skill/SkillDocGenerator.ts | 新規     | ドキュメント生成サービス         |
| apps/desktop/src/main/ipc/skillHandlers.ts                | 修正     | registerSkillDocsHandlers追加    |
| apps/desktop/src/preload/channels.ts                      | 修正     | SKILL*DOCS*\*4チャンネル定数追加 |
| apps/desktop/src/preload/skill-api.ts                     | 修正     | docs操作4メソッド追加            |
| apps/desktop/src/preload/types.ts                         | 修正     | SkillAPI型にdocsメソッド追加     |
| packages/shared/src/types/index.ts                        | 修正     | skill-docs re-export追加         |

## Step 完了ステータス

### Step 1-A: タスク完了記録

- [ ] api-ipc-agent.md にタスク完了記録追加
- [ ] arch-electron-services.md に SkillDocGenerator サービス追加記録
- [ ] interfaces-agent-sdk-skill.md に型定義追加記録
- [ ] aiworkflow-requirements/LOGS.md 更新
- [ ] task-specification-creator/LOGS.md 更新
- [ ] aiworkflow-requirements/SKILL.md 変更履歴更新
- [ ] task-specification-creator/SKILL.md 変更履歴更新

### Step 1-B: 実装状況テーブル

- [ ] arch-electron-services.md に SkillDocGenerator L2コンポーネント追加
- [ ] api-ipc-agent.md に4チャンネル実装ステータス追加

### Step 1-C: 関連タスクテーブル

- [ ] grep で検出された全仕様書を更新

### Step 1-D: topic-map.md 再生成

- [ ] generate-index.js を実行し、新規セクションの行番号が反映されている

### Step 2: システム仕様更新

- [ ] api-ipc-agent.md -- 4チャンネル仕様追加
- [ ] security-electron-ipc.md -- セキュリティパターン追加
- [ ] architecture-overview.md -- ハンドラー登録一覧更新
- [ ] interfaces-agent-sdk-skill.md -- 5型インターフェース定義追加
- [ ] task-workflow.md -- 完了タスク追加
- [ ] arch-electron-services.md -- L2コンポーネント設計追加

### Step 1-G: 検証コマンド実行結果

- [ ] verify-unassigned-links.js: ALL_LINKS_EXIST
- [ ] generate-index.js (aiworkflow-requirements): 正常終了
- [ ] generate-index.js (task-specification-creator): 正常終了
- [ ] quick_validate.js (skill-creator): Error 0件
- [ ] quick_validate.js (task-specification-creator): Error 0件
- [ ] quick_validate.js (aiworkflow-requirements): Error 0件
```

**artifacts.json 必須確認項目**:

- [ ] Phase 12 のステータスが `completed` に更新されていること
- [ ] Phase 1-12 の全成果物パスが登録されていること
- [ ] `qualityMetrics` セクションに品質指標が記録されていること

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク4: 未タスク検出レポート作成

**目的**: 残課題や未対応事項を検出・記録する（**0件でも出力必須**）

**実行手順**:

1. Phase 3（設計レビュー）の指摘事項を確認する
2. Phase 10（最終レビュー）の指摘事項を確認する
3. Phase 11（手動テスト）の発見課題を確認する
4. コードベースの TODO/FIXME を検索する
5. スコープ外項目を確認する
6. 検出結果を記録する（0件でも「検出タスクなし」と明記する）

**検出コマンド**:

```bash
# TODO/FIXME検索
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/services/skill/SkillDocGenerator.ts
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/ipc/skillHandlers.ts
grep -rn "TODO\|FIXME\|HACK\|XXX" packages/shared/src/types/skill-docs.ts
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/preload/skill-api.ts
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/preload/channels.ts
```

**未タスク検出時の3ステップ（P3対策）**:

検出した未タスクは以下の3ステップを**全て**完了する:

1. `docs/30-workflows/unassigned-task/` に指示書を作成する（P38対策: `tasks/` 直下に配置しない）
2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書（`interfaces-agent-sdk-skill.md` 等）に参照リンクを追加する

**指示書の配置先（P38対策）**:

```
docs/30-workflows/unassigned-task/task-xxx.md
```

`tasks/` 直下や `docs/30-workflows/TASK-9I-skill-docs/` 配下には配置しない。

**スコープ外で確認すべき項目**:

| 項目                       | 確認内容                                               |
| -------------------------- | ------------------------------------------------------ |
| ドキュメント生成UI         | Rendererコンポーネント。本タスクでは対象外             |
| ドキュメントエクスポート先 | ローカルファイル以外の出力先。本タスクでは対象外       |
| テンプレートカスタマイズUI | ユーザーがテンプレートを編集するUI。本タスクでは対象外 |
| E2Eテスト（Playwright）    | 別タスク。本タスクでは対象外                           |

**0件の場合の出力**:

未タスクが0件の場合でも、以下を `unassigned-task-detection.md` に明記する:

```markdown
## 未タスク検出結果

検出件数: **0件**

### 検出ソース確認結果

| ソース              | 確認結果                            | 未タスク数 |
| ------------------- | ----------------------------------- | ---------- |
| Phase 3 レビュー    | 確認済み -- MINOR指摘なし           | 0          |
| Phase 10 レビュー   | 確認済み -- MINOR指摘なし           | 0          |
| Phase 11 手動テスト | 確認済み -- スコープ外発見なし      | 0          |
| 各Phase成果物       | 確認済み -- TODO/FIXME/HACK/XXXなし | 0          |
| コードベース        | grep確認済み -- 未対応コメントなし  | 0          |
```

**監査コマンド**:

```bash
# 未タスク参照リンク検証
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

---

### タスク5: スキルフィードバックレポート作成

**目的**: 実装プロセスで得られたスキル改善点を記録する（**改善点なしでも作成必須** -- P28対策）

**実行手順**:

1. Phase 1〜11 の実行で発見したワークフロー改善点を振り返る
2. task-specification-creator スキルの改善提案があれば記録する
3. 改善点がない場合は「改善点なし」の理由を記載する

**レポート必須セクション**:

| セクション         | 記載内容                                                                      |
| ------------------ | ----------------------------------------------------------------------------- |
| ワークフロー改善点 | Phase 1-12 実行中に発見したワークフロー上の改善提案                           |
| 技術的教訓         | SkillDocGenerator・IPC ハンドラー・Preload API 実装中に得られた技術的な知見   |
| スキル改善提案     | `task-specification-creator` / `skill-creator` への改善提案                   |
| 新規 Pitfall 候補  | `06-known-pitfalls.md` に追加すべき新規 Pitfall（パターン・症状・対策を記載） |

**レポートテンプレート**:

```markdown
# スキルフィードバックレポート - TASK-9I

## 対象スキル

- task-specification-creator

## ワークフロー改善点

（Phase実行中に発見した改善点。例: LLM連携パターン、テンプレート設計の教訓等）

## 技術的教訓

（実装中に得られた技術的な知見）

## スキル改善提案

（改善点がある場合は記載。ない場合は以下）

### 改善点なし

- 理由: （具体的な理由を記載）

## 新規 Pitfall 候補

（06-known-pitfalls.md に追加すべき候補。ない場合は「候補なし」と明記）
```

改善点がない場合でも「改善点なし」と明記してレポートを出力する（省略不可 -- P28）。

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

## 参照資料

| 参照資料                | パス                                                                           | 内容             |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------- |
| 仕様更新フロー          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断基準     |
| SkillDocGenerator実装   | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                    | 実装コード       |
| Phase 1成果物           | `outputs/phase-1/requirements-definition.md`                                   | 要件定義         |
| Phase 2成果物           | `outputs/phase-2/architecture-design.md`                                       | 設計仕様         |
| Phase 5成果物           | `phase-5-implementation.md`                                                    | 実装仕様         |
| Phase 6成果物           | `outputs/phase-6/coverage-report.md`                                           | テスト拡充結果   |
| Phase 7成果物           | `outputs/phase-7/coverage-report.md`                                           | カバレッジ結果   |
| Phase 8成果物           | `outputs/phase-8/refactoring-log.md`                                           | リファクタ結果   |
| Phase 9成果物           | `outputs/phase-9/quality-gate-result.md`                                       | 品質保証結果     |
| Phase 10成果物          | `outputs/phase-10/final-review-result.md`                                      | 最終レビュー結果 |
| Phase 11 テスト結果     | `outputs/phase-11/integration-test-result.md`                                  | 手動テスト結果   |
| Phase 11 発見課題       | `outputs/phase-11/discovered-issues.md`                                        | 発見課題         |
| 既知の落とし穴          | `.claude/rules/06-known-pitfalls.md`                                           | P1-P4, P25-P43   |
| Phase 12 チェックリスト | `.claude/rules/05-task-execution.md`                                           | 必須チェック項目 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                        |
| -------------------------- | ------------------------------------------------------------------------------------------- | --------------------------- |
| IPC Agent仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | 更新対象（4チャンネル追加） |
| Electronサービス設計       | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | 更新対象（L2追加）          |
| セキュリティIPC仕様        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | 更新対象（パターン追加）    |
| アーキテクチャ概要         | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 更新対象（ハンドラー一覧）  |
| Skill SDK インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | 更新対象（5型定義追加）     |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 参照必須                    |
| タスクワークフロー         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 更新対象                    |
| 実装パターン集             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 任意更新                    |
| 教訓集                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 任意更新                    |

---

## 統合テスト連携

Phase 12 ではコードの変更は行わない。Phase 9（品質検証）で実施した統合テストの結果を documentation-changelog.md に引用する。

| テスト種別     | 対応Phase | 結果参照先                                    |
| -------------- | --------- | --------------------------------------------- |
| ユニットテスト | Phase 4-7 | `outputs/phase-7/coverage-report.md`          |
| 品質検証       | Phase 9   | `outputs/phase-9/quality-gate-result.md`      |
| 手動テスト     | Phase 11  | `outputs/phase-11/integration-test-result.md` |

Phase 12 実行中に以下の統合テスト関連項目を確認する:

| 確認項目                        | 確認方法                                        | 期待結果                       |
| ------------------------------- | ----------------------------------------------- | ------------------------------ |
| IPC チャネル4本が登録されている | `grep -rn "skill:docs:" apps/desktop/src/main/` | 4チャネルが正しく登録済み      |
| Preload API が公開されている    | `grep -rn "docs" apps/desktop/src/preload/`     | 4メソッドが contextBridge 経由 |
| 型定義が共有パッケージにある    | `ls packages/shared/src/types/skill-docs.ts`    | ファイルが存在する             |
| テストが全て PASS               | `cd apps/desktop && pnpm vitest run`            | 全テスト PASS                  |

---

## 多角的チェック観点

| 観点              | チェック内容                                                                                 | 判定基準                      |
| ----------------- | -------------------------------------------------------------------------------------------- | ----------------------------- |
| 実装ガイド Part 1 | 中学生レベル概念説明に日常例え話が含まれている                                               | 1つ以上の日常例え話が記載     |
| 実装ガイド Part 2 | 型定義、APIシグネチャ、コード例が含まれている                                                | 3項目全て記載                 |
| LOGS.md           | aiworkflow-requirements/LOGS.md と task-specification-creator/LOGS.md の両方が更新           | 2ファイル両方に更新エントリ   |
| SKILL.md          | aiworkflow-requirements/SKILL.md と task-specification-creator/SKILL.md の両方の変更履歴更新 | 2ファイル両方にバージョン追記 |
| topic-map.md      | generate-index.js による再生成が実行されている                                               | 新規セクションの行番号反映    |
| 仕様書更新        | 6つの必須更新対象ファイルが全て更新されている                                                | 6ファイル全更新               |
| IPC 契約整合      | Preload 側の呼び出し形式と Main 側のハンドラ引数形式が一致（P44 対策）                       | 4チャネル全て整合             |
| セキュリティ      | 4層セキュリティ（sender検証・バリデーション・サービス検証・エラーサニタイズ）                | 全層の実装確認                |
| 未タスク          | 検出結果が記録されている（0件でも出力）                                                      | レポートファイル存在          |
| フィードバック    | スキルフィードバックが記録されている（改善なしでも出力）                                     | レポートファイル存在          |
| artifacts.json    | Phase 12 ステータスが completed に更新されている                                             | ステータス値確認              |
| 検証コマンド      | quick_validate.js で3スキル全て Error 0件                                                    | 全スキル合格                  |

---

## 成果物

| 成果物               | パス                                            | 必須   | 内容                      |
| -------------------- | ----------------------------------------------- | ------ | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | 必須   | Part 1 + Part 2 + IPC仕様 |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | 必須   | Step 1-2 の実施結果       |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | 必須   | 全更新内容の記録          |
| 未タスクレポート     | `outputs/phase-12/unassigned-task-detection.md` | 必須   | 残課題（0件でも必須）     |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 必須   | スキル改善提案            |
| 未タスク指示書       | `docs/30-workflows/unassigned-task/*.md`        | 条件付 | 未タスク検出時のみ作成    |

---

## 完了条件

### Task 1: 実装ガイド

- [ ] Part 1（中学生レベル概念説明 -- 日常例え話を含む）が作成されている
- [ ] Part 2（技術的詳細 -- TypeScript型定義・APIシグネチャ・コード例を含む）が作成されている
- [ ] テストカテゴリテーブルが `pnpm test` 実測値を反映している（P37対策）

### Task 2 Step 1: タスク完了記録

- [ ] **【Step 1-A】** `api-ipc-agent.md` にタスク完了記録が追加されている
- [ ] **【Step 1-A】** `arch-electron-services.md` に SkillDocGenerator サービスが追加されている
- [ ] **【Step 1-A】** `interfaces-agent-sdk-skill.md` にドキュメント生成型定義が追加されている
- [ ] **【Step 1-A】** `aiworkflow-requirements/LOGS.md` が更新されている
- [ ] **【Step 1-A】** `task-specification-creator/LOGS.md` が更新されている（**P1/P25対策: 2ファイル両方**）
- [ ] **【Step 1-A】** `aiworkflow-requirements/SKILL.md` 変更履歴テーブルが更新されている
- [ ] **【Step 1-A】** `task-specification-creator/SKILL.md` 変更履歴テーブルが更新されている（**P29対策**）
- [ ] **【Step 1-B】** `arch-electron-services.md` に SkillDocGenerator L2コンポーネントの実装ステータスが「完了」になっている
- [ ] **【Step 1-B】** `api-ipc-agent.md` に4チャンネルの実装ステータスが追加されている
- [ ] **【Step 1-C】** `grep` で検出された関連仕様書が更新されている
- [ ] **【Step 1-D】** `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` が再生成されている（**P2/P27対策**）

### Task 2 Step 2: システム仕様更新

- [ ] `api-ipc-agent.md` に skill:docs:\* 4チャネルの仕様が追加されている
- [ ] `security-electron-ipc.md` に skillDocs セキュリティパターンが追加されている
- [ ] `architecture-overview.md` に registerSkillDocsHandlers が IPCハンドラー登録一覧に追加されている
- [ ] `interfaces-agent-sdk-skill.md` に5型定義と完了タスク記録が追加されている
- [ ] `task-workflow.md` の残課題テーブルと完了タスクセクションが更新されている
- [ ] `arch-electron-services.md` に SkillDocGenerator を L2 コンポーネントとして設計が記録されている
- [ ] 3スキル全ての SKILL 検証（quick_validate.js）が Error 0件である

### Task 3: ドキュメント更新履歴

- [ ] `documentation-changelog.md` が作成されている
- [ ] 各 Step の完了結果が詳細に記録されている（**P4対策: 全 Step 確認前に「完了」と記載していない**）
- [ ] `artifacts.json` の Phase 12 ステータスが `completed` に更新されている
- [ ] `outputs/artifacts.json` が `artifacts.json` と同期されている
- [ ] Phase 1-12 の全成果物パスが `artifacts.json` に登録されている

### Task 4: 未タスク検出

- [ ] `unassigned-task-detection.md` が出力されている（**0件でも必須**）
- [ ] 検出された未タスクに対して3ステップが全て完了している（**P3対策: 指示書・残課題テーブル・関連仕様書リンク**）
- [ ] 未タスク指示書が `unassigned-task/` 配下に配置されている（**P38対策: tasks/ 直下は不可**）
- [ ] 未タスク指示書の物理ファイル存在を確認した（`ls docs/30-workflows/unassigned-task/`）

### Task 5: スキルフィードバック

- [ ] `skill-feedback-report.md` が出力されている（**改善点なしでも必須 -- P28対策**）

### 全体

- [ ] `spec-update-summary.md` が作成されている
- [ ] 苦戦箇所セクションを記録した（0件でも明記）
- [ ] **本 Phase 内の全タスク（5タスク）を100%実行完了**

---

## 苦戦箇所の記録【推奨】

タスク実行中に苦戦した箇所があれば、以下のテンプレートで記録する:

```markdown
## 苦戦箇所

### 1. {{問題の概要}}

- **症状**: {{発生した問題の具体的な症状}}
- **原因**: {{問題の根本原因}}
- **解決策**: {{採用した解決策}}
- **学び**: {{将来のタスクへの教訓}}
- **関連 Pitfall**: {{該当する場合は Pitfall ID（例: P31）}}
```

苦戦箇所が0件の場合でも「苦戦箇所なし（0件）」を明記する。

苦戦箇所を未タスク化する場合は P3 準拠の3ステップを実行する:

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に未タスク参照リンクを追加

---

## フォールバック手順

Step 1-A で LOGS.md/SKILL.md が見つからない場合:

1. ワークツリー環境のため、スキルディレクトリが存在しない場合がある
2. その場合は `outputs/phase-12/spec-update-summary.md` に「ワークツリー環境のためスキップ」と理由を記載する
3. メインリポジトリへのマージ後に LOGS.md/SKILL.md を更新する旨を記録する

スクリプトが存在しない場合の代替手順:

| スクリプト                   | 代替手順                                  |
| ---------------------------- | ----------------------------------------- |
| `verify-unassigned-links.js` | `grep -rn` で未タスク参照リンクを手動検証 |
| `generate-index.js`          | 手動で topic-map.md を更新                |
| `quick_validate.js`          | 手動で SKILL.md の構造とエラーを確認      |
| `complete-phase.js`          | 手動で `artifacts.json` を更新            |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] 全完了条件チェックリストを確認済み

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9I-skill-docs/phase-13-pr-creation.md`

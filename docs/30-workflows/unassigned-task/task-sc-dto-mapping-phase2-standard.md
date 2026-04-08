# IPC DTO マッピング Phase 2 必須化と artifacts.json 更新タイミング標準化 - タスク指示書

## メタ情報

```yaml
issue_number: 2064
```

## メタ情報

| 項目         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| タスクID     | TASK-SC-DTO-MAPPING-PHASE2-001                                          |
| タスク名     | IPC DTO マッピング Phase 2 必須化と artifacts.json 更新タイミング標準化 |
| 分類         | 改善                                                                    |
| 対象機能     | task-specification-creator skill / IPC チャネル追加ワークフロー         |
| 優先度       | 低                                                                      |
| 見積もり規模 | 小規模                                                                  |
| ステータス   | 未着手                                                                  |
| 発見元       | TASK-SC-13 Phase 12 スキルフィードバックレポート                        |
| 発見日       | 2026-04-08                                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SC-13（`skill-creator:verify` チャネル実装）の Phase 12 フィードバックとして、
IPC チャネル追加ワークフローに関して3点の設計漂流リスクが確認された。

### 1.2 問題点・課題

**問題1: DTO 変換ルールが Phase 2 で未定義**

- 内部型（例: `RuntimeSkillCreatorVerifyCheck`）から公開 DTO（例: `VerifyCheckResult`）への
  変換マッピングが Phase 2 設計書に明記されていない
- 実装者が Phase 5 で変換ロジックを「その場で判断」するため、設計から実装が乖離しやすい
- レビュアーも変換の正しさを確認する基準がない

**問題2: skillName → skillDir 解決レイヤが Phase 2 で未明示**

- 公開 surface は `skillName`（ユーザー向け識別子）を受けるが、
  内部 engine は `skillDir`（ファイルシステムパス）を要求するケースがある
- この解決レイヤ（`SkillLocator.resolveSkillDir` 等）を Phase 2 で明示しないと
  実装者が Facade 内でアドホックに解決し、責務境界が曖昧になる

**問題3: artifacts.json の status 更新タイミングが不明確**

- コード実装完了（Phase 5）と文書生成完了（Phase 12）で
  `artifacts.json` の status をどのタイミングで更新すべきかルールがない
- 運用者によって更新タイミングがバラバラになり、
  Phase 完了判定の根拠となる artifacts.json の信頼性が低下する

### 1.3 放置した場合の影響

- IPC チャネル追加タスクのたびに DTO 変換ロジックが属人的に決定される
- Phase 2 と Phase 5 の実装が乖離し、設計書の形骸化が進む
- artifacts.json の status が信頼できなくなり、Phase-12 完了判定の自動化が困難になる

---

## 2. 何を達成するか（What）

### 2.1 目的

task-specification-creator skill の IPC チャネル追加ワークフローを改善し、
DTO 変換定義・解決レイヤ明示・artifacts.json 更新タイミングを標準化する。

### 2.2 最終ゴール

- Phase 2（設計）成果物テンプレートに「内部型 → 公開 DTO 変換マッピング表」を必須化
- Phase 2 成果物テンプレートに「public surface の引数解決レイヤ（skillName → skillDir 等）」の記述欄を追加
- `artifacts.json` の status 更新タイミングを Phase 5 完了時と Phase 12 完了時の2段階に明文化
- LOGS.md への変更記録

### 2.3 スコープ

#### 含むもの

- `.claude/skills/task-specification-creator/references/` 配下のワークフロー/設計テンプレート更新
- `artifacts.json` の status 更新ルールをガイドラインに追加
- LOGS.md への変更記録

#### 含まないもの

- 既存タスク仕様書への遡及適用
- artifacts.json の自動更新スクリプト実装
- SkillLocator 等の内部実装変更

### 2.4 成果物

| 成果物                        | パス                                                                       |
| ----------------------------- | -------------------------------------------------------------------------- |
| IPC 設計テンプレート更新      | `.claude/skills/task-specification-creator/references/` 配下の関連ファイル |
| artifacts.json 更新ルール追加 | `.claude/skills/task-specification-creator/references/` 配下のガイドライン |
| LOGS.md 変更記録              | `.claude/skills/task-specification-creator/LOGS.md`                        |

---

## 3. 苦戦箇所（Lessons Learned）

### TASK-SC-13 での発見

| 箇所                                 | 困難度 | 内容                                                                        | 解決方法                                                        |
| ------------------------------------ | ------ | --------------------------------------------------------------------------- | --------------------------------------------------------------- |
| skillName → skillDir 解決            | 中     | 公開 surface は `skillName` を受けるが、内部 engine は `skillDir` を要求    | `SkillLocator.resolveSkillDir(skillName, cwd)` を Facade で実装 |
| DTO 変換ルール不明確                 | 中     | `RuntimeSkillCreatorVerifyCheck` → `VerifyCheckResult` への変換規則が未定義 | Phase 2 成果物で変換マッピングテーブルを作成                    |
| artifacts.json status 更新タイミング | 低     | Phase 5 完了と Phase 12 完了で別々に更新する必要があり、順序が不明確        | step-by-step の更新チェックリストを追加                         |

### アーキテクチャパターンの発見

- **Facade パターンにおける 2層 API**（公開 vs 内部）は、
  Phase 2 で明示的に分離して設計しないと実装時に責務が混在する
- 変換レイヤ（DTO mapping）を `shared / preload / main / DTO mapping` の4番目の層として
  Phase 2 テンプレートで扱うと再発を防止できる

---

## 4. 実装ステップ

### Phase 1: 要件定義

- 現在のワークフロー・設計テンプレートを読んで不足箇所を特定する
- DTO マッピング必須化の具体的な記述方法を決定する
- artifacts.json 更新タイミングの2段階ルールを定義する

### Phase 2: 設計

- テンプレートの変更箇所を特定する
- 追加する記述欄のフォーマットを設計する

### Phase 5: 実装

- テンプレートファイルを更新する（DTO マッピング表・引数解決レイヤ記述欄）
- artifacts.json 更新ルールをガイドラインに追記する
- LOGS.md に変更を記録する

### Phase 12: ドキュメント更新

- 変更内容を implementation-guide.md に記録する
- 改善効果を skill-feedback-report.md に記録する

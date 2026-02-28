# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 10                         |
| Phase名    | 最終レビューゲート         |
| タスクID   | TASK-9I                    |
| 前提Phase  | Phase 9（品質保証）        |
| 後続Phase  | Phase 11（手動テスト検証） |
| ステータス | pending                    |
| 作成日     | 2026-02-28                 |
| 機能名     | TASK-9I-skill-docs         |

---

## 目的

スキルドキュメント生成機能全体の品質・整合性を8項目のレビュー観点で最終検証し、手動テストフェーズに進む前に品質を保証する。
要件から実装までの一貫性を、機能完全性・セキュリティ・型安全性・テスト品質・コード品質・エラーハンドリング・IPC契約・LLM連携リスクの8観点で確認する。

## 背景

スキルドキュメント生成機能はMain Process内の1サービス（SkillDocGenerator）と4つのIPCハンドラーで構成される。
LLMを使ったドキュメント生成という外部依存を持ち、レスポンス品質・エラーハンドリング・セキュリティの観点が特に重要である。
UI層はスコープ外であるためUI/UXレビューは対象外とし、バックエンド品質に集中する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 8項目レビュー実施

**目的**: スキルドキュメント生成機能を8項目のレビュー観点で多角的に検証する

**実行手順**:

1. 全対象ファイルを読み込む
2. 8項目のレビュー観点テーブルに基づいて順次検証する
3. 各観点の結果（OK / 指摘あり）を記録する
4. 指摘がある場合は重要度（MINOR / MAJOR / CRITICAL）を判定する

**8項目レビュー観点テーブル**:

| #   | レビュー観点       | 確認内容                                                                                                                                               | 結果 | 指摘 |
| --- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- | ---- |
| 1   | 機能完全性         | 4 IPCチャネル（skill:docs:generate/preview/export/templates）が全て実装・テスト済み、Markdown/HTML/PDF出力・日英切り替え・カスタムセクションが動作する | -    | -    |
| 2   | セキュリティ       | 全4チャネルにvalidateIpcSender、3段バリデーション（generate/preview/export）、エラーサニタイズ、exportのパストラバーサル防止                           | -    | -    |
| 3   | 型安全性           | TypeScript strict準拠、any型不使用、as型アサーション不使用、共有型定義（skill-docs.ts）がMain/Preload両層で正しく参照される                            | -    | -    |
| 4   | テスト品質         | カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）、境界値テスト（空文字列・スペースのみ・超長文字列）含む                                    | -    | -    |
| 5   | コード品質         | Lint/型チェッククリア、未使用import排除、命名規則準拠、SOLID原則適用済み                                                                               | -    | -    |
| 6   | エラーハンドリング | 全エラーパスでsanitizeErrorMessageが適用され、内部パスやスタックトレースを漏洩しない                                                                   | -    | -    |
| 7   | IPC契約            | ハンドラー引数形式とPreload呼び出し形式の一致（P44対策）、引数名セマンティクスの一致（P45対策）                                                        | -    | -    |
| 8   | LLM連携リスク      | LLM応答タイムアウト設計、queryFn DI実装、LLM応答フォーマットエラー時のフォールバック                                                                   | -    | -    |

---

### タスク2: セキュリティ詳細レビュー

**目的**: セキュリティ観点をさらに深掘りし、ドキュメント生成機能固有の攻撃ベクトルに対する防御を検証する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` のdocs関連4ハンドラーを読み込む
2. セキュリティレビューマトリクスの全項目を検証する
3. `apps/desktop/src/main/services/skill/SkillDocGenerator.ts` のLLM呼び出しレビューを実施する
4. `apps/desktop/src/preload/skill-api.ts` のPreload API側もレビューする

**セキュリティレビューマトリクス**:

| チャネル               | validateIpcSender | sanitizeError | getAllowedWindows | IPC_CHANNELS定数 | 3段バリデーション |
| ---------------------- | ----------------- | ------------- | ----------------- | ---------------- | ----------------- |
| `skill:docs:generate`  | -                 | -             | -                 | -                | -                 |
| `skill:docs:preview`   | -                 | -             | -                 | -                | -                 |
| `skill:docs:export`    | -                 | -             | -                 | -                | -                 |
| `skill:docs:templates` | -                 | -             | -                 | -                | N/A               |

**ドキュメント生成機能固有のセキュリティ検証**:

| 攻撃ベクトル                           | 対策確認内容                                                     | 結果 |
| -------------------------------------- | ---------------------------------------------------------------- | ---- |
| exportのパストラバーサル               | outputPathに `../../etc/passwd` 等のトラバーサルパスが拒否される | -    |
| 存在しないスキル名での生成試行         | SkillDocGenerator内でスキル存在確認が行われ、エラーが返される    | -    |
| 超長文字列によるバッファオーバーフロー | skillName/outputPathの長さ制限が実装されている                   | -    |
| LLM応答のインジェクション              | LLM応答がサニタイズされてからドキュメントに埋め込まれる          | -    |
| エラーメッセージによる内部情報漏洩     | 全catchブロックでsanitizeErrorMessage()が適用されている          | -    |

**期待される成果物**:

- `outputs/phase-10/security-review.md`

---

### タスク3: 型安全性・IPC契約レビュー

**目的**: Preload型定義とMainハンドラーの型が完全整合し、IPC契約にドリフトがないことを確認する

**実行手順**:

1. `apps/desktop/src/preload/types.ts` のdocs関連型定義を読み込む
2. `apps/desktop/src/main/ipc/skillHandlers.ts` のdocsハンドラー引数・戻り値型と比較する
3. P44対策として、ハンドラー引数形式とPreload側の呼び出し形式が一致していることを確認する
4. P45対策として、引数名のセマンティクスが実際に渡される値と一致していることを確認する
5. `packages/shared/src/types/skill-docs.ts` の型が全レイヤーで一貫して使用されていることを確認する

**型整合性マトリクス**:

| メソッド        | Preload引数型            | Main引数型               | Preload戻り値型 | Main戻り値型  | 整合 |
| --------------- | ------------------------ | ------------------------ | --------------- | ------------- | ---- |
| generateDocs    | DocGenerationRequest     | DocGenerationRequest     | GeneratedDoc    | GeneratedDoc  | -    |
| previewDocs     | { skillName, template? } | { skillName, template? } | GeneratedDoc    | GeneratedDoc  | -    |
| exportDocs      | { doc, outputPath }      | { doc, outputPath }      | void            | void          | -    |
| getDocTemplates | なし                     | なし                     | DocTemplate[]   | DocTemplate[] | -    |

**IPC契約チェック（ipc-contract-checklist.md Phase 1-6）**:

| Phase | チェック項目               | 確認内容                                                              | 結果 |
| ----- | -------------------------- | --------------------------------------------------------------------- | ---- |
| 1     | チャネル名統一             | `skill:docs:*` 形式で4チャネルが統一されている                        | -    |
| 2     | 引数型一致                 | PreloadとMain間の引数型が一致している                                 | -    |
| 3     | 戻り値型一致               | PreloadとMain間の戻り値型が一致している                               | -    |
| 4     | P42準拠3段バリデーション   | generate/preview/exportでtypeof → 空文字列 → trim()バリデーション実装 | -    |
| 5     | エラーレスポンスサニタイズ | sanitizeErrorMessageで全エラーが処理されている                        | -    |
| 6     | register/unregister対称    | 4チャネル全てがregister/unregisterで対になっている                    | -    |

**P32チェック（型定義の二箇所同時更新）**:

| ファイル                               | 更新状況 |
| -------------------------------------- | -------- |
| `packages/shared/src/types/index.ts`   | -        |
| `apps/desktop/src/preload/types.ts`    | -        |
| `apps/desktop/src/preload/channels.ts` | -        |

**P44/P45チェック**:

| チェック項目             | 確認内容                                                                                     | 結果 |
| ------------------------ | -------------------------------------------------------------------------------------------- | ---- |
| 引数形式一致             | ハンドラーが期待する引数形式とPreload側の渡し方が一致しているか                              | -    |
| 引数名セマンティクス一致 | 引数名（skillName, outputPath等）が実際に渡される値の意味と一致しているか                    | -    |
| 内部メソッド引数名伝搬   | SkillDocGenerator側の引数名もPreload側と一貫しているか                                       | -    |
| 型アサーション不使用     | `as` による型アサーションでバリデーションを回避していないか                                  | -    |
| 共有型利用               | DocGenerationRequest/GeneratedDoc/DocTemplate型がpackages/sharedから正しくimportされているか | -    |

**期待される成果物**:

- `outputs/phase-10/type-ipc-contract-review.md`

---

### タスク4: アーキテクチャ・LLM連携レビュー

**目的**: レイヤー依存方向・ホワイトリスト管理・LLM連携リスクを確認する

**実行手順**:

1. レイヤー依存方向（Renderer → Preload → Main）が守られていることを確認する
2. `ALLOWED_INVOKE_CHANNELS` に4チャネルが追加されていることを確認する
3. ハンドラー登録/解除が正しく実装されていることを確認する（P5対策）
4. LLM連携のリスク評価を実施する

**アーキテクチャチェックリスト**:

| チェック項目                       | 確認内容                                              | 結果 |
| ---------------------------------- | ----------------------------------------------------- | ---- |
| ホワイトリスト追加                 | `ALLOWED_INVOKE_CHANNELS` に4チャネル追加済み         | -    |
| ハンドラー登録                     | docs関連4ハンドラーが登録済み                         | -    |
| ハンドラー解除                     | unregister時に4チャネルが解除される                   | -    |
| チャンネル定数（正本と副本の一致） | `IPC_CHANNELS` のチャネル値が一致                     | -    |
| レイヤー依存方向                   | Renderer → Preload → Main の一方向依存                | -    |
| contextBridge経由                  | Renderer からの API アクセスが contextBridge 経由     | -    |
| DIP準拠（LLM呼び出し）             | queryFnがコンストラクタインジェクションで渡されている | -    |

**LLM連携リスク評価**:

| リスク項目             | 確認内容                                                        | 結果 |
| ---------------------- | --------------------------------------------------------------- | ---- |
| タイムアウト設計       | LLM呼び出しにタイムアウトが設定されている                       | -    |
| 応答フォーマットエラー | LLMが期待と異なるフォーマットを返した場合のフォールバック       | -    |
| DI実装                 | queryFnがコンストラクタインジェクションされ、テストでモック可能 | -    |
| 非同期処理             | async/awaitが正しく使用され、Promiseの未処理rejectがない        | -    |
| メモリ使用量           | 大量のドキュメント生成時にメモリが過剰に消費されない設計        | -    |

**期待される成果物**:

- `outputs/phase-10/architecture-llm-review.md`

---

### タスク5: 最終判定

**目的**: 最終レビュー結果を判定する

**実行手順**:

1. タスク1〜4の結果を統合する
2. 問題を重要度別に分類する
3. 判定結果（PASS / MINOR / MAJOR / CRITICAL）を決定する
4. MINOR判定の場合は未タスク仕様書を作成する

**判定基準**:

| 判定     | 条件                                                 | 次のアクション                                      |
| -------- | ---------------------------------------------------- | --------------------------------------------------- |
| PASS     | 全8項目のレビュー観点で問題なし                      | Phase 11 へ進行                                     |
| MINOR    | 軽微な指摘あり（機能・セキュリティに影響なし）       | 未タスク仕様書に変換後、Phase 11 へ（**省略不可**） |
| MAJOR    | 重大な問題あり（セキュリティ・機能に影響）           | 影響範囲に応じて Phase 1-5 へ戻る                   |
| CRITICAL | 致命的な問題あり（パストラバーサル脆弱性・情報漏洩） | Phase 1 へ戻り要件再確認                            |

**MINOR判定時の未タスク化手順**（省略不可）:

1. 指摘内容を `docs/30-workflows/unassigned-task/` に指示書として作成する
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

> **注意**: 「機能影響なし」であっても MINOR 指摘の未タスク化は省略不可（05-task-execution.md準拠）

**戻り先決定基準**:

| 問題の種類                    | 戻り先                |
| ----------------------------- | --------------------- |
| セキュリティ要件の未充足      | Phase 1（要件定義）   |
| IPCインターフェース設計の問題 | Phase 2（設計）       |
| テスト設計の不足              | Phase 4（テスト作成） |
| 実装の問題（ロジックエラー）  | Phase 5（実装）       |
| コード品質の問題              | Phase 8（リファクタ） |

**レビュー結果サマリー**:

| #   | レビュー観点       | 結果 | 指摘事項 | 重要度 |
| --- | ------------------ | ---- | -------- | ------ |
| 1   | 機能完全性         | -    | -        | -      |
| 2   | セキュリティ       | -    | -        | -      |
| 3   | 型安全性           | -    | -        | -      |
| 4   | テスト品質         | -    | -        | -      |
| 5   | コード品質         | -    | -        | -      |
| 6   | エラーハンドリング | -    | -        | -      |
| 7   | IPC契約            | -    | -        | -      |
| 8   | LLM連携リスク      | -    | -        | -      |
| -   | **最終判定**       | -    | -        | -      |

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-10/open-items.md`（MINOR指摘がある場合）

---

## 参照資料

| 参照資料              | パス                                                             | 内容                   |
| --------------------- | ---------------------------------------------------------------- | ---------------------- |
| SkillDocGenerator     | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`      | ドキュメント生成実装   |
| IPCハンドラー         | `apps/desktop/src/main/ipc/skillHandlers.ts`                     | Main Processハンドラー |
| ドキュメント型定義    | `packages/shared/src/types/skill-docs.ts`                        | 共有型定義             |
| Preload API           | `apps/desktop/src/preload/skill-api.ts`                          | Preload API実装        |
| Preload型定義         | `apps/desktop/src/preload/types.ts`                              | 型定義                 |
| チャンネル定数        | `apps/desktop/src/preload/channels.ts`                           | チャンネル定義         |
| テストファイル        | `apps/desktop/src/main/services/skill/SkillDocGenerator.test.ts` | ユニットテスト         |
| IPCテストファイル     | `apps/desktop/src/main/ipc/skillHandlers.docs.test.ts`           | IPCハンドラーテスト    |
| Phase 9品質ゲート結果 | `outputs/phase-9/quality-gate-result.md`                         | 品質検証結果           |
| Phase 1要件仕様       | `outputs/phase-1/`                                               | 要件                   |
| Phase 2設計           | `outputs/phase-2/`                                               | 設計                   |
| Phase 5実装成果物     | `outputs/phase-5/`                                               | 実装コード・実装記録   |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                        | 内容                                       |
| ------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| API IPC仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPCチャネル命名、引数契約、戻り値契約      |
| Skillインターフェース    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Renderer-Preload-Main間のSkill API契約     |
| Electron APIセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | contextBridge、ホワイトリスト、公開API制約 |
| Electron IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | ipcMain.handle/on運用差分、Sender検証      |
| Skill IPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | safeInvoke/safeOn運用、Skill API防御       |
| 入力バリデーション仕様   | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`            | P42 準拠の入力検証                         |
| IPC契約チェックリスト    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | P23/P32/P42/P44/P45検証                    |
| IPC型不整合解決          | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`            | 型不整合分類と解消手順                     |
| 実装パターン             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC拡張とPreload API設計                   |
| Electronサービス設計     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main Process責務分離                       |
| 品質基準                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質ゲートとテスト要件                     |
| エラーハンドリング       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | IPC失敗時のエラー契約                      |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                                        | P5/P32/P44/P45再発防止                     |
| 教訓集                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 同種タスク失敗例と予防策                   |

---

## 成果物

| 成果物                      | パス                                           | 内容                      |
| --------------------------- | ---------------------------------------------- | ------------------------- |
| セキュリティレビュー        | `outputs/phase-10/security-review.md`          | セキュリティ検証結果      |
| 型安全性・IPC契約レビュー   | `outputs/phase-10/type-ipc-contract-review.md` | 型整合性・IPC契約確認結果 |
| アーキテクチャ・LLMレビュー | `outputs/phase-10/architecture-llm-review.md`  | 構成・LLM連携リスク評価   |
| 最終判定                    | `outputs/phase-10/final-review-result.md`      | 判定結果                  |
| 残課題一覧                  | `outputs/phase-10/open-items.md`               | MINOR指摘の詳細（該当時） |

---

## 統合テスト連携

> 最終レビューで統合テスト結果を確認する

| 確認項目                | 基準                                                 |
| ----------------------- | ---------------------------------------------------- |
| 全テスト                | 100% パス                                            |
| SkillDocGeneratorテスト | generate/preview/export/templatesテスト全件PASS      |
| IPCハンドラーテスト     | 4チャネル全て正常動作確認済み                        |
| セキュリティテスト      | sender検証・バリデーション・エラーサニタイズ確認済み |
| バリデーションテスト    | P42準拠3段バリデーション全チャネル確認済み           |

---

## 多角的チェック観点

| #   | 観点               | 確認ポイント                                                                                                |
| --- | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| 1   | 機能完全性         | 4チャネル全実装、Markdown/HTML/PDF出力、日英切り替え、カスタムセクション、デフォルトテンプレート7セクション |
| 2   | セキュリティ       | validateIpcSender全適用、3段バリデーション、sanitizeErrorMessage、exportパストラバーサル防止                |
| 3   | 型安全性           | TypeScript strict、any型不使用、as不使用、5インターフェース完全、共有型定義の一貫参照                       |
| 4   | テスト品質         | カバレッジ基準達成、境界値・異常系テスト含む、P41対策（インライン関数カバレッジ）                           |
| 5   | コード品質         | Lint/型チェッククリア、命名規則準拠、SOLID原則適用                                                          |
| 6   | エラーハンドリング | 全エラーパスでユーザーフレンドリーメッセージ、内部情報非漏洩                                                |
| 7   | IPC契約            | P44/P45対策、引数形式一致、引数名セマンティクス一致、ipc-contract-checklist Phase 1-6全検証                 |
| 8   | LLM連携リスク      | タイムアウト設計、応答フォーマットフォールバック、queryFn DI、非同期処理安全性                              |

---

## 完了条件

- [ ] 8項目のレビュー観点で全ての検証が完了している
- [ ] IPC契約チェックリスト Phase 1-6が全て検証されている
- [ ] セキュリティ4層（Sender検証 → 引数バリデーション → 内部サービス検証 → エラーサニタイズ）が全て検証されている
- [ ] ドキュメント生成機能固有のセキュリティ検証（5項目）が完了している
- [ ] 型安全性レビューで型不整合がない（any/as/@ts-ignore使用ゼロ）
- [ ] 5インターフェース（DocGenerationRequest/GeneratedDoc/DocTemplate/DocSection/DocExportOptions）の型定義が完全である
- [ ] IPC契約レビューでP44/P45対策が確認済みである
- [ ] テストカバレッジが最低基準（Line 80%/Branch 60%/Function 80%）を満たしている
- [ ] テスト件数が実際のテストファイルからカウントされている（P37対策）
- [ ] アーキテクチャレビューでホワイトリスト・登録/解除が正しい
- [ ] LLM連携リスク評価が完了している
- [ ] 最終判定が PASS または MINOR である
- [ ] MINOR判定の場合は未タスク仕様書が3ステップ全完了で作成されている
- [ ] PASS/MINOR/MAJOR/CRITICAL判定が記録されている
- [ ] 判定根拠が明記されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（4〜5ファイル）が全て生成されていることを確認
- [ ] 判定結果がPASS/MINORであることを確認

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11（手動テスト検証）へ進む（PASS/MINOR の場合）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9I-skill-docs/phase-11-manual-test.md`

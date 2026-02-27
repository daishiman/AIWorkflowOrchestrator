# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 10                         |
| Phase名    | 最終レビューゲート         |
| タスクID   | TASK-9A                    |
| 前提Phase  | Phase 9（品質保証）        |
| 後続Phase  | Phase 11（手動テスト検証） |
| ステータス | 未着手                     |
| 作成日     | 2026-02-26                 |
| 機能名     | TASK-9A-skill-editor       |

---

## 目的

スキルエディター機能全体の品質・整合性を10項目のレビュー観点で最終検証し、手動テストフェーズに進む前に品質を保証する。
要件から実装までの一貫性を、機能完全性・セキュリティ・型安全性・アーキテクチャ・コード品質・テスト・パフォーマンス・ドキュメント・UI/UX・IPC契約の10観点で確認する。

## 背景

スキルエディター機能はファイルシステムへの読み書きを伴うセキュリティ敏感な機能である。
3つのサブタスク（TASK-9A-A / 9A-B / 9A-C）の成果物がプロジェクト全体のセキュリティルール（04-electron-security.md）とアーキテクチャルール（01-architecture.md）に準拠していることを最終保証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 10項目レビュー実施

**目的**: スキルエディター機能を10項目のレビュー観点で多角的に検証する

**実行手順**:

1. 全対象ファイルを読み込む
2. 10項目のレビュー観点テーブルに基づいて順次検証する
3. 各観点の結果（OK / 指摘あり）を記録する
4. 指摘がある場合は重要度（MINOR / MAJOR / CRITICAL）を判定する

**10項目レビュー観点テーブル**:

| #   | レビュー観点       | 確認内容                                                                                                         | 結果 | 指摘 |
| --- | ------------------ | ---------------------------------------------------------------------------------------------------------------- | ---- | ---- |
| 1   | 機能完全性         | 6 IPCチャンネル（readFile, writeFile, createFile, deleteFile, listBackups, restoreBackup）が全て実装・テスト済み | -    | -    |
| 2   | コード品質         | TypeScript strict準拠、any型不使用、未使用import排除                                                             | -    | -    |
| 3   | テスト品質         | カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）、境界値テスト含む                                    | -    | -    |
| 4   | セキュリティ       | 全6チャンネルにvalidateIpcSender、パストラバーサル防止、エラーサニタイズ、読み取り専用パス保護                   | -    | -    |
| 5   | パフォーマンス     | ファイルツリー走査が`~/.aiworkflow/skills/`と`~/.claude/skills/`に対して効率的に動作する                         | -    | -    |
| 6   | ドキュメント整合性 | Preload型定義（`types.ts`）とMainハンドラーの引数・戻り値型が完全一致                                            | -    | -    |
| 7   | エラーハンドリング | 全エラーパスでユーザーフレンドリーなメッセージを返し、内部情報を漏洩しない                                       | -    | -    |
| 8   | UI/UX              | Apple HIG準拠、アクセシビリティ（WCAG 2.1 AA）、キーボード操作対応                                               | -    | -    |
| 9   | データ整合性       | バックアップファイルの整合性（作成・一覧・復元の一貫性）                                                         | -    | -    |
| 10  | IPC契約            | ハンドラー引数形式とPreload呼び出し形式の一致（P44/P45対策）                                                     | -    | -    |

---

### タスク2: セキュリティ詳細レビュー

**目的**: セキュリティ観点をさらに深掘りし、攻撃パターンに対する防御を検証する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillFileHandlers.ts` の全6ハンドラーを読み込む
2. セキュリティレビューマトリクスの全項目を検証する
3. パストラバーサル攻撃パターンに対するテスト有無を確認する
4. `apps/desktop/src/preload/skill-api.ts` のPreload API側もレビューする

**セキュリティレビューマトリクス**:

| チャンネル            | validateIpcSender | パス検証 | sanitizeError | getAllowedWindows | IPC_CHANNELS定数 | 3段バリデーション |
| --------------------- | ----------------- | -------- | ------------- | ----------------- | ---------------- | ----------------- |
| `skill:readFile`      | -                 | -        | -             | -                 | -                | -                 |
| `skill:writeFile`     | -                 | -        | -             | -                 | -                | -                 |
| `skill:createFile`    | -                 | -        | -             | -                 | -                | -                 |
| `skill:deleteFile`    | -                 | -        | -             | -                 | -                | -                 |
| `skill:listBackups`   | -                 | -        | -             | -                 | -                | -                 |
| `skill:restoreBackup` | -                 | -        | -             | -                 | -                | -                 |

**パストラバーサル攻撃パターン検証**:

| 攻撃パターン                 | テスト有無 | 期待される動作                       |
| ---------------------------- | ---------- | ------------------------------------ |
| `../../../etc/passwd`        | -          | エラーを返しファイルにアクセスしない |
| `..\\..\\windows\\system32`  | -          | エラーを返しファイルにアクセスしない |
| `./../../sensitive`          | -          | エラーを返しファイルにアクセスしない |
| `%2e%2e%2f`（URLエンコード） | -          | エラーを返しファイルにアクセスしない |

**ファイル操作パス保護検証**:

| 操作対象パス            | readFile | writeFile | createFile | deleteFile |
| ----------------------- | -------- | --------- | ---------- | ---------- |
| `~/.aiworkflow/skills/` | 許可     | 許可      | 許可       | 許可       |
| `~/.claude/skills/`     | 許可     | **拒否**  | **拒否**   | **拒否**   |
| 上記以外のパス          | **拒否** | **拒否**  | **拒否**   | **拒否**   |

**期待される成果物**:

- `outputs/phase-10/security-review.md`

---

### タスク3: 型安全性・IPC契約レビュー

**目的**: Preload型定義とMainハンドラーの型が完全整合し、IPC契約にドリフトがないことを確認する

**実行手順**:

1. `apps/desktop/src/preload/types.ts` の新規追加型を読み込む
2. `apps/desktop/src/main/ipc/skillFileHandlers.ts` のハンドラー引数・戻り値型と比較する
3. P44対策として、ハンドラー引数形式とPreload側の呼び出し形式が一致していることを確認する
4. P45対策として、引数名のセマンティクスが実際に渡される値と一致していることを確認する

**型整合性マトリクス**:

| メソッド      | Preload引数型 | Main引数型 | Preload戻り値型 | Main戻り値型 | 整合 |
| ------------- | ------------- | ---------- | --------------- | ------------ | ---- |
| readFile      | -             | -          | -               | -            | -    |
| writeFile     | -             | -          | -               | -            | -    |
| createFile    | -             | -          | -               | -            | -    |
| deleteFile    | -             | -          | -               | -            | -    |
| listBackups   | -             | -          | -               | -            | -    |
| restoreBackup | -             | -          | -               | -            | -    |

**IPC契約チェック（P44/P45対策）**:

| チェック項目             | 確認内容                                                        | 結果 |
| ------------------------ | --------------------------------------------------------------- | ---- |
| 引数形式一致             | ハンドラーが期待する引数形式とPreload側の渡し方が一致しているか | -    |
| 引数名セマンティクス一致 | 引数名（例: skillName）が実際に渡される値の意味と一致しているか | -    |
| 内部メソッド引数名伝搬   | SkillFileManager側の引数名もPreload側と一貫しているか           | -    |
| 型アサーション不使用     | `as` による型アサーションでバリデーションを回避していないか     | -    |

**P32チェック（型定義の二箇所同時更新）**:

| ファイル                               | 更新状況 |
| -------------------------------------- | -------- |
| `packages/shared/src/ipc/channels.ts`  | -        |
| `apps/desktop/src/preload/types.ts`    | -        |
| `apps/desktop/src/preload/channels.ts` | -        |

**期待される成果物**:

- `outputs/phase-10/type-ipc-contract-review.md`

---

### タスク4: アーキテクチャ・UI/UXレビュー

**目的**: レイヤー依存方向・ホワイトリスト管理・UI/UX品質を確認する

**実行手順**:

1. レイヤー依存方向（Renderer → Preload → Main）が守られていることを確認する
2. `ALLOWED_INVOKE_CHANNELS` に6チャンネルが追加されていることを確認する
3. `unregisterSkillHandlers()` に6チャンネルの解除が追加されていることを確認する
4. SkillEditorコンポーネントがApple HIG準拠であることを確認する
5. アクセシビリティ要件（WCAG 2.1 AA）を確認する

**アーキテクチャチェックリスト**:

| チェック項目                       | 確認内容                                               | 結果 |
| ---------------------------------- | ------------------------------------------------------ | ---- |
| ホワイトリスト追加                 | `ALLOWED_INVOKE_CHANNELS` に6チャンネル追加済み        | -    |
| ハンドラー登録                     | `registerSkillHandlers()` に6ハンドラー追加済み        | -    |
| ハンドラー解除                     | `unregisterSkillHandlers()` に6チャンネル追加済み      | -    |
| チャンネル定数（正本と副本の一致） | `packages/shared` と `apps/desktop` のチャンネル値一致 | -    |
| レイヤー依存方向                   | Renderer → Preload → Main の一方向依存                 | -    |
| contextBridge経由                  | Renderer からの API アクセスが contextBridge 経由      | -    |

**UI/UXチェックリスト**:

| チェック項目     | 確認内容                                               | 結果 |
| ---------------- | ------------------------------------------------------ | ---- |
| Apple HIG準拠    | Clarity / Deference / Depth の3原則に準拠              | -    |
| カラーパレット   | Apple HIG System Colors を使用（Tailwind Slate不使用） | -    |
| コントラスト比   | 通常テキスト 4.5:1 以上、大テキスト/UI部品 3:1 以上    | -    |
| キーボード操作   | 全機能にキーボードでアクセス可能                       | -    |
| ARIAラベル       | ファイルツリー・エディター・ボタンにARIAラベル付与     | -    |
| インタラクション | ホバー・アクティブ・フォーカス状態のフィードバックあり | -    |
| 破壊的操作保護   | ファイル削除時に確認ダイアログ表示                     | -    |
| スペーシング     | 8pxグリッド準拠                                        | -    |

**期待される成果物**:

- `outputs/phase-10/architecture-uiux-review.md`

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
| PASS     | 全10項目のレビュー観点で問題なし                     | Phase 11 へ進行                                     |
| MINOR    | 軽微な指摘あり（機能・セキュリティに影響なし）       | 未タスク仕様書に変換後、Phase 11 へ（**省略不可**） |
| MAJOR    | 重大な問題あり（セキュリティ・機能に影響）           | 影響範囲に応じて Phase 1-5 へ戻る                   |
| CRITICAL | 致命的な問題あり（データ漏洩・パストラバーサル突破） | Phase 1 へ戻り要件再確認                            |

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
| 2   | コード品質         | -    | -        | -      |
| 3   | テスト品質         | -    | -        | -      |
| 4   | セキュリティ       | -    | -        | -      |
| 5   | パフォーマンス     | -    | -        | -      |
| 6   | ドキュメント整合性 | -    | -        | -      |
| 7   | エラーハンドリング | -    | -        | -      |
| 8   | UI/UX              | -    | -        | -      |
| 9   | データ整合性       | -    | -        | -      |
| 10  | IPC契約            | -    | -        | -      |
| -   | **最終判定**       | -    | -        | -      |

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

---

## 参照資料

| 参照資料              | パス                                                             | 内容                   |
| --------------------- | ---------------------------------------------------------------- | ---------------------- |
| SkillFileManager      | `apps/desktop/src/main/services/skill/SkillFileManager.ts`       | サービス層実装         |
| IPCハンドラー         | `apps/desktop/src/main/ipc/skillFileHandlers.ts`                 | Main Processハンドラー |
| SkillEditor UI        | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`     | UIコンポーネント       |
| SkillCodeEditor       | `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx` | コードエディター       |
| Skill Store           | `apps/desktop/src/renderer/store/slices/skillSlice.ts`           | 状態管理               |
| Preload API           | `apps/desktop/src/preload/skill-api.ts`                          | Preload API実装        |
| Preload型定義         | `apps/desktop/src/preload/types.ts`                              | 型定義                 |
| チャンネル定数        | `apps/desktop/src/preload/channels.ts`                           | チャンネル定義         |
| 共有チャンネル定数    | `packages/shared/src/ipc/channels.ts`                            | 共有チャンネル定義     |
| テストファイル        | `apps/desktop/src/main/ipc/__tests__/skillFileHandlers*.test.ts` | IPCテスト              |
| Phase 9品質ゲート結果 | `outputs/phase-9/quality-gate-result.md`                         | 品質検証結果           |
| Phase 1要件仕様       | `outputs/phase-1/requirements-definition.md`                     | 要件                   |
| Phase 2設計           | `outputs/phase-2/architecture-design.md`                         | 設計                   |
| Phase 5実装成果物     | `outputs/phase-5/`                                               | 実装コード・実装記録   |

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                                        | 内容                |
| ------------------- | ------------------------------------------------------------------------------------------- | ------------------- |
| セキュリティAPI仕様 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | IPC通信セキュリティ |
| セキュリティ原則    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ    |
| エラーハンドリング  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ      |
| アーキテクチャ概要  | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | レイヤー構成        |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DIパターン、品質    |

---

## 成果物

| 成果物                        | パス                                           | 内容                      |
| ----------------------------- | ---------------------------------------------- | ------------------------- |
| セキュリティレビュー          | `outputs/phase-10/security-review.md`          | セキュリティ検証結果      |
| 型安全性・IPC契約レビュー     | `outputs/phase-10/type-ipc-contract-review.md` | 型整合性・IPC契約確認結果 |
| アーキテクチャ・UI/UXレビュー | `outputs/phase-10/architecture-uiux-review.md` | 構成・UI品質検証結果      |
| 最終判定                      | `outputs/phase-10/final-review-result.md`      | 判定結果                  |

---

## 統合テスト連携

> 最終レビューで統合テスト結果を確認する

| 確認項目                 | 基準                                                    |
| ------------------------ | ------------------------------------------------------- |
| 全テスト                 | 100% パス                                               |
| IPCハンドラー連携        | 6チャンネル全て正常動作確認済み                         |
| セキュリティテスト       | パストラバーサル・sender検証・エラーサニタイズ確認済み  |
| UIコンポーネントテスト   | SkillEditor/SkillCodeEditorレンダリング・操作テスト済み |
| バックアップ整合性テスト | 作成→一覧→復元の一貫性確認済み                          |

---

## 多角的チェック観点

| #   | 観点               | 確認ポイント                                                                              |
| --- | ------------------ | ----------------------------------------------------------------------------------------- |
| 1   | 機能完全性         | 6チャンネル全実装、ファイルツリー表示、SKILL.md編集、バックアップ操作                     |
| 2   | コード品質         | TypeScript strict、any型不使用、未使用import排除、命名規則準拠                            |
| 3   | テスト品質         | カバレッジ基準達成、境界値・異常系テスト含む                                              |
| 4   | セキュリティ       | validateIpcSender全適用、パストラバーサル防止、sanitizeErrorMessage、読み取り専用パス保護 |
| 5   | パフォーマンス     | ファイルツリー走査の効率性、不要な再レンダリング防止                                      |
| 6   | ドキュメント整合性 | Preload型とMainハンドラー型の完全整合、P32チェック済み                                    |
| 7   | エラーハンドリング | 全エラーパスでユーザーフレンドリーメッセージ、内部情報非漏洩                              |
| 8   | UI/UX              | Apple HIG準拠、WCAG 2.1 AA、キーボード操作、ARIAラベル                                    |
| 9   | データ整合性       | バックアップ作成→一覧→復元の一貫性                                                        |
| 10  | IPC契約            | P44/P45対策、引数形式一致、引数名セマンティクス一致                                       |

---

## 完了条件

- [ ] 10項目のレビュー観点で全ての検証が完了している
- [ ] セキュリティレビューで全6ハンドラーが要件を満たしている
- [ ] 型安全性レビューで型不整合がない
- [ ] IPC契約レビューでP44/P45対策が確認済みである
- [ ] アーキテクチャレビューでホワイトリスト・登録/解除が正しい
- [ ] UI/UXレビューでApple HIG準拠・WCAG 2.1 AA準拠が確認済みである
- [ ] テストカバレッジ目標を達成している
- [ ] 最終判定が PASS または MINOR である
- [ ] MINOR判定の場合は未タスク仕様書が3ステップ全完了で作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（4ファイル）が全て生成されていることを確認
- [ ] 判定結果がPASS/MINORであることを確認

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11（手動テスト検証）へ進む（PASS/MINOR の場合）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9A-skill-editor/phase-11-manual-test.md`

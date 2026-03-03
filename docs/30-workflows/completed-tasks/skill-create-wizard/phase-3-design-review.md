# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 3                   |
| Phase名    | 設計レビュー        |
| 前提Phase  | Phase 2             |
| 後続Phase  | Phase 4             |
| ステータス | 未実施              |
| 作成日     | 2026-03-03          |
| 機能名     | skill-create-wizard |

---

## 目的

Phase 1（要件定義）・Phase 2（設計）の成果物をレビューし、実装開始前に重大な問題がないことを確認する。要件と設計の整合性・既存アーキテクチャとの整合性・セキュリティ・パフォーマンス・アクセシビリティの各観点から検証を行い、PASS/MINOR/MAJOR/CRITICALの判定を下す。

---

## 前提条件

- Phase 2成果物が全て作成・完了していること:
  - `outputs/phase-2/architecture-design.md`
  - `outputs/phase-2/api-specification.md`
- Phase 1成果物が参照可能であること:
  - `outputs/phase-1/requirements-definition.md`
  - `outputs/phase-1/acceptance-criteria.md`
  - `outputs/phase-1/scope-definition.md`

---

## 実行タスク

- レビュータスク: 要件整合・セキュリティ・性能・アクセシビリティを評価して判定する。

| No. | タスク名                     | 目的                                 | 成果物                          |
| --- | ---------------------------- | ------------------------------------ | ------------------------------- |
| 1   | 要件・設計整合性チェック     | 全要件が設計でカバーされているか確認 | `design-review-result.md`       |
| 2   | アーキテクチャ整合性チェック | 既存パターンとの乖離がないか確認     | `design-review-result.md`（続） |
| 3   | セキュリティチェック         | IPC入力バリデーション・XSS防止確認   | `design-review-result.md`（続） |
| 4   | パフォーマンスチェック       | 不要な再レンダー・メモリリーク確認   | `design-review-result.md`（続） |
| 5   | アクセシビリティチェック     | WCAG 2.1 AA準拠確認                  | `design-review-result.md`（続） |
| 6   | 判定・次Phase決定            | 総合判定を行いレビュー結果を記録     | `design-review-result.md`（続） |

---

## 参照資料

| 参照資料                   | パス                                                                                               | 内容                          |
| -------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 2 アーキテクチャ設計 | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-2/architecture-design.md`     | レビュー対象（設計）          |
| Phase 2 API仕様書          | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-2/api-specification.md`       | レビュー対象（IPC/Preload）   |
| Phase 1 要件定義書         | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-1/requirements-definition.md` | 要件整合性チェック基準        |
| Phase 1 受入基準           | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-1/acceptance-criteria.md`     | AC整合性チェック基準          |
| Phase 1 スコープ定義       | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-1/scope-definition.md`        | スコープチェック基準          |
| UI/UXコンポーネント仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                            | 既存UIパターン基準            |
| デザインシステム仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                         | CSS変数・デザイントークン基準 |
| セキュリティ仕様           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                       | IPC セキュリティ基準          |
| 実装パターン集             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`        | IPC/状態管理パターン基準      |
| アーキテクチャ概要         | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                       | レイヤー責務の整合性確認      |
| Agent SDK スキル仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                  | 型・Preload API 契約確認      |
| IPC API 仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                               | `skill:create` 契約レビュー   |
| Preload セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                       | Bridge API 公開制約確認       |
| アーキテクチャルール       | `.claude/rules/01-architecture.md`                                                                 | レイヤー依存・デザイン原則    |
| コード品質ルール           | `.claude/rules/02-code-quality.md`                                                                 | TypeScript・テスト基準        |
| 状態管理ルール             | `.claude/rules/03-state-management.md`                                                             | Zustand/Context使い分け       |
| セキュリティルール         | `.claude/rules/04-electron-security.md`                                                            | Electron IPC セキュリティ     |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                               | P27/P31/P39/P42/P44/P45/P47   |

---

## 実行手順

### Step 1: 要件・設計整合性チェック

Phase 1の各要件（FR/NFR）がPhase 2の設計でカバーされているかをチェックし、結果を `outputs/phase-3/design-review-result.md` に記載する。

#### チェックリスト 1-A: 機能要件カバレッジ

| 要件ID | 要件内容                          | 設計での対応                    | 判定 |
| ------ | --------------------------------- | ------------------------------- | ---- |
| FR-001 | 4ステップウィザード構成           | WizardStep型・currentState定義  | -    |
| FR-002 | StepIndicatorで進捗表示           | StepIndicator.tsx設計           | -    |
| FR-010 | TextAreaでスキル説明入力          | DescribeStep.tsx設計            | -    |
| FR-011 | プレースホルダーテキスト          | DescribeStep Props設計          | -    |
| FR-012 | 最小10文字でNextボタン制御        | onNext()バリデーション設計      | -    |
| FR-013 | 最大2000文字でエラー表示          | DescribeStep バリデーション設計 | -    |
| FR-020 | 3チェックボックス表示             | WizardOptions型・ConfigureStep  | -    |
| FR-030 | ローディングSpinner表示           | GenerateStep Props設計          | -    |
| FR-032 | skill.create() Preload API        | api-specification.md            | -    |
| FR-034 | 生成失敗時エラー表示・Try Again   | GenerateStep error状態設計      | -    |
| FR-040 | completeステップ完了メッセージ    | CompleteStep Props設計          | -    |
| FR-043 | Close ボタンでonClose()           | CompleteStep onClose設計        | -    |
| FR-044 | Create Another でdescribeリセット | onCreateAnother()設計           | -    |

#### チェックリスト 1-B: 非機能要件カバレッジ

| 要件ID  | 要件内容                     | 設計での対応                  | 判定 |
| ------- | ---------------------------- | ----------------------------- | ---- |
| NFR-001 | WCAG 2.1 AA アクセシビリティ | ARIAアトリビュート設計        | -    |
| NFR-002 | 不要な再レンダー防止         | useState設計（Zustand不使用） | -    |
| NFR-003 | IPC入力バリデーション（P42） | 3段バリデーション設計         | -    |
| NFR-004 | happy-dom互換（P39）         | テスト設計方針（Phase 4へ）   | -    |
| NFR-005 | TypeScript strict            | Props型定義・any禁止          | -    |

#### チェックリスト 1-C: 受入基準カバレッジ

| AC シナリオ                          | 設計での対応箇所             | 判定 |
| ------------------------------------ | ---------------------------- | ---- |
| 有効な説明入力→configureステップ遷移 | handleNext()設計             | -    |
| configureオプション設定→generate開始 | handleGenerate()設計         | -    |
| 生成成功→completeステップ自動遷移    | async/await + setCurrentStep | -    |
| Create Another→describeリセット      | onCreateAnother()設計        | -    |
| 10文字未満→Nextボタン非活性          | descriptionバリデーション    | -    |
| 2000文字超→エラーメッセージ          | DescribeStep内バリデーション | -    |
| 生成失敗→エラー表示+Try Again        | GenerateStep error状態       | -    |
| キーボード操作で全機能アクセス可能   | ARIA設計                     | -    |

### Step 2: アーキテクチャ整合性チェック

既存プロジェクトのパターンとの整合性を確認する。

#### チェックリスト 2-A: レイヤー依存関係

| チェック項目                               | 確認内容                                     | 判定 |
| ------------------------------------------ | -------------------------------------------- | ---- |
| Renderer→Preload→Main の一方向依存         | Renderer は IPC 経由のみ Main と通信         | -    |
| Renderer から Node.js API を直接使用しない | `window.electronAPI.skill.create()` 経由のみ | -    |
| contextBridge 経由の安全な API             | `skill.create()` が `safeInvoke` を使用      | -    |

#### チェックリスト 2-B: Atomic Design 準拠

| チェック項目                         | 確認内容                                 | 判定 |
| ------------------------------------ | ---------------------------------------- | ---- |
| organisms: SkillCreateWizard         | ページレベルの状態管理・ステップ切り替え | -    |
| molecules: StepIndicator, XxxStep    | 複数atomsを組み合わせた機能ユニット      | -    |
| atoms: Button, TextArea, Checkbox 等 | 既存atoms を再利用（新規作成しない）     | -    |
| ディレクトリ構成が既存パターンに準拠 | `skill/wizard/` サブディレクトリ         | -    |

#### チェックリスト 2-C: 状態管理パターン

| チェック項目                           | 確認内容                                    | 判定 |
| -------------------------------------- | ------------------------------------------- | ---- |
| ウィザード状態が useState で管理される | Zustand使用なし（他コンポーネントと非共有） | -    |
| 合成Hook（useXxxStore()）の使用がない  | P31: 無限ループ防止                         | -    |
| useEffect の依存配列が適切             | 無限ループのリスクがない設計                | -    |

#### チェックリスト 2-D: IPC パターン準拠

| チェック項目                         | 確認内容                        | 判定 |
| ------------------------------------ | ------------------------------- | ---- |
| チャネル名が IPC_CHANNELS 定数で管理 | P27: ハードコード禁止           | -    |
| safeInvoke() を使用                  | 既存パターンとの整合            | -    |
| Preload→Main の引数形式が一致        | P44: 不整合防止                 | -    |
| 引数の命名がセマンティクスと一致     | P45: `description` は説明文字列 | -    |

### Step 3: セキュリティチェック

| チェック項目                       | 確認内容                                               | 判定 |
| ---------------------------------- | ------------------------------------------------------ | ---- |
| IPC 引数の 3段バリデーション       | 型チェック→空文字列→トリム空文字列（P42）              | -    |
| エラーメッセージのサニタイズ       | 内部情報（スタックトレース等）を Renderer に漏洩しない | -    |
| XSS 防止                           | ユーザー入力をそのまま HTML として描画しない           | -    |
| パストラバーサル防止               | スキル名の文字チェック（SkillCreatorService 内部）     | -    |
| contextIsolation / nodeIntegration | BrowserWindow 設定の変更がないこと                     | -    |
| チャネルホワイトリスト管理         | allowedChannels に SKILL_CREATE が追加される           | -    |

### Step 4: パフォーマンスチェック

| チェック項目                                 | 確認内容                                         | 判定 |
| -------------------------------------------- | ------------------------------------------------ | ---- |
| チェックボックス変更が全体を再レンダーしない | WizardOptions の更新がサブコンポーネントに局所化 | -    |
| 生成処理中に UI がブロックしない             | `async/await` による非同期処理                   | -    |
| コンポーネントのメモ化が不要な規模か         | React.memo 等が過剰設計でないか                  | -    |
| isGenerating フラグが確実にリセットされる    | `finally` ブロックで確実にリセット               | -    |

### Step 5: アクセシビリティチェック

| チェック項目                     | 確認内容                                   | 判定 |
| -------------------------------- | ------------------------------------------ | ---- |
| テキストエリアに aria-label      | "Skill description" 等の明示ラベル         | -    |
| チェックボックスに関連ラベル     | `<label htmlFor>` または `aria-labelledby` | -    |
| ローディング状態の通知           | `aria-busy="true"` または `role="status"`  | -    |
| ボタンの aria-disabled           | 非活性ボタンに `aria-disabled="true"`      | -    |
| フォーカストラップがない         | モーダル外のフォーカスが明示ルールで管理   | -    |
| Tab キーのフォーカス順序が論理的 | 上から下・左から右の自然な順序             | -    |
| エラーメッセージが role="alert"  | スクリーンリーダーへの即時通知             | -    |
| コントラスト比が基準を満たす     | CSS変数値がApple HIG準拠（NFR-001）        | -    |

### Step 6: 総合判定

以下の基準で判定を行い `outputs/phase-3/design-review-result.md` に記録する。

---

## 判定基準

| 判定     | 条件                                                 | 対応                                           |
| -------- | ---------------------------------------------------- | ---------------------------------------------- |
| PASS     | 全チェック項目で重大な問題なし                       | Phase 4（テスト作成）へ進行                    |
| MINOR    | 軽微な指摘（実装時に対応可能）がある                 | 指摘事項を未タスクとして記録後、Phase 4へ進行  |
| MAJOR    | 重大な問題があり設計または要件の修正が必要           | 影響範囲に応じて Phase 1 または Phase 2 に戻る |
| CRITICAL | 致命的な問題（セキュリティ脆弱性・根本的な設計ミス） | Phase 1 に戻りユーザーと要件を再確認           |

### 戻り先決定基準

| 問題の種類                                  | 戻り先              |
| ------------------------------------------- | ------------------- |
| 要件の問題（FR/NFR/ACの欠落・矛盾）         | Phase 1（要件定義） |
| 設計の問題（アーキテクチャ・IPC設計の欠陥） | Phase 2（設計）     |

### MINOR判定時の対応【必須・省略不可】

- MINOR指摘は「機能影響なし」でも全て未タスク化する
- 未タスク化の3ステップを実行すること:
  1. `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-3/minor-issues/` に指示書を作成
  2. 未タスクリストに登録（後のPhase 12 Task 4で管理）
  3. 関連仕様書に参照リンクを追加

---

## 統合テスト連携【必須】

設計レビューでのIPC契約整合性ゲートを実施する:

| レビュー観点       | 確認項目                                              |
| ------------------ | ----------------------------------------------------- |
| IPC設計            | `skill:create` チャネルのPreload/Main引数形式の一致   |
| 状態管理設計       | ウィザード状態がローカル管理で他Sliceに干渉しないこと |
| コンポーネント境界 | onClose()コールバックの呼び出しタイミングが正確か     |
| エラー伝播         | 生成エラーがUI層まで欠落なく伝播する設計か            |

---

## 多角的チェック観点

| 観点             | チェック内容                                                  |
| ---------------- | ------------------------------------------------------------- |
| 要件完全性       | Phase 1の全要件（FR/NFR）が Phase 2の設計でカバーされているか |
| 設計の自己完結性 | 設計書だけで実装者が実装を開始できるか                        |
| セキュリティ     | P27/P42/P44/P45 の全対策が設計に含まれているか                |
| パフォーマンス   | 不要な再レンダー・ブロッキング処理のリスクがないか            |
| アクセシビリティ | WCAG 2.1 AA の主要要件が設計に含まれているか                  |
| 既存パターン整合 | 既存コンポーネント（SkillImportDialog等）との一貫性があるか   |
| テスト容易性     | Props設計がテストしやすい形になっているか                     |

---

## 成果物

| 成果物       | パス                                                                                            | 内容                         |
| ------------ | ----------------------------------------------------------------------------------------------- | ---------------------------- |
| レビュー結果 | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-3/design-review-result.md` | 判定結果・チェックリスト記録 |

---

## 完了条件

- [ ] `outputs/phase-3/design-review-result.md` が作成されている
- [ ] 要件・設計整合性チェック（1-A/1-B/1-C）が全て実施されている
- [ ] アーキテクチャ整合性チェック（2-A/2-B/2-C/2-D）が全て実施されている
- [ ] セキュリティチェックが全て実施されている
- [ ] パフォーマンスチェックが全て実施されている
- [ ] アクセシビリティチェックが全て実施されている
- [ ] 総合判定（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] MINOR判定の場合、全指摘が未タスク化されている（**省略不可**）
- [ ] MAJOR/CRITICAL判定の場合、差し戻し先が明確に記録されている
- [ ] PASS/MINOR判定の場合のみ Phase 4 への進行が承認される
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

| No. | タスク名                     | ステータス | 成果物パス                                |
| --- | ---------------------------- | ---------- | ----------------------------------------- |
| 1   | 要件・設計整合性チェック     | 未実施     | `outputs/phase-3/design-review-result.md` |
| 2   | アーキテクチャ整合性チェック | 未実施     | `outputs/phase-3/design-review-result.md` |
| 3   | セキュリティチェック         | 未実施     | `outputs/phase-3/design-review-result.md` |
| 4   | パフォーマンスチェック       | 未実施     | `outputs/phase-3/design-review-result.md` |
| 5   | アクセシビリティチェック     | 未実施     | `outputs/phase-3/design-review-result.md` |
| 6   | 判定・次Phase決定            | 未実施     | `outputs/phase-3/design-review-result.md` |

---

## タスク100%実行確認【必須】

Phase完了後、以下を確認してください:

```markdown
## Phase 3 実行記録

### 完了チェック

- [ ] 要件・設計整合性チェック（Step 1）: {{完了/未完了}}
- [ ] アーキテクチャ整合性チェック（Step 2）: {{完了/未完了}}
- [ ] セキュリティチェック（Step 3）: {{完了/未完了}}
- [ ] パフォーマンスチェック（Step 4）: {{完了/未完了}}
- [ ] アクセシビリティチェック（Step 5）: {{完了/未完了}}
- [ ] 総合判定（Step 6）: {{完了/未完了}}

### レビュー判定

- 判定: {{PASS / MINOR / MAJOR / CRITICAL}}
- MINOR指摘数: {{件数}}
- MINOR未タスク化: {{完了/未完了/該当なし}}
- 差し戻し先（MAJOR/CRITICAL時）: {{Phase N / 該当なし}}

### 指摘事項サマリー

#### 重大（MAJOR/CRITICAL）

（なし / 内容を記載）

#### 軽微（MINOR）

（なし / 内容を記載）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項（PASS/MINOR時）

-
```

---

## 次のPhase

PASS または MINOR 判定の場合のみ、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/skill-create-wizard/phase-4-test-creation.md`

MAJOR 判定の場合は影響範囲に応じて以下へ戻る:

- 要件の問題 → `docs/30-workflows/completed-tasks/skill-create-wizard/phase-1-requirements.md`
- 設計の問題 → `docs/30-workflows/completed-tasks/skill-create-wizard/phase-2-design.md`

CRITICAL 判定の場合は `phase-1-requirements.md` へ戻りユーザーと要件を再確認する。

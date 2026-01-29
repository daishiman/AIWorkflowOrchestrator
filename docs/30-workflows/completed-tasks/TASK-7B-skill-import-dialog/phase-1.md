# Phase 1: 要件定義

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 1                           |
| 機能名 | TASK-7B-skill-import-dialog |
| 作成日 | 2026-01-30                  |

## 目的

SkillImportDialogコンポーネントの目的、スコープ、受け入れ基準を明文化する。

## 実行タスク

- 要件抽出: タスク仕様書・specification.mdから機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定

## 参照資料

| 資料名           | パス                                                                               | 説明               |
| ---------------- | ---------------------------------------------------------------------------------- | ------------------ |
| タスク定義       | `docs/30-workflows/skill-import-agent-system/tasks/task-7b-skill-import-dialog.md` | 元タスク仕様       |
| UI/UX仕様（4.3） | `docs/30-workflows/skill-import-agent-system/specification.md`                     | ダイアログ設計仕様 |
| SkillSlice定義   | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                             | 状態管理の実装     |
| SkillMetadata型  | `packages/shared/src/types/skill.ts`                                               | 型定義             |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                           | 内容                   |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------------- |
| UI/UXコンポーネント概要 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`        | コンポーネント設計方針 |
| UI/UXフォーム設計       | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`             | フォーム・ダイアログUI |
| デザインシステム        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`     | デザイントークン       |
| 状態管理仕様            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | Zustandパターン        |
| インターフェース定義    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md` | Agent UI仕様           |

## 実行手順

### ステップ1: 要件抽出

タスク仕様書とspecification.md 4.3から機能要件・非機能要件を抽出する。

**機能要件（FR）**:

| FR-ID | 要件                                              | 優先度 |
| ----- | ------------------------------------------------- | ------ |
| FR-01 | ダイアログをisOpenプロパティで開閉制御できる      | 高     |
| FR-02 | スキル名と説明を表示する                          | 高     |
| FR-03 | 許可ツール一覧をタグ形式で表示する                | 高     |
| FR-04 | agents/一覧をファイル名・説明付きで表示する       | 中     |
| FR-05 | references/一覧をファイル名・説明付きで表示する   | 中     |
| FR-06 | scripts/一覧をファイル名・説明付きで表示する      | 中     |
| FR-07 | assets/一覧をファイル名・説明付きで表示する       | 低     |
| FR-08 | schemas/一覧をファイル名・説明付きで表示する      | 低     |
| FR-09 | indexes/一覧をファイル名・説明付きで表示する      | 低     |
| FR-10 | インポートボタンクリックでimportSkillを実行する   | 高     |
| FR-11 | インポート中はローディング状態を表示する          | 高     |
| FR-12 | キャンセルボタンでダイアログを閉じる              | 高     |
| FR-13 | ESCキーでダイアログを閉じる                       | 中     |
| FR-14 | インポート完了後に自動でダイアログを閉じる        | 中     |
| FR-15 | サブリソースが0件の場合はセクションを非表示にする | 中     |

**非機能要件（NFR）**:

| NFR-ID | 要件                                           | 優先度 |
| ------ | ---------------------------------------------- | ------ |
| NFR-01 | `role="dialog"`, `aria-modal="true"`を設定する | 高     |
| NFR-02 | `aria-labelledby`でタイトルと関連付ける        | 高     |
| NFR-03 | フォーカストラップを実装する                   | 高     |
| NFR-04 | Tab/Shift+Tabでフォーカス移動できる            | 高     |
| NFR-05 | インポート中はボタンをdisabledにする           | 中     |
| NFR-06 | ダイアログオーバーレイでスクロールを抑制する   | 中     |
| NFR-07 | コンテンツが多い場合にスクロール可能にする     | 中     |
| NFR-08 | TypeScript型安全性を維持する                   | 高     |

### ステップ2: 受け入れ基準作成

各要件に対して検証可能な受け入れ基準を定義する。

| 要件ID | 受け入れ基準                                                                     |
| ------ | -------------------------------------------------------------------------------- |
| FR-01  | `isOpen=true`でダイアログが表示、`isOpen=false`でDOMに存在しない                 |
| FR-02  | `skill.name`と`skill.description`がダイアログ内に表示される                      |
| FR-03  | `skill.allowedTools`の各ツールがタグ（span）として表示される                     |
| FR-04  | `skill.agents`の各エントリがファイル名と説明付きで表示される                     |
| FR-10  | インポートボタンクリックで`importSkill(skill.name)`が呼ばれる                    |
| FR-11  | `isImporting=true && importingSkillName===skill.name`時に「インポート中...」表示 |
| FR-12  | キャンセルボタンクリックで`onClose`コールバックが呼ばれる                        |
| FR-13  | ダイアログ表示中にESCキーを押すと`onClose`が呼ばれる                             |
| NFR-01 | ダイアログのルート要素に`role="dialog"`と`aria-modal="true"`がある               |
| NFR-03 | Tab操作でフォーカスがダイアログ内に閉じ込められる                                |

### ステップ3: FR/NFR分類と優先度設定

上記表で分類・優先度設定完了。

## 統合テスト連携【必須】

接続要件を要件に明記する:

| 接続要件カテゴリ | 記載内容                                                                   |
| ---------------- | -------------------------------------------------------------------------- |
| 状態管理         | useAppStore()からimportSkill/isImporting/importingSkillNameを取得          |
| 型連携           | SkillMetadata/SkillSubResource（@repo/shared）をpropsとして受け取り        |
| データフロー     | SkillSelector → SkillImportDialog → SkillSlice → IPC → Main の単方向フロー |

## アーキテクチャ層別要件（Electronデスクトップアプリ観点）

| 層                         | 確認観点                                                        |
| -------------------------- | --------------------------------------------------------------- |
| フロントエンド（Renderer） | Reactコンポーネント設計、Zustand連携、アクセシビリティ          |
| バックエンド（Main）       | 本タスクでは直接関係なし（SkillSlice経由でIPCを呼ぶ）           |
| IPC通信                    | 本タスクでは直接関係なし（SkillSliceが内部でIPC呼び出しを行う） |
| セキュリティ               | ダイアログ内でユーザー入力なし（表示のみ＋ボタン操作）          |
| データ                     | 永続化なし（SkillSlice経由でimport処理を委譲）                  |

## 成果物

| 成果物       | パス                                         | 説明             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

## 完了条件

- [ ] 全要件が抽出されている（FR 15件、NFR 8件）
- [ ] 各要件に受け入れ基準がある
- [ ] FR/NFRが分類されている
- [ ] 接続要件（Zustand/型連携）が明記されている
- [ ] アーキテクチャ層別の要件が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 要件抽出の実施
3. 受け入れ基準作成の実施
4. FR/NFR分類の実施
5. 成果物の作成・配置
6. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7B-skill-import-dialog --phase 1
```

## 次のPhase

Phase 2: 設計

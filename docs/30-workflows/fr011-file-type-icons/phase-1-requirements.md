# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 1                     |
| Phase名    | 要件定義              |
| 前提Phase  | なし（開始Phase）     |
| 後続Phase  | Phase 2（設計）       |
| ステータス | 未実施                |
| 作成日     | 2026-01-18            |
| 機能名     | fr011-file-type-icons |

---

## 目的

ファイルタイプアイコン表示の要件と受け入れ基準を明文化し、設計と実装の判断基準を固定する。

## 背景

ファイルツリーは汎用アイコンのみで構成されており、拡張子の違いが視覚的に識別できない。UI/UX仕様に沿ったアイコン設計を行うため、必要な要件を整理する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ファイルタイプ表示要件の抽出

**目的**: 対応拡張子とアイコン表示ルールを確定する

**実行手順**:

1. `docs/30-workflows/unassigned-task/task-fr011-file-type-icons.md` を読み要件候補を抽出
2. 対象拡張子の一覧を確定（例: ts, tsx, js, jsx, md, json, css, html, yml, yaml, sh, py, go, rs）
3. フォルダの展開状態によるアイコン切り替え条件を定義
4. `outputs/phase-1/requirements-definition.md` に整理して記載

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`

---

### タスク2: 受け入れ基準の定義

**目的**: 実装後に検証可能な合否判定基準を確定する

**実行手順**:

1. 拡張子ごとのアイコン表示が確認可能な基準を定義
2. 未対応拡張子のフォールバック表示基準を定義
3. フォルダ展開時のアイコン切り替え基準を定義
4. `outputs/phase-1/acceptance-criteria.md` に記載

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

---

### タスク3: スコープ定義

**目的**: 変更対象と非対象を明確にする

**実行手順**:

1. 対象UI（FileTreeItem、SelectableFileTreeItem、WorkspaceSidebar）の範囲を明記
2. 非対象（アイコンテーマ、サムネイル、ユーザー設定）を明記
3. `outputs/phase-1/scope-definition.md` に記載

**期待される成果物**:

- `outputs/phase-1/scope-definition.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                       | 内容                                    |
| ------------------------ | -------------------------------------------------------------------------- | --------------------------------------- |
| ファイルセレクターUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md` | ファイルツリー表示とWorkspaceモード仕様 |
| パネル・セレクターUI/UX  | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`        | アイコンライブラリとサイズ規則          |
| UI/UXデザインシステム    | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md` | 色設計と視認性要件                      |

### ユーザー指示

| 参照資料       | パス                                                              | 内容                                 |
| -------------- | ----------------------------------------------------------------- | ------------------------------------ |
| 元の指示       | （会話ログ）                                                      | ファイルタイプごとのアイコン表示要求 |
| 未タスク指示書 | `docs/30-workflows/unassigned-task/task-fr011-file-type-icons.md` | 既存の課題整理                       |

---

## 成果物

| 成果物       | パス                                         | 内容                   |
| ------------ | -------------------------------------------- | ---------------------- |
| 要件定義     | `outputs/phase-1/requirements-definition.md` | ファイルタイプ要件整理 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 合否判定基準           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲と非対象範囲   |

---

## 統合テスト連携（Phase 1〜11は必須）

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                |
| ---------------- | --------------------------------------- |
| API接続          | 該当なし（UI内完結）                    |
| 認証フロー       | 該当なし                                |
| データフロー     | ワークスペース状態 → ファイルツリー表示 |

- FileTreeItemとSelectableFileTreeItemの既存選択機能が維持される要件を明記
- フォルダ展開操作の挙動が変わらないことを要件に追加

---

## 完了条件

- [ ] 対応拡張子の一覧が確定している
- [ ] フォルダ展開時のアイコン切り替え基準が明記されている
- [ ] 未対応拡張子のフォールバック基準が定義されている
- [ ] 受け入れ基準が検証可能な形で記載されている
- [ ] スコープが明確になっている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/fr011-file-type-icons --phase 1
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 実行タスク

| タスク  | 結果        | 備考 |
| ------- | ----------- | ---- |
| タスク1 | 完了/未完了 |      |
| タスク2 | 完了/未完了 |      |
| タスク3 | 完了/未完了 |      |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

## 依存関係

- **前提**: なし（開始Phase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/fr011-file-type-icons/phase-2-design.md`

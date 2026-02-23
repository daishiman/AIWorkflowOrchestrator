# TASK-UI-00-ATOMS AIWorkflow Requirements Extraction Audit

- 監査日: 2026-02-22
- 監査基準: `.claude/skills/aiworkflow-requirements/`
- 起点: `indexes/resource-map.md`（UI実装 / コンポーネントテスト / アクセシビリティテスト / 品質要件）

## 1. 必須仕様抽出結果

| カテゴリ             | 抽出した仕様                    | 主な適用Phase                 |
| -------------------- | ------------------------------- | ----------------------------- |
| UI実装               | `ui-ux-components.md`           | Phase 1,2,3,5,9,10,11,12,13   |
| UI設計原則           | `ui-ux-design-principles.md`    | Phase 1,2,3,4,5,11,12         |
| デザインシステム     | `ui-ux-design-system.md`        | Phase 1,2,3,5,9,12            |
| UIアーキテクチャ     | `arch-ui-components.md`         | Phase 1,2,3,5,8,9,10,11,12,13 |
| コンポーネントテスト | `testing-component-patterns.md` | Phase 1,2,3,4,5,6,7,12        |
| a11yテスト           | `testing-accessibility.md`      | Phase 1,2,3,4,6,7,11,12       |
| 品質要件             | `quality-requirements.md`       | Phase 1(index),6,7,8,9,10,12  |

## 2. 非該当仕様（今回の実装範囲）

| カテゴリ        | 判定   | 理由                                  |
| --------------- | ------ | ------------------------------------- |
| `api-*.md`      | 非該当 | IPC/API契約追加・変更なし             |
| `database-*.md` | 非該当 | DBスキーマ・永続化仕様変更なし        |
| `security-*.md` | 非該当 | 認証/認可/IPCセキュリティ契約変更なし |

## 3. 反映先

- 抽出サマリー本体: `task-ui-00-atoms/index.md`
- Phase 12更新判断と実施手順: `phase-12-documentation.md`
- 各Phase参照資料: `phase-1` 〜 `phase-13`

## 4. 判定

- 漏れなし（今回の Atoms 実装スコープで必要な aiworkflow-requirements を抽出済み）
- 実装非該当カテゴリは明示的に除外理由を記録済み

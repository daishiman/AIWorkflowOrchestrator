# TASK-UI-00-ATOMS AIWorkflow Requirements Extraction Audit

- 監査日: 2026-02-24
- 監査基準: `.claude/skills/aiworkflow-requirements/`
- 抽出手順: `indexes/resource-map.md` 起点 + `search-spec.js`（`Atoms`）

## 1. 候補仕様の採否判定

| 区分   | カテゴリ             | 抽出した仕様                              | 判定理由                              |
| ------ | -------------------- | ----------------------------------------- | ------------------------------------- |
| 必須   | UI実装               | `ui-ux-components.md`                     | Atoms責務・実装状況の正本             |
| 必須   | UI設計原則           | `ui-ux-design-principles.md`              | Apple HIG/WCAG判断基準                |
| 必須   | デザインシステム     | `ui-ux-design-system.md`                  | デザイントークン運用正本              |
| 必須   | UIアーキテクチャ     | `arch-ui-components.md`                   | Atomic Design境界の正本               |
| 必須   | コンポーネントテスト | `testing-component-patterns.md`           | Atomsテストパターンの正本             |
| 必須   | a11yテスト           | `testing-accessibility.md`                | a11y検証観点の正本                    |
| 必須   | 品質要件             | `quality-requirements.md`                 | 品質ゲート/カバレッジ基準             |
| 補助   | Atoms専用実装知見    | `ui-ux-atoms-patterns.md`                 | 7コンポーネント実装時の苦戦箇所を補完 |
| 補助   | 実装パターン         | `architecture-implementation-patterns.md` | S12-S17実装パターンの再利用           |
| 補助   | 教訓                 | `lessons-learned.md`                      | 再発防止観点を補完                    |
| 非該当 | API                  | `api-*.md`                                | IPC/API契約変更なし                   |
| 非該当 | DB                   | `database-*.md`                           | DB変更なし                            |
| 非該当 | セキュリティ契約     | `security-*.md`                           | 認証/認可/IPC契約変更なし             |

## 2. 反映先

| 反映先                         | 結果                            |
| ------------------------------ | ------------------------------- |
| `index.md` 抽出サマリー        | ✅ 必須/補助/非該当の採否を明示 |
| `phase-1`〜`phase-13` 参照資料 | ✅ 必須仕様を各Phaseに反映      |
| `phase-12-documentation.md`    | ✅ Step 2更新要否判断に反映     |

## 3. 参照整合監査

| チェック項目                        | 結果                        |
| ----------------------------------- | --------------------------- |
| `task-ui-00-atoms` 旧配置参照       | ✅ `completed-tasks` へ更新 |
| Atoms関連未タスク仕様書の参照先整合 | ✅ 更新済み                 |

## 4. 判定

- 今回実装で必要な仕様情報は抽出漏れなし。
- 候補抽出結果に対して採否理由を明示し、非該当カテゴリも根拠付きで整理済み。

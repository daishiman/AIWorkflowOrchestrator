# UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 AIWorkflow Requirements Extraction Audit

- 監査日: 2026-02-24
- 監査基準: `.claude/skills/aiworkflow-requirements/`
- 抽出手順: `indexes/resource-map.md` 起点 + `search-spec.js`（`skill:import` / `IPCチャネル`）

## 1. 候補仕様の採否判定

| 区分   | カテゴリ            | 抽出した仕様                              | 判定理由                              |
| ------ | ------------------- | ----------------------------------------- | ------------------------------------- |
| 必須   | API設計（IPC）      | `api-ipc-agent.md`                        | Skill管理IPC契約の正本                |
| 必須   | インターフェース    | `interfaces-agent-sdk-skill.md`           | Renderer/Preload/Main契約整合の正本   |
| 必須   | IPCセキュリティ     | `security-electron-ipc.md`                | 契約ドリフト防止と検証ルール          |
| 必須   | IPC契約チェック     | `ipc-contract-checklist.md`               | 3層同時更新の必須チェック             |
| 必須   | 実装パターン        | `architecture-implementation-patterns.md` | P44/P45再発防止パターン               |
| 必須   | 教訓                | `lessons-learned.md`                      | 類似障害の再発防止知見                |
| 補助   | Skill IPC詳細       | `security-skill-ipc.md`                   | `skill:import` 系の入力検証詳細を補完 |
| 補助   | 型/チャネル調査手順 | `ipc-type-resolution-guide.md`            | チャネル衝突時の横断確認手順を補完    |
| 非該当 | DB                  | `database-*.md`                           | DB変更なし                            |
| 非該当 | UI/UX               | `ui-ux-*.md`                              | UI実装変更なし                        |
| 非該当 | デプロイ            | `deployment-*.md`                         | 配布/CI変更なし                       |

## 2. Phase反映マトリクス

| 対象              | 必須6仕様（API/IF/Sec/Checklist/Pattern/Lesson） | 補助2仕様（security-skill-ipc/ipc-type-resolution-guide） |
| ----------------- | ------------------------------------------------ | --------------------------------------------------------- |
| index.md          | ✅                                               | ✅                                                        |
| phase-1〜phase-13 | ✅                                               | ✅（参照資料テーブル＋実行手順で活用）                    |

## 3. 依存・整合監査（抽出結果の適用先）

| チェック項目                                              | 結果        |
| --------------------------------------------------------- | ----------- |
| `artifacts.json.dependencies` と `phase-*` の依存記述整合 | ✅ 一致     |
| 参照パスの実在（旧 `task-ui-00-atoms` 参照残存なし）      | ✅ 更新済み |

## 4. 判定

- 必要情報の抽出漏れなし（候補抽出→採否判定まで完了）。
- 抽出結果は index/Phase/成果物監査へ反映済み。

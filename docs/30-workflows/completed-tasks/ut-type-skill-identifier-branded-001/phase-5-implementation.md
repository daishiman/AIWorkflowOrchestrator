# Phase 5: 実装

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 5                                                                      |
| Phase名    | 実装                                                                   |
| タスクID   | UT-TYPE-SKILL-IDENTIFIER-BRANDED-001                                   |
| タスク名   | Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別）  |
| 機能名     | ut-type-skill-identifier-branded-001                                   |
| 前提Phase  | Phase 4                                                                |
| 後続Phase  | Phase 6                                                                |
| ステータス | 未実施                                                                 |
| 作成日     | 2026-02-25                                                             |
| Issue      | [#867](https://github.com/daishiman/AIWorkflowOrchestrator/issues/867) |

## 目的

Red テストを Green に変えながら、Branded Type と境界変換を実装する。

## 背景

shared 型定義だけ更新すると renderer/main 側で型不整合が連鎖する。実装順序を固定し、段階的に解消する。

## 実行タスク

- SubAgent-A（shared実装）: `SkillId` / `SkillName` / 変換関数を実装する
- SubAgent-B（renderer実装）: SkillImportDialog と AgentView の型適用を実装する
- SubAgent-C（main/preload実装）: IPC 契約側の型整合を実装する
- SubAgent-D（store実装）: `importedSkillIds` と関連 state の型適用を実装する
- Lead（統合）: 変更順序を守って統合し Green に到達させる

## 参照資料

| 参照資料                | パス                                                               | 内容           |
| ----------------------- | ------------------------------------------------------------------ | -------------- |
| 依存Phase 4             | `phase-4-test-creation.md`                                         | Redケース一覧  |
| implementation patterns | `.claude/skills/task-specification-creator/references/patterns.md` | 実装パターン   |
| テスト仕様              | `outputs/phase-4/test-specification.md`                            | Phase 4 成果物 |
| 型テスト一覧            | `outputs/phase-4/type-test-cases.md`                               | Phase 4 成果物 |
| 統合テスト一覧          | `outputs/phase-4/integration-test-cases.md`                        | Phase 4 成果物 |
| Redログ                 | `outputs/phase-4/red-test-log.txt`                                 | Phase 4 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------- |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill UI 契約                   |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S14/P44/P45                     |
| api-ipc-agent                        | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | `skill:import` 契約             |
| security-skill-ipc                   | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | trim 検証維持                   |
| security-api-electron                | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | IPC公開面のセキュリティ要件維持 |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | store 型整合                    |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 実装時の例外契約維持            |
| quality-requirements                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | Green判定時の品質基準           |

## 実行手順

1. SubAgent-A が shared 型を先行実装する（直列）。
2. SubAgent-B/C/D が依存順を守りつつ実装を並列進行する（並列）。
3. Lead がコンフリクト解消と Green 判定を実施する（直列）。
4. 変更ファイル一覧と理由を記録する（直列）。

## 統合テスト連携

| 観点       | 連携内容                             |
| ---------- | ------------------------------------ |
| 型伝播     | shared 型更新が renderer/main に反映 |
| 実行契約   | import フローが既存仕様を維持        |
| エラー伝播 | 検証失敗時のエラー形維持             |

## 多角的チェック観点（AIが判断）

| 観点               | 適用内容                                                         |
| ------------------ | ---------------------------------------------------------------- |
| セキュリティ       | `security-skill-ipc` と `security-api-electron` の要件整合を確認 |
| アーキテクチャ     | `architecture-implementation-patterns` の S14/P44/P45 適用を確認 |
| API/IPC契約        | `api-ipc-agent` と `interfaces-agent-sdk-skill` の契約整合を確認 |
| エラーハンドリング | `error-handling` の Validation Error 契約を確認                  |
| テスタビリティ     | `quality-requirements` の TDD/カバレッジ基準を確認               |

## 成果物

| 成果物         | パス                                      | 説明               |
| -------------- | ----------------------------------------- | ------------------ |
| 実装ログ       | `outputs/phase-5/implementation-log.md`   | 実装順序と差分理由 |
| 変更ファイル表 | `outputs/phase-5/change-file-matrix.md`   | 変更対象一覧       |
| Greenログ      | `outputs/phase-5/green-test-log.txt`      | テスト成功証跡     |
| 型適用マップ   | `outputs/phase-5/type-application-map.md` | 型反映状況         |

## 完了条件

- [ ] `SkillId` / `SkillName` が shared 正本に実装されている
- [ ] Renderer / Main / Preload / Store の型整合が取れている
- [ ] Greenログが保存されている
- [ ] 変更ファイルと理由が追跡可能である
- [ ] 本Phase内の全タスクを100%実行完了

## TDD検証

```bash
pnpm --filter @repo/shared build
pnpm typecheck
pnpm --filter @repo/desktop test:run
```

- [ ] Green 状態を確認

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] 完了条件チェックを更新済み

## 依存関係

- **前提**: Phase 4
- **後続**: Phase 6

## サブタスク管理

- [ ] SubAgent-A shared 実装
- [ ] SubAgent-B/C/D 実装
- [ ] Lead 統合
- [ ] 成果物作成
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物パスが `artifacts.json` と整合
- [ ] 次Phaseへの引き継ぎ事項を記録

## 次のPhase

Phase 6: [phase-6-test-expansion.md](phase-6-test-expansion.md)

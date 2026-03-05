# TASK-UI-01 SubAgent Team分割インデックス

## 目的

`TASK-UI-01-STORE-IPC-ARCHITECTURE` を関心ごと単位で分割し、並列実行可能な仕様書を固定化する。実装は行わず、仕様書作成のみに専念する。

## SubAgent編成

| SubAgent                 | 担当仕様書                                    | 主要責務                                        | 実行種別        |
| ------------------------ | --------------------------------------------- | ----------------------------------------------- | --------------- |
| A: Store Architect       | `task-056a-a-store-slice-baseline.md`         | 既存Slice棚卸し、追加/不追加判断、Store境界定義 | 並列可能        |
| B: IPC Contract Guardian | `task-056a-b-ipc-contract-security.md`        | IPCチャネル契約、Preload境界、Security要件定義  | 並列可能        |
| C: Domain Integrator     | `task-056c-notification-history-domain.md`    | Notification/HistorySearchドメイン仕様統合      | 直列（A/B依存） |
| D: Navigation Integrator | `task-056d-viewtype-routing-nav/index.md`     | ViewType拡張、ルーティング、ナビゲーション整合  | 直列（A依存）   |
| E: Review Gate Auditor   | `task-056e-integration-gate-and-spec-sync.md` | 統合ゲート、完了条件、仕様同期チェック          | 直列（C/D依存） |

## 依存関係（直列/並列）

```text
TASK-UI-00
  ├─ A: Store Slice Baseline
  └─ B: IPC Contract Security
       (A || B は並列)
          ↓
       C: Notification/History Domain

A --------------------------┐
                            ├─ D: ViewType Routing Nav
C ----------------------┐   │
                        └───┴─ E: Integration Gate & Spec Sync
```

## aiworkflow-requirements正本参照

- `references/arch-state-management.md`
- `references/architecture-overview.md`
- `references/architecture-implementation-patterns.md`
- `references/api-endpoints.md`
- `references/api-ipc-system.md`
- `references/security-api-electron.md`
- `references/security-electron-ipc.md`
- `references/ui-ux-navigation.md`
- `references/error-handling.md`

## 実行ルール

1. A/Bは並列で仕様を確定する。
2. C/Dは依存成果物を入力として直列に進める。
3. Eで全仕様の矛盾検知と完了条件統合を行う。
4. 仕様書更新時は `task-056-ui-01-store-ipc-architecture.md` を正本インデックスとして同時更新する。

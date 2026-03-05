# Phase 2 Slice Inventory 設計

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | TASK-UI-01-A-STORE-SLICE-BASELINE |
| Phase      | 2                                 |
| 作成日     | 2026-03-05                        |
| ステータス | completed                         |

## 1. 設計目的

Slice棚卸し結果を後続タスクが再利用できるように、台帳フォーマットを固定する。

## 2. 台帳フォーマット（固定列）

| 列名          | 型         | 必須 | 記載規約                                        |
| ------------- | ---------- | ---- | ----------------------------------------------- |
| `sliceName`   | `string`   | 必須 | `NavigationSlice` のように型名で記載            |
| `state`       | `string[]` | 必須 | 主要状態キーのみ列挙（責務判定に必要な範囲）    |
| `actions`     | `string[]` | 必須 | 外部から呼ばれるアクションのみ列挙              |
| `selectors`   | `string[]` | 必須 | `store/index.ts` で公開される個別セレクタを優先 |
| `persistence` | `object`   | 必須 | `strategy` と `keys[]` を持つ                   |
| `ownerView`   | `string[]` | 必須 | 主利用画面を複数可で記載                        |
| `filePath`    | `string`   | 必須 | 実装ファイルへの相対パス                        |

### persistence 列の仕様

| フィールド | 型         | 値                                                  |
| ---------- | ---------- | --------------------------------------------------- |
| `strategy` | union      | `persisted` / `partial-persisted` / `non-persisted` |
| `keys`     | `string[]` | `partialize` 対象キーを列挙                         |

## 3. データ収集ルール

- SA-01 は `apps/desktop/src/renderer/store/index.ts` の `AppStore` 合成順で行を作成する。
- Sliceごとの `state/actions` は各 `slices/*.ts` の公開インターフェースを根拠にする。
- `selectors` は `store/index.ts` の export セレクタから対応するものを抽出する。
- `persistence` は `partialize` 設定のみを正本とし、推測で追加しない。
- `ownerView` は `App.tsx` の `renderView()` と各 View 実装から判断する。

## 4. 記載粒度サンプル

```markdown
| sliceName       | state                                              | actions                                             | selectors          | persistence                                             | ownerView              | filePath                                                  |
| --------------- | -------------------------------------------------- | --------------------------------------------------- | ------------------ | ------------------------------------------------------- | ---------------------- | --------------------------------------------------------- |
| NavigationSlice | ["currentView", "viewHistory", "currentSkillName"] | ["setCurrentView", "goBack", "setCurrentSkillName"] | ["useCurrentView"] | {"strategy":"partial-persisted","keys":["currentView"]} | ["AppDock", "App.tsx"] | apps/desktop/src/renderer/store/slices/navigationSlice.ts |
```

## 5. 完了判定

- `sliceName/state/actions/selectors/persistence/ownerView` の6列が全行で埋まること。
- 既存15 Slice + `chatEditSlice` の計16行以上を保証すること。
- `task-056c` / `task-056d` が流用できるよう `Notification` / `HistorySearch` / `SkillCenter` / `ViewType` の関連行を含むこと。

## 6. 参照

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`

# UT-SLIDE-GUIDANCE-UI-001: handoffGuidance 表示コンポーネント（SlideGuidanceBlock）の実装

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| タスク ID  | UT-SLIDE-GUIDANCE-UI-001                      |
| 優先度     | low                                           |
| 検出元     | TASK-IMP-SLIDE-RUNTIME-ALIGNMENT-001 Phase 12 |
| 関連 Issue | #1363                                         |

## 背景

slideSlice に `isHandoff` と `handoffGuidance` の store fields が追加されたが、これらを Renderer 側で表示するコンポーネントがまだ存在しない。RuntimeResolver が handoff を返した場合、ユーザーには「ターミナルでこのコマンドを実行してください」という guidance を表示する必要がある。

## 要件

1. `SlideGuidanceBlock` コンポーネントを作成する
2. `handoffGuidance.command` をコピー可能なコードブロックとして表示する
3. `handoffGuidance.reason` を説明テキストとして表示する
4. `handoffGuidance.contextSummary` を折りたたみセクションで表示する
5. `isHandoff === false` の場合はコンポーネントを非表示にする

## 受入基準

- [ ] `SlideGuidanceBlock` がスライドワークスペース内に配置されている
- [ ] handoff 時に guidance の全3フィールドが表示される
- [ ] command のコピーボタンが機能する
- [ ] Apple HIG 準拠のスタイリング
- [ ] ダークモード/ライトモード両対応

## 参照

- `apps/desktop/src/renderer/store/slideSlice.ts`（handoffGuidance store field）
- `apps/desktop/src/types/handoff.ts`（HandoffGuidance 型定義）

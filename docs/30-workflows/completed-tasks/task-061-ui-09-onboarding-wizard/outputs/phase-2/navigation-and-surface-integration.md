# Navigation And Surface Integration

## shell integration

| concern | 設計 |
| --- | --- |
| 表示場所 | `App.tsx` catch-all route 配下、`dashboard` content の上に overlay 表示 |
| skip | `onboarding.completed=true` を保存し、そのまま `dashboard` を表示 |
| complete | completion screen を 3 秒表示後に `dashboard` へ戻る |
| rerun | SettingsView action から `onboarding.completed=false` を保存し、`currentView="dashboard"` へ移す |

### animation / interaction

| 項目 | 設計 |
| --- | --- |
| step indicator | active step の変化はアニメーションなしで即時反映し、表示抑制で不快な揺れを避ける |
| bubble interaction | tap で `scale(0.97 -> 1.05 -> 1)` 等価の bounce を再現 |
| complete effect | `EmptyState mood="celebrating"` + confetti を 2 秒間再生し、2-3 秒で遷移 |
| theme transition | Theme preview は `opacity: 300ms` 相当のクロスフェードで画面更新を行う |

## keyboard / focus

| 操作 | 設計 |
| --- | --- |
| Tab | modal 内で循環させる |
| Enter | 現在 step の primary action を実行できる |
| Escape | Step 1-4 では閉じない。`あとで` を明示操作で押す |

### フォーカス初期化ルール

- overlay open 時に Step1 入力または Step2 先頭 button に自動フォーカス。
- `あとで` で閉じる場合は `dashboard` 側の最後のフォーカス位置を保持。
- `focus trap` はモーダル表示中常時有効、`あとで` 明示操作時のみ解除する。

## skill import handoff

| concern | 設計 |
| --- | --- |
| card data | `label`, `description`, `skillName`, `icon` を持つ |
| source | `availableSkillsMetadata` と curated mapping を突き合わせる |
| execution | completion 後に `importSkill(skillName)` を非同期で呼ぶ |
| failure path | import 失敗は onboarding 完了を巻き戻さず、dashboard 上の通知で扱う |

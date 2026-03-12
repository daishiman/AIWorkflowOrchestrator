# Session / Stream / History 境界

## `chatSlice`

- session lifecycle
- stream request/response state
- persist 対象の最低限 state
- retry/abort/error 契約

## `useStreamingChat`

- `chatSlice` action を UI で使いやすくする facade
- stream state の read-only projection

## `ChatView`

- mode switcher
- recent session rail
- context summary
- input / retry / stop UI

## History 境界

- 本タスクでは `ChatHistoryView` を新 session model に結線しない。
- session persistence は renderer local persist のみを対象にした。

## 理由

- 履歴 REST/API まで同時統合すると Task02 の責務を超えるため。

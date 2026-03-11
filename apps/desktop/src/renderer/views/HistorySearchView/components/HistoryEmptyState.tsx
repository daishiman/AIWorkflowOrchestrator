import { EmptyState } from "../../../components/atoms/EmptyState";

interface HistoryEmptyStateProps {
  mode: "empty" | "search" | "error";
  query?: string;
  onPrimaryAction: () => void;
}

export function HistoryEmptyState({
  mode,
  query,
  onPrimaryAction,
}: HistoryEmptyStateProps) {
  if (mode === "error") {
    return (
      <div role="alert" className="h-full">
        <EmptyState
          title="記録の読み込みに失敗しました"
          description="もう一度試してみてください"
          icon="alert-triangle"
          mood="encouraging"
          action={{
            label: "もう一度試す",
            onClick: onPrimaryAction,
          }}
          className="min-h-[320px]"
        />
      </div>
    );
  }

  if (mode === "search") {
    return (
      <EmptyState
        title={`「${query ?? ""}」に一致する記録が見つかりませんでした`}
        description="キーワードを変えるか、検索をクリアしてみてください"
        icon="search"
        mood="encouraging"
        action={{
          label: "検索をクリア",
          onClick: onPrimaryAction,
          variant: "secondary",
        }}
        className="min-h-[320px]"
      />
    );
  }

  return (
    <EmptyState
      title="まだ記録がありません"
      description="AIアシスタントに話しかけてみましょう"
      icon="clock"
      mood="encouraging"
      action={{
        label: "チャットをはじめる",
        onClick: onPrimaryAction,
      }}
      className="min-h-[320px]"
    />
  );
}

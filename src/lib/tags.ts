// Shared tag definitions and helpers
// - タグの単一ソース: プリセットタグ一覧を定義（value と日本語 label）。
// - 表示用マップ: tagLabel(tag) で value→label を返す共通ロジック。
// - 入力正規化: normalizeTag で空白除去・小文字化・空白をハイフン化し、保存・表示の一貫性を担保。

export const PRESET_TAGS = [
  { value: "general", label: "一般" },
  { value: "question", label: "質問" },
  { value: "chat", label: "雑談" },
  { value: "illustration", label: "イラスト" },
  { value: "progress", label: "進捗" },
] as const;

export const TAG_LABELS: Record<string, string> = PRESET_TAGS.reduce(
  (acc, t) => {
    acc[t.value] = t.label;
    return acc;
  },
  {} as Record<string, string>,
);

export function tagLabel(tag: string) {
  return TAG_LABELS[tag] || tag;
}

export function normalizeTag(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, "-");
}

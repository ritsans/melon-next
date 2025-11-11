-- リプライ通知機能のためのスキーマ更新

-- notification typeを追加（'reaction' または 'reply'）
ALTER TABLE notifications
ADD COLUMN type TEXT NOT NULL DEFAULT 'reaction';

-- reaction_emojiをNULL許可に変更（リプライ通知の場合はNULL）
ALTER TABLE notifications
ALTER COLUMN reaction_emoji DROP NOT NULL;

-- typeカラムにインデックスを追加
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- コメント追加
COMMENT ON COLUMN notifications.type IS '通知の種類: reaction（リアクション）/ reply（返信）';
COMMENT ON COLUMN notifications.reaction_emoji IS 'リアクションの絵文字（typeがreactionの場合のみ）';

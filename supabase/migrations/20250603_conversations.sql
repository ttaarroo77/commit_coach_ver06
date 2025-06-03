-- 会話管理用のconversationsテーブル
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '新しい会話',
  project_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 会話とメッセージの関連付け用のカラム追加
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- RLS有効化
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- ポリシー作成
CREATE POLICY "ユーザーは自分の会話を参照できる" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の会話を作成できる" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の会話を更新できる" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の会話を削除できる" ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- 会話タイトル更新関数
CREATE OR REPLACE FUNCTION update_conversation_title_from_first_message()
RETURNS TRIGGER AS $$
DECLARE
  first_message TEXT;
BEGIN
  -- 会話の最初のユーザーメッセージを取得
  SELECT content INTO first_message
  FROM messages
  WHERE conversation_id = NEW.conversation_id AND role = 'user'
  ORDER BY created_at ASC
  LIMIT 1;

  -- メッセージがあれば、それを元に会話タイトルを生成（最初の30文字）
  IF first_message IS NOT NULL THEN
    UPDATE conversations
    SET title = CASE
      WHEN LENGTH(first_message) > 30 THEN LEFT(first_message, 27) || '...'
      ELSE first_message
    END,
    updated_at = NOW()
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- メッセージ挿入時に会話タイトルを更新するトリガー
CREATE OR REPLACE TRIGGER update_conversation_title
AFTER INSERT ON messages
FOR EACH ROW
WHEN (NEW.role = 'user')
EXECUTE PROCEDURE update_conversation_title_from_first_message();

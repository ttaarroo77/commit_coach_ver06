// 将来実装のためコメントアウト
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Label } from '@/components/ui/label';
// import { Smile, Zap, Coffee } from 'lucide-react';

// 将来実装のためコメントアウト
// interface ToneSelectorProps {
//   value: 'friendly' | 'tough-love' | 'humor';
//   onChange: (value: 'friendly' | 'tough-love' | 'humor') => void;
// }

// 将来実装のためコメントアウト - トーンセレクター全体
/*
export default function ToneSelector({ value, onChange }: ToneSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">コーチのトーン</h3>
      <RadioGroup
        value={value}
        onValueChange={(val) => {
          const tone = val as 'friendly' | 'tough-love' | 'humor';
          onChange(tone);
          
          // 将来実装予定: トーン設定の永続化処理
          // -----------------------------------------------
          // TODO: 
          // 1. ユーザー設定としてSupabaseに保存
          // 2. useUserSettingsフックを作成して管理
          // 3. トーン設定をシステムプロンプトに反映
          // 
          // 以下の実装は将来のリファクタリング時に有効化
          /*
          const saveUserTonePreference = async (tone: string) => {
            try {
              const { data, error } = await supabase
                .from('user_settings')
                .upsert({ user_id: userId, tone_preference: tone });

              if (error) throw error;
              console.log('トーン設定が保存されました', tone);
            } catch (error) {
              console.error('トーン設定の保存に失敗しました:', error);
            }
          };
          saveUserTonePreference(tone);
          *//*
        }}
        className="flex flex-wrap gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="friendly" id="friendly" />
          <Label htmlFor="friendly" className="flex items-center gap-1 cursor-pointer">
            <Smile className="h-4 w-4 text-green-500" />
            <span>フレンドリー</span>
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="tough-love" id="tough-love" />
          <Label htmlFor="tough-love" className="flex items-center gap-1 cursor-pointer">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>厳格</span>
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="humor" id="humor" />
          <Label htmlFor="humor" className="flex items-center gap-1 cursor-pointer">
            <Coffee className="h-4 w-4 text-blue-500" />
            <span>ユーモア</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
*/

// ダミーコンポーネントを返す
// トーンセレクターの実装は現在コメントアウト中
// 将来のリファクタリング時に実装予定
export default function ToneSelector({ value, onChange }: any) {
  // 何も表示しない空のコンポーネントを返す
  return null;
}

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Smile, Zap, Coffee } from 'lucide-react';

interface ToneSelectorProps {
  value: 'friendly' | 'tough-love' | 'humor';
  onChange: (value: 'friendly' | 'tough-love' | 'humor') => void;
}

export default function ToneSelector({ value, onChange }: ToneSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">コーチのトーン</h3>
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as 'friendly' | 'tough-love' | 'humor')}
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

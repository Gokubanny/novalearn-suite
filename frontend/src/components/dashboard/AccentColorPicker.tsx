import { Check, Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ACCENT_PRESETS } from '@/hooks/useAccentColor';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AccentColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  defaultColor: string;
}

export function AccentColorPicker({ currentColor, onColorChange, defaultColor }: AccentColorPickerProps) {
  const handleSelect = (color: string) => {
    onColorChange(color);
    toast.success('Accent color updated!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Dashboard Theme
        </CardTitle>
        <CardDescription>Choose your accent color to personalize your dashboard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-5 gap-3">
          {ACCENT_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handleSelect(preset.value)}
              className={cn(
                "group relative w-full aspect-square rounded-xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                currentColor === preset.value && "ring-2 ring-offset-2 ring-foreground scale-110"
              )}
              style={{ backgroundColor: preset.value }}
              title={preset.name}
            >
              {currentColor === preset.value && (
                <Check className="h-5 w-5 text-white absolute inset-0 m-auto drop-shadow-md" />
              )}
              <span className="sr-only">{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: currentColor }}
          >
            N
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Preview</p>
            <p className="text-xs text-muted-foreground">This is how your sidebar and accents will look</p>
          </div>
          <div
            className="h-8 px-4 rounded-md flex items-center text-white text-xs font-medium"
            style={{ backgroundColor: currentColor }}
          >
            Button
          </div>
        </div>

        {currentColor !== defaultColor && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSelect(defaultColor)}
            className="text-muted-foreground"
          >
            Reset to default
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

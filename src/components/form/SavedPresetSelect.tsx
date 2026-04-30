import { type FC, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { History, Check } from 'lucide-react';
import type { FormSchema, RecordSchema } from '@/pages/recordSchema';
import {
    LOCATION_FIELDS, EVENT_FIELDS,
    buildLocationLabel, buildEventLabel,
} from '@/pages/recordValidation';

type PresetType = 'location' | 'event';

interface Props {
    type: PresetType;
    currentIndex: number;
}

interface Preset {
    label: string;
    sourceIndex: number;
    data: Partial<RecordSchema>;
}

const FIELD_KEYS: Record<PresetType, readonly string[]> = {
    location: LOCATION_FIELDS,
    event: EVENT_FIELDS,
};

const LABEL_BUILDERS: Record<PresetType, (d: Record<string, unknown>) => string> = {
    location: buildLocationLabel,
    event: buildEventLabel,
};

const BUTTON_TEXT: Record<PresetType, string> = {
    location: 'Заполнить как у другого образца (место)',
    event: 'Заполнить как у другого образца (событие)',
};

/**
 * Button + dropdown that lets the user reuse Location or Event data
 * from another sample within the same publication.
 * Hidden by default, shown only when user clicks the button.
 * After selection, the component hides again.
 */
const SavedPresetSelect: FC<Props> = ({ type, currentIndex }) => {
    const { setValue } = useFormContext<FormSchema>();
    const samples = useWatch<FormSchema, 'samples'>({ name: 'samples' });
    const [isOpen, setIsOpen] = useState(false);

    const presets = useMemo<Preset[]>(() => {
        if (!samples || samples.length <= 1) return [];

        const fields = FIELD_KEYS[type];
        const buildLabel = LABEL_BUILDERS[type];
        const seen = new Set<string>();
        const result: Preset[] = [];

        samples.forEach((sample, idx) => {
            if (idx === currentIndex) return;

            // Check if the sample has any data for these fields
            const hasData = fields.some(f => {
                const val = (sample as Record<string, unknown>)[f];
                return val !== null && val !== undefined && val !== '';
            });
            if (!hasData) return;

            const label = buildLabel(sample as Record<string, unknown>);
            if (seen.has(label)) return;
            seen.add(label);

            const data: Partial<RecordSchema> = {};
            for (const f of fields) {
                (data as Record<string, unknown>)[f] = (sample as Record<string, unknown>)[f];
            }
            result.push({ label, sourceIndex: idx, data });
        });

        return result;
    }, [samples, currentIndex, type]);

    if (presets.length === 0) return null;

    const handleSelect = (value: string) => {
        const idx = parseInt(value, 10);
        const preset = presets.find(p => p.sourceIndex === idx);
        if (!preset) return;

        const fields = FIELD_KEYS[type];
        for (const f of fields) {
            const val = (preset.data as Record<string, unknown>)[f];
            setValue(`samples.${currentIndex}.${f}` as any, val ?? null, { shouldDirty: true });
        }
        // Close and hide after selection
        setIsOpen(false);
    };

    if (isOpen) {
        return (
            <div className="mb-4">
                <Select onValueChange={handleSelect} defaultValue="">
                    <SelectTrigger className="w-full bg-blue-50 border-blue-200 text-sm h-10">
                        <SelectValue placeholder="Выберите образец для копирования…" />
                    </SelectTrigger>
                    <SelectContent>
                        {presets.map((p) => (
                            <SelectItem key={p.sourceIndex} value={String(p.sourceIndex)}>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-blue-600">#{samples.length - p.sourceIndex}</span>
                                    <span className="text-slate-700">{p.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    return (
        <div className="mb-4">
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
            >
                <History className="h-4 w-4" />
                {BUTTON_TEXT[type]}
            </Button>
        </div>
    );
};

export default SavedPresetSelect;

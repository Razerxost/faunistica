import { type FC, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History } from 'lucide-react';
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

const PLACEHOLDER: Record<PresetType, string> = {
    location: 'Использовать сохранённое место…',
    event: 'Использовать сохранённое событие…',
};

/**
 * Dropdown that lets the user reuse Location or Event data
 * from another sample within the same publication.
 */
const SavedPresetSelect: FC<Props> = ({ type, currentIndex }) => {
    const { setValue } = useFormContext<FormSchema>();
    const samples = useWatch<FormSchema, 'samples'>({ name: 'samples' });

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
    };

    return (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-blue-50/60 border border-blue-100">
            <History className="h-4 w-4 text-blue-500 shrink-0" />
            <Select onValueChange={handleSelect}>
                <SelectTrigger className="flex-1 bg-white border-blue-200 text-sm h-9">
                    <SelectValue placeholder={PLACEHOLDER[type]} />
                </SelectTrigger>
                <SelectContent>
                    {presets.map((p) => (
                        <SelectItem key={p.sourceIndex} value={String(p.sourceIndex)}>
                            <span className="text-xs text-slate-400 mr-1.5">#{samples.length - p.sourceIndex}</span>
                            {p.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default SavedPresetSelect;

import { type FC, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import Autocomplete from '@/components/ui/autocomplete';
import SavedPresetSelect from './SavedPresetSelect';
import { MapPin, Info } from 'lucide-react';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { useLazyGeoSearchQuery } from '@/api/utilAPI';
import { GEOREF_OPTIONS } from '@/pages/recordValidation';
import type { FormSchema } from '@/pages/recordSchema';

interface Props {
    index: number;
    publ_id: number;
}

const GeographyCard: FC<Props> = ({ index }) => {
    const { register, control, watch, setValue, formState: { errors } } = useFormContext<FormSchema>();
    const prefix = `samples.${index}` as const;
    const err = errors.samples?.[index];

    const regionValue = watch(`${prefix}.region`);

    // ── Geo search queries ──
    const [searchRegion, { isFetching: regionLoading }] = useLazyGeoSearchQuery();
    const [searchDistrict, { isFetching: districtLoading }] = useLazyGeoSearchQuery();

    const [regionSuggestions, setRegionSuggestions] = useState<string[]>([]);
    const [districtSuggestions, setDistrictSuggestions] = useState<string[]>([]);

    const handleRegionSearch = useDebouncedCallback(async (text: string) => {
        const result = await searchRegion({ field: 'region', text }).unwrap();
        setRegionSuggestions(result.suggestions ?? []);
    }, 300);

    const handleDistrictSearch = useDebouncedCallback(async (text: string) => {
        const result = await searchDistrict({ field: 'district', text, region: regionValue ?? undefined }).unwrap();
        setDistrictSuggestions(result.suggestions ?? []);
    }, 300);

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <MapPin className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Пространственная локализация</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* ── Saved preset ── */}
                <SavedPresetSelect type="location" currentIndex={index} />

                {/* ── Row 1: Coordinate origin + Remarks ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-b border-slate-100 pb-6">
                    <div className="space-y-3">
                        <Label className="font-medium">Происхождение координат <span className="text-red-500">*</span></Label>
                        <Controller
                            name={`${prefix}.georef_source`}
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    value={field.value ?? 'none'}
                                    onValueChange={field.onChange}
                                    className="space-y-2"
                                >
                                    {GEOREF_OPTIONS.map(opt => (
                                        <div key={opt.value} className="flex items-center space-x-2">
                                            <RadioGroupItem value={opt.value} id={`${prefix}_geo_${opt.value}`} />
                                            <Label htmlFor={`${prefix}_geo_${opt.value}`} className="font-normal text-slate-700 cursor-pointer">
                                                {opt.label}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${prefix}.location_remarks`}>Географические примечания</Label>
                        <Textarea
                            id={`${prefix}.location_remarks`}
                            className="h-28 resize-none"
                            placeholder="Примечания к местоположению…"
                            {...register(`${prefix}.location_remarks`)}
                        />
                    </div>
                </div>

                {/* ── Row 2: Administrative geography ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor={`${prefix}.country`}>Страна</Label>
                        <Input
                            id={`${prefix}.country`}
                            placeholder="RU"
                            defaultValue="RU"
                            {...register(`${prefix}.country`)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${prefix}.region`}>Регион (субъект)</Label>
                        <Controller
                            name={`${prefix}.region`}
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    id={`${prefix}.region`}
                                    value={field.value ?? ''}
                                    onChange={(val) => {
                                        field.onChange(val);
                                        setValue(`${prefix}.is_manual_location`, true);
                                    }}
                                    onSearch={handleRegionSearch}
                                    suggestions={regionSuggestions}
                                    isLoading={regionLoading}
                                    placeholder="Начните вводить…"
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${prefix}.district`}>Район</Label>
                        <Controller
                            name={`${prefix}.district`}
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    id={`${prefix}.district`}
                                    value={field.value ?? ''}
                                    onChange={(val) => {
                                        field.onChange(val);
                                        setValue(`${prefix}.is_manual_location`, true);
                                    }}
                                    onSearch={handleDistrictSearch}
                                    suggestions={districtSuggestions}
                                    isLoading={districtLoading}
                                    placeholder="Начните вводить…"
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${prefix}.locality`}>Локалитет (топоним)</Label>
                        <Input
                            id={`${prefix}.locality`}
                            placeholder="Исходное название места из статьи"
                            {...register(`${prefix}.locality`)}
                        />
                    </div>
                </div>

                {/* ── Row 3: Coordinates ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-100 pt-5">
                    <TooltipProvider>
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label htmlFor={`${prefix}.verbatimcoordinates`}>Координаты (исходный текст)</Label>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs text-xs">
                                        Координаты в формате оригинала статьи (доли градуса, минуты/секунды и т.д.).
                                        Сверяйтесь с источником и тщательно выбирайте формат.
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <Input
                                id={`${prefix}.verbatimcoordinates`}
                                placeholder="50.686 N, 54.472 E"
                                {...register(`${prefix}.verbatimcoordinates`)}
                            />
                        </div>
                    </TooltipProvider>

                    <div className="space-y-2">
                        <Label htmlFor={`${prefix}.latitude`}>Широта (°)</Label>
                        <Input
                            id={`${prefix}.latitude`}
                            type="number"
                            step="any"
                            min={-90}
                            max={90}
                            placeholder="от -90 до 90"
                            {...register(`${prefix}.latitude`, { valueAsNumber: true })}
                        />
                        {err?.latitude && <p className="text-xs text-red-500">{err.latitude.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`${prefix}.longitude`}>Долгота (°)</Label>
                        <Input
                            id={`${prefix}.longitude`}
                            type="number"
                            step="any"
                            min={-180}
                            max={180}
                            placeholder="от -180 до 180"
                            {...register(`${prefix}.longitude`, { valueAsNumber: true })}
                        />
                        {err?.longitude && <p className="text-xs text-red-500">{err.longitude.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`${prefix}.coordinate_uncertainty`}>Неопределённость, м</Label>
                        <Input
                            id={`${prefix}.coordinate_uncertainty`}
                            type="number"
                            min={30}
                            max={15000}
                            placeholder="30 – 15 000"
                            {...register(`${prefix}.coordinate_uncertainty`, { valueAsNumber: true })}
                        />
                        {err?.coordinate_uncertainty && <p className="text-xs text-red-500">{err.coordinate_uncertainty.message}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default GeographyCard;

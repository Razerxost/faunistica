import type { RecordData, DraftRecord, RecordFull } from '@/types/api.dto';
import type { RecordSchema, QuantityField } from '@/types/forms';

export const getFieldFromSexAndLifestage = (sex?: string | null, life_stage?: string | null): QuantityField | null => {
    if (sex === 'male' && life_stage === 'взрослые') return 'mmm';
    if (sex === 'male' && life_stage === 'субвзрослые') return 'ssm';
    if (sex === 'female' && life_stage === 'взрослые') return 'fff';
    if (sex === 'female' && life_stage === 'субвзрослые') return 'ssf';
    if ((sex === 'none' || !sex) && life_stage === 'взрослые') return 'adu';
    if ((sex === 'none' || !sex) && life_stage === 'ювенильные') return 'juv';
    return null;
};

export const getSexAndLifestageFromField = (field: string): { sex: string; life_stage: string } => {
    switch (field) {
        case 'mmm': return { sex: 'male', life_stage: 'взрослые' };
        case 'ssm': return { sex: 'male', life_stage: 'субвзрослые' };
        case 'fff': return { sex: 'female', life_stage: 'взрослые' };
        case 'ssf': return { sex: 'female', life_stage: 'субвзрослые' };
        case 'adu': return { sex: 'none', life_stage: 'взрослые' };
        case 'juv': return { sex: 'none', life_stage: 'ювенильные' };
        default: return { sex: 'none', life_stage: 'none' };
    }
};

/**
 * Groups flat API records (one per sex/lifestage) into DraftRecords
 * where each draft represents a single sample with multiple quantity fields.
 */
export const groupRecordsIntoDrafts = (records: RecordFull[]): DraftRecord[] => {
    return records.map(record => {
        const draft: DraftRecord = {
            ...record,
            record_ids: { 'base': record.id },
        };

        if (record.specimens) {
            record.specimens.forEach(spec => {
                const field = getFieldFromSexAndLifestage(spec.sex, spec.life_stage);
                if (field) {
                    (draft as any)[field] = spec.count;
                }
            });
        }

        return draft;
    });
};

/**
 * Convert a form DraftRecord back to the flat RecordData shape expected by the API.
 * Strips quantity fields and record_ids – caller handles those separately.
 */
export const draftToRecordData = (draft: Partial<RecordSchema>): RecordData => {
    const data: RecordData = {};

    // Copy all string/number/boolean fields that exist in RecordData
    const fieldsToCopy: (keyof RecordData)[] = [
        'country', 'region', 'district', 'locality', 'is_manual_location',
        'latitude', 'longitude', 'verbatimcoordinates', 'coordinate_uncertainty',
        'georef_source', 'location_remarks',
        'verbatim_date', 'date_precision', 'is_interval',
        'habitat', 'sampling_protocol', 'sampling_effort',
        'sample_size_value', 'sample_size_unit',
        'event_remarks', 'field_number', 'catalog_number', 'collection_code',
        'recorded_by',
        'family', 'genus', 'species', 'tax_verbatim', 'taxon_rank',
        'type_status', 'accepted_name', 'taxon_remarks',
        'quantity_type', 'occurrence_remarks', 'identification_remarks',
    ];

    for (const key of fieldsToCopy) {
        const val = (draft as any)[key];
        if (val !== undefined) {
            if ((key === 'latitude' || key === 'longitude') && val !== null) {
                (data as any)[key] = String(val);
            } else {
                (data as any)[key] = val;
            }
        }
    }

    // Process specimens
    const specimens: any[] = [];
    const quantityFields = ['mmm', 'ssm', 'fff', 'ssf', 'adu', 'juv'] as const;
    
    for (const field of quantityFields) {
        const count = (draft as any)[field];
        if (count !== undefined && count !== null && count > 0) {
            const { sex, life_stage } = getSexAndLifestageFromField(field);
            specimens.push({ sex, life_stage, count });
        }
    }
    
    if (specimens.length > 0) {
        data.specimens = specimens;
    }

    return data;
};

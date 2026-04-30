import { z } from "zod";
import { LAT_MIN, LAT_MAX, LNG_MIN, LNG_MAX, UNCERTAINTY_MIN, UNCERTAINTY_MAX } from "./recordValidation";

// ── Single record (sample) schema ──
export const recordSchema = z.object({
    // ═══ LOCATION ═══
    georef_source: z.enum(['lit', 'vol', 'none']).nullable().optional(),
    country: z.string().nullable().optional(),
    region: z.string().nullable().optional(),
    district: z.string().nullable().optional(),
    locality: z.string().nullable().optional(),
    is_manual_location: z.boolean().nullable().optional(),
    verbatimcoordinates: z.string().nullable().optional(),
    latitude: z.number().min(LAT_MIN, `Мин. ${LAT_MIN}`).max(LAT_MAX, `Макс. ${LAT_MAX}`).nullable().optional(),
    longitude: z.number().min(LNG_MIN, `Мин. ${LNG_MIN}`).max(LNG_MAX, `Макс. ${LNG_MAX}`).nullable().optional(),
    coordinate_uncertainty: z.number().min(UNCERTAINTY_MIN, `Мин. ${UNCERTAINTY_MIN}`).max(UNCERTAINTY_MAX, `Макс. ${UNCERTAINTY_MAX}`).nullable().optional(),
    location_remarks: z.string().nullable().optional(),

    // ═══ EVENT + OCCURRENCE ═══
    verbatim_date: z.string().nullable().optional(),
    date_precision: z.string().nullable().optional(),
    is_interval: z.boolean().nullable().optional(),
    habitat: z.string().nullable().optional(),
    sampling_protocol: z.string().nullable().optional(),
    sampling_effort: z.string().nullable().optional(),
    sample_size_value: z.number().nullable().optional(),
    sample_size_unit: z.string().nullable().optional(),
    event_remarks: z.string().nullable().optional(),
    field_number: z.string().nullable().optional(),
    catalog_number: z.string().nullable().optional(),
    collection_code: z.string().nullable().optional(),
    recorded_by: z.string().nullable().optional(),

    // ═══ TAXONOMY ═══
    family: z.string().nullable().optional(),
    genus: z.string().nullable().optional(),
    species: z.string().nullable().optional(),
    tax_verbatim: z.boolean().nullable().optional(),
    taxon_rank: z.enum(['genus', 'species', 'subspecies']).nullable().optional(),
    type_status: z.string().nullable().optional(),
    accepted_name: z.string().nullable().optional(),
    taxon_remarks: z.string().nullable().optional(),
    identification_remarks: z.string().nullable().optional(),

    // ═══ QUANTITIES ═══
    quantity_type: z.string().nullable().optional(),
    occurrence_remarks: z.string().nullable().optional(),
    mmm: z.number().min(0).nullable().optional(),
    ssm: z.number().min(0).nullable().optional(),
    fff: z.number().min(0).nullable().optional(),
    ssf: z.number().min(0).nullable().optional(),
    adu: z.number().min(0).nullable().optional(),
    juv: z.number().min(0).nullable().optional(),

    // ═══ INTERNAL (not sent to API) ═══
    record_ids: z.record(z.string(), z.string()).optional(),
});

// ── Form wrapping array of samples ──
export const formSchema = z.object({
    samples: z.array(recordSchema),
});

export type FormSchema = z.infer<typeof formSchema>;
export type RecordSchema = z.infer<typeof recordSchema>;

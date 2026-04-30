import { type FC, useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { formSchema, type FormSchema } from './recordSchema';
import { QUANTITY_FIELDS } from './recordValidation';
import { useGetRecordsDataQuery, useCreateRecordMutation, useEditRecordMutation, useDeleteRecordMutation } from '@/api/recordAPI';
import { groupRecordsIntoDrafts, getSexAndLifestageFromField, draftToRecordData } from './recordUtils';

import ArticleSourceCard from '@/components/form/ArticleSourceCard';
import GeographyCard from '@/components/form/GeographyCard';
import CollectionEventCard from '@/components/form/CollectionEventCard';
import TaxonomyCard from '@/components/form/TaxonomyCard';
import QuantitiesCard from '@/components/form/QuantitiesCard';
import Sidebar from '@/components/form/FormSidebar';
import Footer from '@/components/form/FormFooter';
import { SidebarProvider } from '@/components/ui/sidebar';
import LoadingScreen from '@/components/LoadingScreen';

import { toast } from 'sonner';
import type { DraftRecord } from '@/types/api.dto';

interface OutletContextType {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

const FormFilling: FC = () => {
    const { isSidebarOpen, setIsSidebarOpen } = useOutletContext<OutletContextType>();
    const { id } = useParams<{ id: string }>();
    const publ_id = Number(id);
    const user_id = useSelector((state: RootState) => state.user.user_id);

    const [activeSampleIndex, setActiveSampleIndex] = useState(0);

    const { data: recordsData, isLoading } = useGetRecordsDataQuery(
        { publ_id, user_id: user_id! },
        { skip: !user_id || !publ_id },
    );

    const [createRecord] = useCreateRecordMutation();
    const [editRecord] = useEditRecordMutation();
    const [deleteRecord] = useDeleteRecordMutation();

    const methods = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            samples: [{}],
        },
    });

    const { control, reset, getValues } = methods;

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'samples',
    });

    useEffect(() => {
        if (recordsData?.items) {
            const drafts = groupRecordsIntoDrafts(recordsData.items);
            if (drafts.length > 0) {
                reset({ samples: drafts as any });
            } else {
                reset({ samples: [{}] });
            }
        }
    }, [recordsData, reset]);

    const addSample = () => {
        append({});
        setActiveSampleIndex(fields.length);
    };

    const removeSample = async (index: number) => {
        const sample = getValues(`samples.${index}`) as DraftRecord;
        if (sample.record_ids) {
            for (const record_id of Object.values(sample.record_ids)) {
                await deleteRecord({ record_id, user_id: user_id! });
            }
            toast.success('Образец удален из базы данных');
        }

        remove(index);

        setActiveSampleIndex(prev => {
            if (fields.length - 1 === 0) return 0;
            if (prev === index) return 0;
            if (index < prev) return prev - 1;
            return prev;
        });
    };

    const onSubmit = async (data: FormSchema) => {
        try {
            for (const sample of data.samples) {
                const baseData = draftToRecordData(sample, publ_id);
                const newRecordIds: Record<string, string> = { ...sample.record_ids };

                for (const field of QUANTITY_FIELDS) {
                    const quantity = (sample as any)[field];
                    const existingId = sample.record_ids?.[field];

                    if (quantity !== undefined && quantity !== null && quantity > 0) {
                        const { sex, life_stage } = getSexAndLifestageFromField(field);
                        const recordData = {
                            ...baseData,
                            quantity,
                            sex,
                            life_stage,
                        };

                        if (existingId) {
                            await editRecord({ ...recordData, record_id: existingId, user_id: user_id! }).unwrap();
                        } else {
                            const created = await createRecord({ publ_id, user_id: user_id! }).unwrap();
                            await editRecord({ ...recordData, record_id: created.id, user_id: user_id! }).unwrap();
                            newRecordIds[field] = created.id;
                        }
                    } else if (existingId) {
                        await deleteRecord({ record_id: existingId, user_id: user_id! }).unwrap();
                        delete newRecordIds[field];
                    }
                }
                sample.record_ids = newRecordIds;
            }
            toast.success('Данные успешно сохранены');
        } catch (error) {
            toast.error('Ошибка при сохранении данных');
            console.error(error);
        }
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <FormProvider {...methods}>
            <SidebarProvider open={true} openMobile={isSidebarOpen} onOpenMobileChange={setIsSidebarOpen} className="flex-1">
                <Sidebar
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    activeSampleIndex={activeSampleIndex}
                    setActiveSampleIndex={setActiveSampleIndex}
                    addSample={addSample}
                    removeSample={removeSample}
                />
                <main className="flex-1 flex flex-col w-full min-w-0 relative">
                    <form onSubmit={methods.handleSubmit(onSubmit)} className="flex-1 w-full p-4 md:p-8 pb-[180px] md:pb-[120px]">
                        <div className="max-w-6xl mx-auto space-y-6">
                            {fields.length > 0 && (
                                <>
                                    <ArticleSourceCard index={activeSampleIndex} />
                                    <GeographyCard index={activeSampleIndex} publ_id={publ_id} />
                                    <CollectionEventCard index={activeSampleIndex} publ_id={publ_id} />
                                    <TaxonomyCard index={activeSampleIndex} />
                                    <QuantitiesCard index={activeSampleIndex} />
                                </>
                            )}
                        </div>
                    </form>
                    <Footer />
                </main>
            </SidebarProvider>
        </FormProvider>
    );
};

export default FormFilling;
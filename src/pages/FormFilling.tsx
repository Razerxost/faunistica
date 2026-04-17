import { type FC } from "react";
import ArticleSourceCard from "@/components/forms/ArticleSourceCard";
import QuantitiesCard from "@/components/forms/QuantitiesCard";
import TaxonomyCard from "@/components/forms/TaxonomyCard";
import CollectionEventCard from "@/components/forms/CollectionEventCard";
import GeographyCard from "@/components/forms/GeographyCard";

const FormFilling: FC = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <ArticleSourceCard />
            <GeographyCard />
            <QuantitiesCard />
            <TaxonomyCard />
            <CollectionEventCard />
        </div>
    );
};

export default FormFilling;
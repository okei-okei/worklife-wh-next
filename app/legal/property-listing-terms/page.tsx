import LegalDocumentPage from "../_components/LegalDocumentPage";
import { getLegalDocument } from "../_data/legalDocuments";

export default function PropertyListingTermsPage() {
  return (
    <LegalDocumentPage document={getLegalDocument("property-listing-terms")!} />
  );
}

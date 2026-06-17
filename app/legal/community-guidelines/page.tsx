import LegalDocumentPage from "../_components/LegalDocumentPage";
import { getLegalDocument } from "../_data/legalDocuments";

export default function CommunityGuidelinesPage() {
  return (
    <LegalDocumentPage document={getLegalDocument("community-guidelines")!} />
  );
}

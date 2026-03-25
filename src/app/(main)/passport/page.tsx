import { PassportCard } from "@/components/passport-card";
import { PageHeader } from "@/components/page-header";
import { generatePassportData } from "@/server/actions/passport";
import { getBusinessId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PassportPage() {
  const businessId = await getBusinessId();
  const passportData = await generatePassportData(businessId);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Passeport Financier" />

      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <PassportCard data={passportData} />
      </div>
    </div>
  );
}

import { getBusiness } from "@/server/actions/businesses";
import { ProfileForm } from "@/components/profile-form";
import { getBusinessId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const businessId = await getBusinessId();
  const business = await getBusiness(businessId);

  return <ProfileForm business={business} />;
}

import PrivacyRequestsTable from "@/components/privacy-requests-table";

export default function PrivacyRequestsPage() {
  return (
    <div style={{ padding: "24px" }}>
      <h2 style={{ marginBottom: 16 }}>Data Subject Requests</h2>
      <PrivacyRequestsTable />
    </div>
  );
}

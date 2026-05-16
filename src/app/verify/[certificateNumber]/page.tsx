import CertificateVerifierPanel from "@/components/certificate-verifier";

export default async function CertificateVerifierPage({
  params,
}: {
  params: Promise<{ certificateNumber: string }>;
}) {
  const { certificateNumber } = await params;

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "40px 16px",
        background: "#f5f5f5",
      }}
    >
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
          InspectPH — Certificate Verification
        </h1>
        <p style={{ color: "#666", marginTop: 4 }}>
          Scan a QR code on any InspectPH certificate to verify its authenticity
        </p>
      </div>
      <CertificateVerifierPanel certificateNumber={certificateNumber} />
    </div>
  );
}

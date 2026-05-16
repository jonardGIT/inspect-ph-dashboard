import { Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

export default function PrivacyNoticePage() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
      <Title level={2}>Privacy Notice</Title>
      <Paragraph type="secondary">Effective date: May 16, 2026</Paragraph>

      <Title level={4}>Who we are</Title>
      <Paragraph>
        InspectPH is a government inspection management platform operated by
        participating local government units (LGUs) in the Philippines. We
        process personal data to enable public safety inspections, permit
        management, and regulatory compliance.
      </Paragraph>

      <Title level={4}>What data we collect</Title>
      <Paragraph>
        We collect information you provide when you register (name, email
        address, role), when you submit issue reports (description, location,
        photographs), and when you use business owner features (business
        details, contact information). Inspectors additionally provide location
        data during active inspections.
      </Paragraph>

      <Title level={4}>How we use your data</Title>
      <Paragraph>
        Your data is used to manage inspection schedules, issue corrective
        action plans, send notifications, generate compliance certificates, and
        produce aggregate analytics for LGU governance. We do not sell your data
        to third parties.
      </Paragraph>

      <Title level={4}>Retention periods</Title>
      <Paragraph>
        We retain data for the following periods in accordance with NPC and COA
        requirements:
      </Paragraph>
      <ul>
        <li>
          <Text strong>Inspection records:</Text> 10 years after completion
        </li>
        <li>
          <Text strong>Attachment files:</Text> 5 years after capture
        </li>
        <li>
          <Text strong>Audit logs:</Text> 7 years
        </li>
        <li>
          <Text strong>Issue report descriptions:</Text> 2 years, then
          anonymized
        </li>
        <li>
          <Text strong>Account data:</Text> Duration of account plus 3 years
          after closure
        </li>
      </ul>

      <Title level={4}>Your rights</Title>
      <Paragraph>
        Under the Philippine Data Privacy Act of 2012 (RA 10173), you have the
        right to:
      </Paragraph>
      <ul>
        <li>
          <Text strong>Access</Text> — request a copy of the personal data we
          hold about you
        </li>
        <li>
          <Text strong>Correction</Text> — request correction of inaccurate data
        </li>
        <li>
          <Text strong>Erasure</Text> — request deletion of your data (subject
          to legal retention requirements)
        </li>
        <li>
          <Text strong>Object</Text> — object to processing for direct marketing
        </li>
        <li>
          <Text strong>Portability</Text> — receive your data in a structured,
          machine-readable format
        </li>
      </ul>
      <Paragraph>
        To exercise these rights, use our{" "}
        <a href="/privacy/submit">Data Subject Request form</a>.
      </Paragraph>

      <Title level={4}>Security</Title>
      <Paragraph>
        We use industry-standard security measures including TLS encryption in
        transit, bcrypt password hashing, JWT authentication with short-lived
        tokens, and server-side access controls. We conduct periodic security
        reviews and maintain an incident response plan.
      </Paragraph>

      <Title level={4}>Data Protection Officer</Title>
      <Paragraph>
        For privacy concerns, contact our Data Protection Officer at{" "}
        <a href="mailto:privacy@inspect.ph">privacy@inspect.ph</a>.
      </Paragraph>

      <Paragraph type="secondary" style={{ marginTop: 32 }}>
        This notice may be updated periodically. The effective date at the top
        of this page reflects the most recent revision.
      </Paragraph>
    </div>
  );
}

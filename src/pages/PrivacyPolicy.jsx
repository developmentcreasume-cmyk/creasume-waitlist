import LegalPage from './LegalPage.jsx'

const SECTIONS = [
  {
    heading: '1. Information We Collect',
    paragraphs: ['We may collect the following categories of information:'],
    bullets: [
      'Creasume account information such as your name, email address, and login details.',
      'Profile and creator information you provide or connect, including social media handles and audience metrics.',
      'Usage data such as pages visited, features used, and device or browser information.',
      'Payment-related information processed through our payment partner. We do not store full card details ourselves.',
    ],
  },
  {
    heading: '2. How We Use Your Information',
    paragraphs: [
      'We use your information to provide and improve the Platform, create and display Influence Cards, calculate the Creasume Score, facilitate brand and creator interactions, process payments and subscriptions, and communicate with you about your account.',
    ],
  },
  {
    heading: '3. Social Media and Third-Party Integrations',
    paragraphs: [
      'Where you choose to connect a social media account, we access only the data permitted by you and by the relevant platform, used to build your creator profile and metrics. We handle such data in line with that platform’s developer terms and only for the purposes described in this Policy. You may disconnect an integration at any time.',
    ],
  },
  {
    heading: '4. Sharing of Information',
    paragraphs: [
      'We do not sell your personal data. We may share information with service providers who help us operate the Platform (such as hosting, analytics, and payment processing), with brands or creators only as needed to facilitate a transaction you initiate, and where required by law.',
    ],
  },
  {
    heading: '5. Data Security',
    paragraphs: [
      'We use reasonable technical and organizational measures to protect your information. No method of transmission or storage is fully secure, and we cannot guarantee absolute security.',
    ],
  },
  {
    heading: '6. Data Retention',
    paragraphs: [
      'We retain personal data for as long as necessary to provide the services and for any period required by applicable law, after which it is deleted or anonymized.',
    ],
  },
  {
    heading: '7. Your Rights',
    paragraphs: [
      'Subject to applicable law, you may request access to, correction of, or deletion of your personal data, and you may withdraw consent for optional processing. To exercise these rights, contact us using the details below.',
    ],
  },
  {
    heading: '8. Grievance Redressal',
    paragraphs: [
      'If you have any concern about your data, you may contact our Grievance Officer at core.creasume@gmail.com. We will respond within a reasonable time.',
    ],
  },
  {
    heading: '9. Changes to This Policy',
    paragraphs: [
      'We may update this Policy from time to time. The latest version will always be available on this page with a revised effective date.',
    ],
  },
  {
    heading: '10. Contact Us',
    paragraphs: ['For any questions about this Policy, contact us at core.creasume@gmail.com.'],
  },
]

function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="This Privacy Policy explains how Creasume (“we”, “us”, or “the Platform”) collects, uses, and protects information when you use our website and services. By using the Platform, you agree to this Policy."
      sections={SECTIONS}
    />
  )
}

export default PrivacyPolicy

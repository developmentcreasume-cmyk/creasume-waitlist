import LegalPage from './LegalPage.jsx'

const SECTIONS = [
  {
    heading: '1. Eligibility',
    paragraphs: [
      'You must be at least 18 years of age, or the age of majority in your jurisdiction, and capable of entering into a binding contract to use the Platform.',
    ],
  },
  {
    heading: '2. The Service',
    paragraphs: [
      'Creasume is a creator intelligence and deal facilitation platform that helps creators present their profiles as Influence Cards, provides a Creasume Score, and enables structured interactions between creators and brands. We may add, modify, or discontinue features at any time.',
    ],
  },
  {
    heading: '3. Accounts',
    paragraphs: [
      'You are responsible for the accuracy of the information you provide and for keeping your login credentials confidential. You are responsible for activity that occurs under your account.',
    ],
  },
  {
    heading: '4. Acceptable Use',
    paragraphs: [
      'You agree not to misuse the Platform, including by providing false information, infringing the rights of others, attempting to disrupt the service, or using it for any unlawful purpose.',
    ],
  },
  {
    heading: '5. Payments, Subscriptions, and Refunds',
    paragraphs: [
      'Certain features may require payment or a subscription. Fees, billing cycles, and any free trial will be shown to you before you pay. Unless stated otherwise at the point of purchase, subscriptions may renew automatically until cancelled. Refunds, if any, are governed by our refund terms shown at checkout. [INSERT REFUND WINDOW AND CONDITIONS].',
    ],
  },
  {
    heading: '6. Intellectual Property',
    paragraphs: [
      'The Platform, including its design, content, and branding, belongs to Creasume. You retain ownership of the content you submit, and you grant us a limited licence to use it to operate and display the service.',
    ],
  },
  {
    heading: '7. Third-Party Services',
    paragraphs: [
      'The Platform may integrate with third-party services. Your use of those services is subject to their own terms, and we are not responsible for them.',
    ],
  },
  {
    heading: '8. Disclaimers and Limitation of Liability',
    paragraphs: [
      'The Platform is provided on an “as is” basis. To the maximum extent permitted by law, we are not liable for any indirect or consequential loss arising from your use of the Platform, and our total liability is limited to the amount you paid to us in the preceding [NUMBER] months.',
    ],
  },
  {
    heading: '9. Termination',
    paragraphs: [
      'We may suspend or terminate your access if you breach these Terms or use the Platform in a way that may cause harm or legal risk.',
    ],
  },
  {
    heading: '10. Governing Law and Disputes',
    paragraphs: [
      'These Terms are governed by the laws of India. Any dispute will be subject to the exclusive jurisdiction of the courts at Indore, Madhya Pradesh.',
    ],
  },
  {
    heading: '11. Changes to These Terms',
    paragraphs: [
      'We may revise these Terms from time to time. Continued use of the Platform after changes take effect constitutes acceptance of the revised Terms.',
    ],
  },
  {
    heading: '12. Contact Us',
    paragraphs: ['For any questions about these Terms, contact us at core.creasume@gmail.com.'],
  },
]

function TermsConditions() {
  return (
    <LegalPage
      title="Terms and Conditions"
      intro="These Terms and Conditions (“Terms”) govern your use of Creasume (“the Platform”). By accessing or using the Platform, you agree to these Terms. If you do not agree, please do not use the Platform."
      sections={SECTIONS}
    />
  )
}

export default TermsConditions

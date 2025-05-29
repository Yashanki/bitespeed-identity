import prisma from '../prisma';

interface IdentifyRequest {
  email?: string;
  phoneNumber?: string;
}

export const handleIdentify = async ({ email, phoneNumber }: IdentifyRequest) => {
  if (!email && !phoneNumber) {
    throw new Error('At least one of email or phoneNumber must be provided');
  }

  const matchedContacts = await prisma.contact.findMany({
    where: {
      OR: [
        email ? { email } : undefined,
        phoneNumber ? { phoneNumber } : undefined,
      ].filter(Boolean) as any
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  let primaryContact = matchedContacts.find(c => c.linkPrecedence === 'primary') ?? matchedContacts[0];

  // If no contact found, create a new primary
  if (matchedContacts.length === 0) {
    const newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: 'primary'
      }
    });

    return {
      primaryContactId: newContact.id,
      emails: [newContact.email].filter(Boolean),
      phoneNumbers: [newContact.phoneNumber].filter(Boolean),
      secondaryContactIds: []
    };
  }

  const contactIds = matchedContacts.map(c => c.id);

  const newInfoPresent = !matchedContacts.some(c => c.email === email && c.phoneNumber === phoneNumber);

  if (newInfoPresent) {
    await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: 'secondary',
        linkedId: primaryContact.id
      }
    });
  }

  const allContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: primaryContact.id },
        { linkedId: primaryContact.id },
        { linkedId: { in: contactIds } }
      ]
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  const primary = allContacts.find(c => c.linkPrecedence === 'primary') ?? allContacts[0];
  const secondaries = allContacts.filter(c => c.id !== primary.id);

  return {
    primaryContactId: primary.id,
    emails: [...new Set(allContacts.map(c => c.email).filter(Boolean))],
    phoneNumbers: [...new Set(allContacts.map(c => c.phoneNumber).filter(Boolean))],
    secondaryContactIds: secondaries.map(c => c.id)
  };
};

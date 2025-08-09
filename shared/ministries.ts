export interface MinistryConfig {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  credentials: {
    username: string;
    password: string;
  };
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  description: string;
  departments: string[];
  specializations: string[];
}

export const MINISTRIES: Record<string, MinistryConfig> = {
  ministry: {
    id: "ministry",
    name: "Ministry of Health",
    code: "MOH",
    contactEmail: "health@kanostate.gov.ng",
    contactPhone: "08012345678",
    address: "Health Ministry Complex, Kano State Secretariat, Kano",
    credentials: {
      username: "ministry",
      password: "ministry123",
    },
    primaryColor: "#16a34a",
    secondaryColor: "#dcfce7",
    description:
      "Responsible for healthcare policy, medical services, and public health administration in Kano State",
    departments: [
      "Medical Services",
      "Public Health",
      "Hospital Management",
      "Pharmacy Services",
      "Primary Healthcare",
      "Epidemiology",
      "Health Information Systems",
      "Maternal and Child Health",
    ],
    specializations: [
      "Medical Equipment",
      "Healthcare Technology",
      "Pharmaceuticals",
      "Laboratory Equipment",
      "Medical Supplies",
      "Healthcare Infrastructure",
      "Telemedicine",
      "Public Health Programs",
    ],
  },
  ministry2: {
    id: "ministry2",
    name: "Ministry of Works and Infrastructure",
    code: "MOWI",
    contactEmail: "works@kanostate.gov.ng",
    contactPhone: "08012345679",
    address: "Works Ministry Complex, Kano State Secretariat, Kano",
    credentials: {
      username: "ministry2",
      password: "ministry123",
    },
    primaryColor: "#ea580c",
    secondaryColor: "#fed7aa",
    description:
      "Responsible for infrastructure development, road construction, and public works projects in Kano State",
    departments: [
      "Road Construction",
      "Bridge Engineering",
      "Building Construction",
      "Urban Planning",
      "Project Management",
      "Quality Control",
      "Maintenance Services",
      "Environmental Compliance",
    ],
    specializations: [
      "Road Construction",
      "Bridge Construction",
      "Building Materials",
      "Heavy Machinery",
      "Construction Equipment",
      "Infrastructure Development",
      "Urban Planning",
      "Environmental Engineering",
    ],
  },
  ministry3: {
    id: "ministry3",
    name: "Ministry of Education",
    code: "MOE",
    contactEmail: "education@kanostate.gov.ng",
    contactPhone: "08012345680",
    address: "Education Ministry Complex, Kano State Secretariat, Kano",
    credentials: {
      username: "ministry3",
      password: "ministry123",
    },
    primaryColor: "#2563eb",
    secondaryColor: "#dbeafe",
    description:
      "Responsible for education policy, school administration, and educational development in Kano State",
    departments: [
      "Basic Education",
      "Secondary Education",
      "Tertiary Education",
      "Adult Education",
      "Special Education",
      "Education Planning",
      "Curriculum Development",
      "Teacher Training",
    ],
    specializations: [
      "Educational Technology",
      "School Furniture",
      "Learning Materials",
      "Laboratory Equipment",
      "Library Resources",
      "Sports Equipment",
      "IT Infrastructure",
      "Educational Software",
    ],
  },
};

export const getMinistryByCredentials = (
  username: string,
  password: string,
): MinistryConfig | null => {
  for (const ministry of Object.values(MINISTRIES)) {
    if (
      ministry.credentials.username === username &&
      ministry.credentials.password === password
    ) {
      return ministry;
    }
  }
  return null;
};

export const getMinistryById = (id: string): MinistryConfig | null => {
  return MINISTRIES[id] || null;
};

export const getAllMinistries = (): MinistryConfig[] => {
  return Object.values(MINISTRIES);
};

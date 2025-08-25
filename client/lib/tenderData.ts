import { TenderStatus, tenderStatusChecker } from "./tenderSettings";
import { formatCurrency } from "./utils";

export interface Tender {
  id: string;
  title: string;
  category: string;
  value: string;
  deadline: string;
  location: string;
  views: number;
  status: TenderStatus;
  description: string;
  publishDate: string;
  closingDate: string;
  tenderFee: string;
  procuringEntity: string;
  duration: string;
  eligibility: string;
  requirements: string[];
  technicalSpecs: string[];
}

export interface ClosedTender {
  id: string;
  title: string;
  category: string;
  status: TenderStatus;
  closingDate: string;
  ministry: string;
  estimatedValue: number;
}

// Unified tender data source
export const getAllTenders = (): Tender[] => [
  {
    id: "MOWI-2024-001",
    title: "Construction of 50km Rural Roads in Kano North",
    category: "Infrastructure",
    value: "��2.5B",
    deadline: "2024-02-15",
    location: "Kano North LGA",
    views: 245,
    status: "Active" as TenderStatus,
    description:
      "The project involves the construction and upgrading of 50 kilometers of rural roads in Kano North Local Government Area to improve connectivity and access to rural communities.",
    publishDate: "2024-01-15",
    closingDate: "2024-02-15",
    tenderFee: "₦25,000",
    procuringEntity: "Kano State Ministry of Works",
    duration: "18 months",
    eligibility: "Category C contractors with road construction experience",
    requirements: [
      "Valid CAC certificate",
      "Tax clearance for last 3 years",
      "Professional license for civil engineering",
      "Evidence of similar projects (minimum 3)",
      "Financial capacity of at least ₦500M",
    ],
    technicalSpecs: [
      "Road width: 7.3 meters",
      "Pavement type: Flexible pavement with asphalt concrete wearing course",
      "Base course: Crushed stone base 150mm thick",
      "Sub-base: Selected material 200mm thick",
      "Drainage: Concrete lined drains on both sides",
    ],
  },
  {
    id: "MOH-2024-001",
    title: "Supply of Medical Equipment to Primary Health Centers",
    category: "Healthcare",
    value: "₦850M",
    deadline: "2024-01-20", // Made this past date so it shows as Closed
    location: "Statewide",
    views: 189,
    status: "Active" as TenderStatus, // Will be auto-converted to Closed
    description:
      "Procurement of essential medical equipment for 50 Primary Health Centers across Kano State to improve healthcare delivery and patient outcomes.",
    publishDate: "2024-01-01",
    closingDate: "2024-01-20", // Past date
    tenderFee: "₦15,000",
    procuringEntity: "Kano State Ministry of Health",
    duration: "6 months",
    eligibility: "Category B suppliers with healthcare equipment experience",
    requirements: [
      "Valid business registration",
      "ISO certification for medical devices",
      "Tax clearance certificates",
      "Manufacturer authorization letters",
      "After-sales service capability",
    ],
    technicalSpecs: [
      "Digital X-ray machines: 10 units",
      "Patient monitors: 50 units",
      "Ultrasound machines: 15 units",
      "Laboratory equipment: Complete set for 50 centers",
      "Installation and training included",
    ],
  },
  {
    id: "MOH-2024-002",
    title: "Pharmaceutical Procurement for State Hospitals",
    category: "Healthcare",
    value: "₦450M",
    deadline: "2024-01-15", // Past date
    location: "Statewide",
    views: 156,
    status: "Active" as TenderStatus, // Will be auto-converted to Closed
    description:
      "Procurement of essential pharmaceuticals and medical supplies for state hospitals and primary healthcare centers.",
    publishDate: "2023-12-20",
    closingDate: "2024-01-15", // Past date
    tenderFee: "₦10,000",
    procuringEntity: "Kano State Ministry of Health",
    duration: "12 months",
    eligibility: "Licensed pharmaceutical suppliers",
    requirements: [
      "NAFDAC registration",
      "Valid pharmacy license",
      "Tax clearance certificates",
      "Good distribution practice certificate",
      "Cold chain capability for vaccines",
    ],
    technicalSpecs: [
      "Essential drug list compliance",
      "WHO prequalified products",
      "Proper packaging and labeling",
      "Batch tracking capability",
      "Temperature-controlled storage",
    ],
  },
  {
    id: "MOH-2024-003",
    title: "Laboratory Equipment Upgrade Program",
    category: "Healthcare",
    value: "₦320M",
    deadline: "2023-12-30", // Past date
    location: "Statewide",
    views: 134,
    status: "Active" as TenderStatus, // Will be auto-converted to Closed
    description:
      "Comprehensive upgrade of laboratory equipment across state hospitals and diagnostic centers.",
    publishDate: "2023-11-15",
    closingDate: "2023-12-30", // Past date
    tenderFee: "₦12,000",
    procuringEntity: "Kano State Ministry of Health",
    duration: "8 months",
    eligibility: "Medical equipment suppliers with service capability",
    requirements: [
      "Manufacturer authorization",
      "Technical support capability",
      "Installation and training services",
      "Warranty and maintenance contract",
      "Local service center",
    ],
    technicalSpecs: [
      "Clinical chemistry analyzers: 5 units",
      "Hematology analyzers: 8 units",
      "Microscopy equipment: 20 units",
      "Blood bank equipment: Complete set",
      "Quality control materials included",
    ],
  },
  {
    id: "MOE-2024-001",
    title: "Rehabilitation of Government Secondary Schools",
    category: "Education",
    value: "₦1.8B",
    deadline: "2024-02-25",
    location: "Various LGAs",
    views: 156,
    status: "Active" as TenderStatus,
    description:
      "Comprehensive rehabilitation and renovation of 25 government secondary schools across Kano State including classroom blocks, laboratories, and recreational facilities.",
    publishDate: "2024-01-25",
    closingDate: "2024-02-25",
    tenderFee: "₦20,000",
    procuringEntity: "Kano State Ministry of Education",
    duration: "12 months",
    eligibility: "Category C contractors with school construction experience",
    requirements: [
      "Valid contractor registration",
      "Professional indemnity insurance",
      "Evidence of school projects completed",
      "Qualified project management team",
      "Environmental impact assessment capability",
    ],
    technicalSpecs: [
      "Classroom renovation: 150 classrooms",
      "Laboratory upgrade: 50 science labs",
      "Library facilities: 25 libraries",
      "Sports facilities: Football fields and courts",
      "Solar power installation for all schools",
    ],
  },
  {
    id: "MOE-2023-015",
    title: "School Furniture Procurement Program",
    category: "Education",
    value: "₦680M",
    deadline: "2023-12-15", // Past date
    location: "Statewide",
    views: 98,
    status: "Active" as TenderStatus, // Will be auto-converted to Closed
    description:
      "Supply of classroom furniture including desks, chairs, and storage units for government schools.",
    publishDate: "2023-11-01",
    closingDate: "2023-12-15", // Past date
    tenderFee: "₦12,000",
    procuringEntity: "Kano State Ministry of Education",
    duration: "4 months",
    eligibility: "Furniture manufacturers and suppliers",
    requirements: [
      "Manufacturing capability certification",
      "Quality standards compliance",
      "Delivery logistics capability",
      "After-sales service provision",
    ],
    technicalSpecs: [
      "Student desks: 5,000 units",
      "Student chairs: 10,000 units",
      "Teacher tables: 500 units",
      "Storage cabinets: 200 units",
      "Ergonomic design compliance",
    ],
  },
  {
    id: "MOWI-2023-018",
    title: "Bridge Construction and Maintenance",
    category: "Infrastructure",
    value: "��1.2B",
    deadline: "2023-11-30", // Past date
    location: "Kano South",
    views: 178,
    status: "Active" as TenderStatus, // Will be auto-converted to Closed
    description:
      "Construction of new bridges and maintenance of existing ones across major rivers in Kano South.",
    publishDate: "2023-10-15",
    closingDate: "2023-11-30", // Past date
    tenderFee: "₦18,000",
    procuringEntity: "Kano State Ministry of Works",
    duration: "14 months",
    eligibility: "Category A contractors with bridge construction experience",
    requirements: [
      "Structural engineering expertise",
      "Heavy equipment availability",
      "Safety compliance certification",
      "Environmental impact assessment",
    ],
    technicalSpecs: [
      "Concrete bridge construction: 3 bridges",
      "Steel reinforcement: Grade 60",
      "Foundation depth: 15 meters minimum",
      "Load capacity: 40 tons",
      "Seismic resistance compliance",
    ],
  },
];

// Convert tender to closed tender format for committee assignment
export const convertToClosedTender = (tender: Tender): ClosedTender => ({
  id: tender.id,
  title: tender.title,
  category: tender.category,
  status: tender.status,
  closingDate: tender.closingDate,
  ministry: tender.procuringEntity,
  estimatedValue:
    parseFloat(tender.value.replace(/[₦,BM]/g, "")) *
    (tender.value.includes("B") ? 1000000000 : 1000000),
});

// Get current user's ministry context
export const getCurrentMinistryContext = () => {
  try {
    const ministryUser = localStorage.getItem("ministryUser");
    if (ministryUser) {
      const userData = JSON.parse(ministryUser);
      return {
        ministryId: userData.ministryId,
        ministryCode:
          userData.ministryCode || userData.ministryId?.toUpperCase() || "MOH",
        ministryName: userData.ministryName,
      };
    }
  } catch (error) {
    console.error("Error parsing ministry user data:", error);
  }

  // Default fallback to MOH
  return {
    ministryId: "ministry",
    ministryCode: "MOH",
    ministryName: "Ministry of Health",
  };
};

// Get ministry-specific tenders
export const getMinistryTenders = (): Tender[] => {
  const { ministryCode, ministryId } = getCurrentMinistryContext();
  const allTenders = getAllTenders();

  console.log(`Ministry Context: Code=${ministryCode}, ID=${ministryId}`);
  console.log(`Total tenders available: ${allTenders.length}`);

  // Filter tenders based on ministry
  const filteredTenders = allTenders.filter((tender) => {
    // For Ministry of Health (MOH) - show healthcare tenders
    if (ministryCode === "MOH" || ministryId === "ministry") {
      const isHealthcare =
        tender.category === "Healthcare" ||
        tender.procuringEntity.includes("Ministry of Health");
      if (isHealthcare) {
        console.log(
          `Including healthcare tender: ${tender.id} - ${tender.title}`,
        );
      }
      return isHealthcare;
    }

    // For Ministry of Works and Infrastructure (MOWI)
    if (ministryCode === "MOWI" || ministryId === "ministry2") {
      const isInfrastructure =
        tender.category === "Infrastructure" ||
        tender.procuringEntity.includes("Ministry of Works");
      if (isInfrastructure) {
        console.log(
          `Including infrastructure tender: ${tender.id} - ${tender.title}`,
        );
      }
      return isInfrastructure;
    }

    // For Ministry of Education (MOE)
    if (ministryCode === "MOE" || ministryId === "ministry3") {
      const isEducation =
        tender.category === "Education" ||
        tender.procuringEntity.includes("Ministry of Education");
      if (isEducation) {
        console.log(
          `Including education tender: ${tender.id} - ${tender.title}`,
        );
      }
      return isEducation;
    }

    // Default: show all if ministry not recognized
    console.log(`Unknown ministry context, showing all tenders`);
    return true;
  });

  console.log(
    `Filtered tenders for ministry ${ministryCode}: ${filteredTenders.length} tenders`,
  );
  return filteredTenders;
};

// Get closed tenders for committee assignment (ministry-specific)
export const getClosedTenders = (): ClosedTender[] => {
  // Apply status transitions to a tender
  const applyStatusTransitions = (tender: Tender): Tender => {
    const automaticStatus = tenderStatusChecker.determineAutomaticStatus(
      tender.status,
      tender.closingDate || tender.deadline,
      tender.publishDate,
    );

    return {
      ...tender,
      status: automaticStatus,
    };
  };

  // Get all tenders using the same logic as AllTenders page
  const getAllTendersWithLocalStorage = (): Tender[] => {
    const storedTenders = localStorage.getItem("recentTenders");
    const { ministryCode, ministryName, ministryId } = getCurrentMinistryContext();

    if (storedTenders) {
      const parsedTenders = JSON.parse(storedTenders) as Tender[];
      if (parsedTenders.length > 0) {
        // Filter stored tenders to only include those belonging to current ministry
        const storedTendersForMinistry = parsedTenders.filter((t) => {
          const idMatches = t.id && t.id.toUpperCase().startsWith((ministryCode || ministryId || "").toUpperCase());
          const procuringMatches =
            typeof t.procuringEntity === "string" &&
            ministryName &&
            t.procuringEntity.includes(ministryName);
          return idMatches || procuringMatches;
        });

        console.log(`Filtered stored tenders for ministry ${ministryCode}: ${storedTendersForMinistry.length} out of ${parsedTenders.length} total`);

        // Apply currency formatting and automatic status transitions
        const formattedParsedTenders = storedTendersForMinistry.map((tender: Tender) => {
          const formatted = {
            ...tender,
            value: formatCurrency(tender.value),
          };
          return applyStatusTransitions(formatted);
        });

        // Combine stored tenders with default ones, removing duplicates
        const defaultTenders = getMinistryTenders().map(applyStatusTransitions);
        const allUniqueTenders = [...formattedParsedTenders];

        // Add default tenders that don't exist in stored tenders
        defaultTenders.forEach((defaultTender) => {
          if (
            !formattedParsedTenders.find(
              (t: Tender) => t.id === defaultTender.id,
            )
          ) {
            allUniqueTenders.push(defaultTender);
          }
        });

        return allUniqueTenders;
      } else {
        // If no stored tenders, just use defaults with status transitions
        return getMinistryTenders().map(applyStatusTransitions);
      }
    } else {
      // If no stored tenders, just use defaults with status transitions
      return getMinistryTenders().map(applyStatusTransitions);
    }
  };

  // Get all tenders (including localStorage) and filter for closed ones
  const allTenders = getAllTendersWithLocalStorage();
  console.log("All tenders for closed tender filtering:", allTenders.length);

  const closedTenders = allTenders
    .filter((tender) => {
      // Check if tender should be closed based on closing date
      const closingDate = new Date(tender.closingDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today to include today's closures

      const isClosed =
        closingDate < today ||
        tender.status === "Closed" ||
        tender.status === "Evaluation_Complete" ||
        tender.status === "Awarded";

      console.log(
        `Tender ${tender.id}: closing=${tender.closingDate}, today=${today.toISOString().split("T")[0]}, status=${tender.status}, isClosed=${isClosed}`,
      );

      if (isClosed) {
        console.log(
          `✓ Found closed tender: ${tender.id} - ${tender.title} (closed: ${tender.closingDate}, status: ${tender.status})`,
        );
      }

      return isClosed;
    })
    .map(convertToClosedTender);

  console.log(`Total closed tenders found: ${closedTenders.length}`);
  return closedTenders;
};

// Get tenders by category
export const getTendersByCategory = (category: string): Tender[] => {
  return getAllTenders().filter(
    (tender) =>
      category === "all" ||
      tender.category.toLowerCase() === category.toLowerCase(),
  );
};

// Get healthcare/health tenders specifically
export const getHealthcareTenders = (): Tender[] => {
  return getAllTenders().filter(
    (tender) =>
      tender.category === "Healthcare" ||
      tender.procuringEntity.includes("Ministry of Health") ||
      tender.procuringEntity.includes("Health"),
  );
};

// Export ministry-aware version as the default
export { getMinistryTenders as getDefaultTenders };

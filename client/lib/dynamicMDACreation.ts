import { MDA, CreateMDARequest } from "@shared/api";
import { MinistryConfig, getAllMinistries } from "@shared/ministries";
import { mdaLocalStorageService } from "./mdaLocalStorage";
import { logUserAction } from "./auditLogStorage";

/**
 * Enhanced MDA Creation Service
 * Integrates new MDAs with existing ministry functionality
 */
class DynamicMDACreationService {
  /**
   * Create MDA with full ministry-like functionality
   */
  async createFullyFunctionalMDA(
    data: CreateMDARequest,
    createdBy: string,
  ): Promise<MDA> {
    // Create the MDA using the existing service
    const newMDA = await mdaLocalStorageService.createMDA(data, createdBy);

    // Add ministry-like functionality
    await this.setupMinistryFunctionality(newMDA);

    // Log the creation
    logUserAction(
      createdBy,
      "super_admin",
      "MDA_CREATED",
      newMDA.name,
      `Created new ${newMDA.type}: ${newMDA.name} with full ministry functionality`,
      "HIGH",
      newMDA.id,
      {
        mdaType: newMDA.type,
        mdaName: newMDA.name,
        headOfMDA: newMDA.headOfMDA,
        totalBudget: newMDA.settings.totalBudget,
        allowedCategories: newMDA.settings.allowedCategories,
        creationTimestamp: new Date().toISOString(),
      },
    );

    return newMDA;
  }

  /**
   * Setup ministry-like functionality for new MDA
   */
  private async setupMinistryFunctionality(mda: MDA): Promise<void> {
    // 1. Create login credentials for the MDA
    this.createMDACredentials(mda);

    // 2. Setup dashboard configuration
    this.setupMDADashboard(mda);

    // 3. Initialize tender management
    this.initializeTenderManagement(mda);

    // 4. Setup procurement categories
    this.setupProcurementCategories(mda);

    // 5. Create initial administrative structure
    this.createInitialAdminStructure(mda);
  }

  /**
   * Create login credentials for the MDA (like existing ministries)
   */
  private createMDACredentials(mda: MDA): void {
    const credentials = {
      id: mda.id,
      username: mda.id.toLowerCase(),
      password: "mda123", // Default password
      type: mda.type,
    };

    // Store credentials for MDA login
    const existingCredentials = JSON.parse(
      localStorage.getItem("mdaCredentials") || "[]",
    );
    existingCredentials.push(credentials);
    localStorage.setItem("mdaCredentials", JSON.stringify(existingCredentials));
  }

  /**
   * Setup dashboard configuration for the MDA
   */
  private setupMDADashboard(mda: MDA): void {
    const dashboardConfig = {
      mdaId: mda.id,
      name: mda.name,
      code: this.generateMDACode(mda.name),
      type: mda.type,
      primaryColor: this.generatePrimaryColor(mda.type),
      secondaryColor: this.generateSecondaryColor(mda.type),
      features: {
        tenderManagement: true,
        bidEvaluation: true,
        contractManagement: true,
        reportGeneration: true,
        userManagement: true,
        nocRequests: true,
        budgetTracking: true,
      },
      settings: mda.settings,
    };

    // Store dashboard configuration
    const existingConfigs = JSON.parse(
      localStorage.getItem("mdaDashboardConfigs") || "[]",
    );
    existingConfigs.push(dashboardConfig);
    localStorage.setItem(
      "mdaDashboardConfigs",
      JSON.stringify(existingConfigs),
    );
  }

  /**
   * Initialize tender management for the MDA
   */
  private initializeTenderManagement(mda: MDA): void {
    const tenderConfig = {
      mdaId: mda.id,
      allowedCategories: mda.settings.allowedCategories,
      approvalThresholds: mda.settings.procurementThresholds,
      workflows: {
        standardTender: {
          steps: [
            "preparation",
            "publication",
            "bidding",
            "evaluation",
            "award",
          ],
          approvals: ["head_approval", "technical_review", "financial_review"],
        },
        smallValue: {
          steps: ["preparation", "quotation", "award"],
          approvals: ["head_approval"],
        },
      },
    };

    // Store tender configuration
    const existingTenderConfigs = JSON.parse(
      localStorage.getItem("mdaTenderConfigs") || "[]",
    );
    existingTenderConfigs.push(tenderConfig);
    localStorage.setItem(
      "mdaTenderConfigs",
      JSON.stringify(existingTenderConfigs),
    );

    // Initialize empty tender lists for this MDA
    localStorage.setItem(`${mda.id}_tenders`, JSON.stringify([]));
    localStorage.setItem(`${mda.id}_bids`, JSON.stringify([]));
    localStorage.setItem(`${mda.id}_evaluations`, JSON.stringify([]));
  }

  /**
   * Setup procurement categories based on MDA type and existing ministry patterns
   */
  private setupProcurementCategories(mda: MDA): void {
    const existingMinistries = getAllMinistries();
    let specializations: string[] = [];

    // Inherit specializations based on MDA type and similar ministries
    if (mda.type === "ministry") {
      // For new ministries, provide comprehensive categories
      specializations = [
        ...mda.settings.allowedCategories,
        "General Supplies",
        "Professional Services",
        "Maintenance Services",
        "Equipment Procurement",
      ];
    } else {
      // For departments/agencies, use more specific categories
      specializations = mda.settings.allowedCategories;
    }

    const categoryConfig = {
      mdaId: mda.id,
      specializations: [...new Set(specializations)], // Remove duplicates
      departments: this.generateDepartments(mda),
      capabilities: this.generateCapabilities(mda),
    };

    // Store category configuration
    const existingCategories = JSON.parse(
      localStorage.getItem("mdaCategoryConfigs") || "[]",
    );
    existingCategories.push(categoryConfig);
    localStorage.setItem(
      "mdaCategoryConfigs",
      JSON.stringify(existingCategories),
    );
  }

  /**
   * Create initial administrative structure
   */
  private createInitialAdminStructure(mda: MDA): void {
    const adminStructure = {
      mdaId: mda.id,
      headOfMDA: mda.headOfMDA,
      establishedDate: new Date().toISOString(),
      organizationalChart: {
        head: mda.headOfMDA,
        departments: this.generateDepartments(mda),
        roles: [
          "MDA Head",
          "Deputy Head",
          "Procurement Officer",
          "Finance Officer",
          "Technical Officer",
          "Administrative Officer",
        ],
      },
      budgetStructure: {
        totalBudget: mda.settings.totalBudget,
        budgetYear: mda.settings.budgetYear,
        allocations: {
          personnel: Math.floor(mda.settings.totalBudget * 0.4),
          operations: Math.floor(mda.settings.totalBudget * 0.35),
          capital: Math.floor(mda.settings.totalBudget * 0.25),
        },
      },
    };

    // Store administrative structure
    const existingStructures = JSON.parse(
      localStorage.getItem("mdaAdminStructures") || "[]",
    );
    existingStructures.push(adminStructure);
    localStorage.setItem(
      "mdaAdminStructures",
      JSON.stringify(existingStructures),
    );
  }

  /**
   * Generate MDA code based on name
   */
  private generateMDACode(name: string): string {
    const words = name.split(" ");
    if (words.length >= 2) {
      return words
        .map((word) => word.charAt(0).toUpperCase())
        .join("")
        .slice(0, 4);
    }
    return name.substring(0, 3).toUpperCase();
  }

  /**
   * Generate primary color based on MDA type
   */
  private generatePrimaryColor(type: string): string {
    const colorMap = {
      ministry: "#2563eb", // Blue
      department: "#16a34a", // Green
      agency: "#dc2626", // Red
    };
    return colorMap[type as keyof typeof colorMap] || "#6b7280";
  }

  /**
   * Generate secondary color based on MDA type
   */
  private generateSecondaryColor(type: string): string {
    const colorMap = {
      ministry: "#dbeafe", // Light blue
      department: "#dcfce7", // Light green
      agency: "#fecaca", // Light red
    };
    return colorMap[type as keyof typeof colorMap] || "#f3f4f6";
  }

  /**
   * Generate departments based on MDA type and name
   */
  private generateDepartments(mda: MDA): string[] {
    const baseDepartments = [
      "Administration",
      "Finance and Accounts",
      "Procurement",
      "Human Resources",
      "Planning and Research",
    ];

    // Add specialized departments based on MDA type and categories
    const specializedDepartments: string[] = [];

    mda.settings.allowedCategories.forEach((category) => {
      switch (category.toLowerCase()) {
        case "construction":
          specializedDepartments.push(
            "Engineering and Construction",
            "Project Management",
          );
          break;
        case "healthcare":
        case "medical equipment":
          specializedDepartments.push("Medical Services", "Public Health");
          break;
        case "education":
        case "educational technology":
          specializedDepartments.push(
            "Curriculum Development",
            "Teacher Training",
          );
          break;
        case "ict equipment":
        case "technology":
          specializedDepartments.push("IT Services", "Digital Innovation");
          break;
        default:
          break;
      }
    });

    return [...new Set([...baseDepartments, ...specializedDepartments])];
  }

  /**
   * Generate capabilities based on MDA
   */
  private generateCapabilities(mda: MDA): string[] {
    const baseCapabilities = [
      "Procurement Management",
      "Budget Planning",
      "Contract Administration",
      "Supplier Management",
      "Compliance Monitoring",
    ];

    const specializedCapabilities: string[] = [];

    mda.settings.allowedCategories.forEach((category) => {
      specializedCapabilities.push(`${category} Procurement`);
    });

    return [...baseCapabilities, ...specializedCapabilities];
  }

  /**
   * Create multiple sample MDAs for testing
   */
  async createSampleMDAs(createdBy: string): Promise<MDA[]> {
    const sampleMDAData = [
      {
        name: "Ministry of Agriculture and Rural Development",
        type: "ministry" as const,
        description:
          "Responsible for agricultural development, food security, and rural development initiatives in Kano State",
        contactEmail: "agriculture@kanostate.gov.ng",
        contactPhone: "08012345681",
        address: "Agriculture Ministry Complex, Kano State Secretariat, Kano",
        headOfMDA: "Dr. Aliyu Haruna",
        settings: {
          procurementThresholds: {
            level1: 10000000,
            level2: 50000000,
            level3: 200000000,
          },
          allowedCategories: [
            "Agricultural Equipment",
            "Seeds and Fertilizers",
            "Irrigation Systems",
            "Agricultural Technology",
            "Farm Machinery",
          ],
          customWorkflows: true,
          budgetYear: "2024",
          totalBudget: 8000000000,
        },
      },
      {
        name: "Kano State Urban Development Agency",
        type: "agency" as const,
        description:
          "Urban planning, development control, and infrastructure management for Kano metropolis",
        contactEmail: "urban@kanostate.gov.ng",
        contactPhone: "08012345682",
        address: "Urban Development Agency, Independence Road, Kano",
        headOfMDA: "Arch. Fatima Muhammad",
        settings: {
          procurementThresholds: {
            level1: 5000000,
            level2: 25000000,
            level3: 100000000,
          },
          allowedCategories: [
            "Urban Planning",
            "Infrastructure Development",
            "Building Materials",
            "Construction Equipment",
            "Environmental Services",
          ],
          customWorkflows: false,
          budgetYear: "2024",
          totalBudget: 3500000000,
        },
      },
      {
        name: "Department of Information Technology",
        type: "department" as const,
        description:
          "IT services, digital transformation, and technology infrastructure for Kano State government",
        parentMDA: "ministry3", // Under Ministry of Education for this example
        contactEmail: "it@kanostate.gov.ng",
        contactPhone: "08012345683",
        address: "IT Department, Government House, Kano",
        headOfMDA: "Engr. Musa Ibrahim",
        settings: {
          procurementThresholds: {
            level1: 3000000,
            level2: 15000000,
            level3: 50000000,
          },
          allowedCategories: [
            "ICT Equipment",
            "Software Licenses",
            "Network Infrastructure",
            "Cybersecurity Services",
            "Digital Solutions",
          ],
          customWorkflows: true,
          budgetYear: "2024",
          totalBudget: 2000000000,
        },
      },
      {
        name: "Ministry of Environment and Solid Waste Management",
        type: "ministry" as const,
        description:
          "Environmental protection, waste management, and climate change initiatives in Kano State",
        contactEmail: "environment@kanostate.gov.ng",
        contactPhone: "08012345684",
        address: "Environment Ministry Complex, Kano State Secretariat, Kano",
        headOfMDA: "Dr. Aisha Garba",
        settings: {
          procurementThresholds: {
            level1: 8000000,
            level2: 40000000,
            level3: 150000000,
          },
          allowedCategories: [
            "Environmental Equipment",
            "Waste Management Systems",
            "Pollution Control",
            "Renewable Energy",
            "Environmental Monitoring",
          ],
          customWorkflows: true,
          budgetYear: "2024",
          totalBudget: 6000000000,
        },
      },
    ];

    const createdMDAs: MDA[] = [];

    for (const mdaData of sampleMDAData) {
      try {
        const mda = await this.createFullyFunctionalMDA(mdaData, createdBy);
        createdMDAs.push(mda);
        console.log(`✅ Created sample MDA: ${mda.name}`);
      } catch (error) {
        console.error(`❌ Failed to create MDA: ${mdaData.name}`, error);
      }
    }

    return createdMDAs;
  }

  /**
   * Get all MDA configurations for dashboard integration
   */
  getMDAConfigurations(): any[] {
    return JSON.parse(localStorage.getItem("mdaDashboardConfigs") || "[]");
  }

  /**
   * Check if MDA has ministry-like functionality
   */
  hasMDAFunctionality(mdaId: string): boolean {
    const configs = this.getMDAConfigurations();
    return configs.some((config) => config.mdaId === mdaId);
  }
}

export const dynamicMDACreationService = new DynamicMDACreationService();

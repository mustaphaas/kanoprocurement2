import { MINISTRIES, getAllMinistries, MinistryConfig } from "@shared/ministries";
import { MDA, MDAAdmin, MDAUser, MDASettings } from "@shared/api";
import { mdaFirestoreService } from "./mdaFirestore";
import { hasFirebaseConfig } from "./firebase";

/**
 * MDA Initialization Service
 * 
 * This service is responsible for initializing the dynamic MDA system
 * with data from the static ministry configuration. It ensures that
 * the three pre-configured ministries are properly represented in
 * the MDA management system.
 */
class MDAInitializationService {
  private initialized = false;

  /**
   * Convert a static ministry configuration to an MDA object
   */
  private convertMinistryToMDA(ministry: MinistryConfig): Omit<MDA, 'id' | 'createdAt' | 'updatedAt'> {
    const baseSettings: MDASettings = {
      procurementThresholds: {
        level1: 5000000,    // ₦5M
        level2: 25000000,   // ₦25M
        level3: 100000000,  // ₦100M
      },
      allowedCategories: ministry.specializations,
      customWorkflows: true,
      budgetYear: new Date().getFullYear().toString(),
      totalBudget: this.getBudgetByMinistry(ministry.code),
    };

    return {
      name: ministry.name,
      type: "ministry",
      description: ministry.description,
      contactEmail: ministry.contactEmail,
      contactPhone: ministry.contactPhone,
      address: ministry.address,
      headOfMDA: this.getHeadOfMDAByMinistry(ministry.code),
      isActive: true,
      settings: baseSettings,
    };
  }

  /**
   * Get budget allocation based on ministry type
   */
  private getBudgetByMinistry(code: string): number {
    const budgetMap: Record<string, number> = {
      'MOH': 5000000000,   // ₦5B for Health
      'MOWI': 8500000000,  // ₦8.5B for Works & Infrastructure
      'MOE': 8000000000,   // ₦8B for Education
    };
    return budgetMap[code] || 3000000000; // Default ₦3B
  }

  /**
   * Get head of MDA based on ministry
   */
  private getHeadOfMDAByMinistry(code: string): string {
    const headMap: Record<string, string> = {
      'MOH': 'Dr. Amina Kano',
      'MOWI': 'Engr. Musa Abdullahi',
      'MOE': 'Prof. Muhammad Usman',
    };
    return headMap[code] || 'To be Assigned';
  }

  /**
   * Initialize MDAs from static ministry configuration
   * This method checks if MDAs already exist and creates them if not
   */
  async initializeMDAsFromMinistries(): Promise<void> {
    if (this.initialized) {
      console.log('MDA initialization already completed');
      return;
    }

    try {
      console.log('Starting MDA initialization from static ministries...');
      
      // Get existing MDAs
      const existingMDAs = await mdaFirestoreService.getAllMDAs();
      const existingMDAIds = existingMDAs.map(mda => mda.id);

      // Get all ministry configurations
      const ministries = getAllMinistries();

      for (const ministry of ministries) {
        // Check if MDA for this ministry already exists
        if (!existingMDAIds.includes(ministry.id)) {
          console.log(`Creating MDA for ${ministry.name}...`);
          
          const mdaData = this.convertMinistryToMDA(ministry);
          
          // Create the MDA using the firestore service
          await mdaFirestoreService.createMDA({
            ...mdaData,
            parentMDA: undefined, // Ministries don't have parent MDAs
          }, 'system-initializer');

          console.log(`✅ Created MDA for ${ministry.name}`);
        } else {
          console.log(`✓ MDA for ${ministry.name} already exists`);
        }
      }

      this.initialized = true;
      console.log('MDA initialization completed successfully');
    } catch (error) {
      console.error('Error during MDA initialization:', error);
      throw error;
    }
  }

  /**
   * Create default admin users for ministries if they don't exist
   */
  async initializeDefaultAdmins(): Promise<void> {
    try {
      console.log('Initializing default MDA admins...');
      
      const ministries = getAllMinistries();
      
      for (const ministry of ministries) {
        // Check if admin already exists for this ministry
        const existingAdmins = await mdaFirestoreService.getMDAAdmins(ministry.id);
        
        if (existingAdmins.length === 0) {
          console.log(`Creating default admin for ${ministry.name}...`);
          
          // Create default admin with ministry credentials
          const adminData = {
            mdaId: ministry.id,
            email: ministry.contactEmail,
            displayName: `${ministry.code} Administrator`,
            role: 'mda_super_admin' as const,
            permissions: {
              canCreateUsers: true,
              canManageTenders: true,
              canApproveContracts: true,
              canViewReports: true,
              canManageSettings: true,
              maxApprovalAmount: 50000000,
            },
          };

          await mdaFirestoreService.createMDAAdmin(adminData, 'system-initializer');
          console.log(`✅ Created default admin for ${ministry.name}`);
        } else {
          console.log(`✓ Admin already exists for ${ministry.name}`);
        }
      }
    } catch (error) {
      console.error('Error creating default admins:', error);
      throw error;
    }
  }

  /**
   * Get all ministries as MDAs for UI display
   * This method provides a fallback for UI rendering while Firebase is loading
   */
  getMinistryMDAs(): MDA[] {
    const ministries = getAllMinistries();
    return ministries.map(ministry => ({
      id: ministry.id,
      ...this.convertMinistryToMDA(ministry),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    }));
  }

  /**
   * Check if a ministry exists in the static configuration
   */
  isStaticMinistry(mdaId: string): boolean {
    return Object.keys(MINISTRIES).includes(mdaId);
  }

  /**
   * Get ministry configuration by ID
   */
  getMinistryConfig(mdaId: string): MinistryConfig | null {
    return MINISTRIES[mdaId] || null;
  }

  /**
   * Full initialization - both MDAs and admins
   */
  async initialize(): Promise<void> {
    try {
      await this.initializeMDAsFromMinistries();
      await this.initializeDefaultAdmins();
      console.log('🎉 Complete MDA system initialization finished');
    } catch (error) {
      console.error('❌ MDA initialization failed:', error);
      throw error;
    }
  }

  /**
   * Reset initialization flag (for testing)
   */
  reset(): void {
    this.initialized = false;
  }
}

export const mdaInitializer = new MDAInitializationService();

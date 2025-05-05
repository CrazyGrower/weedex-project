export interface Strain {
    id: number;
    name: string;
    brand: string;
    description: string | null;
    seedToHarvest: number;
    type: string;
    thcPercentage: number;
    averageYield: number;
    strainReview: number;
    imagePath: string | null;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface GrowLog {
    id: number;
    strainId: number;
    name: string;
    startDate: string;
    endDate: string;
    harvestAmount: number;
    reviewRating: number;
    notes: string | null;
    pdfPath: string | null;
    growlogUrl: string | null;
    createdAt: string;
    updatedAt: string;
  }
export interface Strain {
    id: number;
    number: string;
    name: string;
    brand: string;
    image_path: string | null;
    thumbnail_path: string | null;
    description: string | null;
    seed_to_harvest: number | null;
    type: string | null;
    thc_percentage: number | null;
    average_yield: number | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface GrowLog {
    id: number;
    strain_id: number;
    name: string;
    start_date: string;
    end_date: string | null;
    harvest_amount: number | null;
    review_rating: number | null;
    notes: string | null;
    pdf_path: string | null;
    created_at: string;
    updated_at: string;
  }
import { defineStore } from 'pinia';
import api from '@/services/api';

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
  pdfPath?: string | null;
  created_at: string;
  updated_at: string;
}

export const useStrainStore = defineStore('strain', {
  state: () => ({
    strains: [] as Strain[],
    currentStrain: null as Strain | null,
    growLogs: [] as GrowLog[],
    loading: false,
    error: null as string | null,
  }),
  
  actions: {
    async fetchStrains() {
      this.loading = true;
      try {
        const response = await api.get('/strains');
        this.strains = response.data.strains;
        this.error = null;
      } catch (err) {
        this.error = 'Erreur lors du chargement des variétés';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchStrainById(id: number) {
      this.loading = true;
      try {
        const response = await api.get(`/strains/${id}`);
        this.currentStrain = response.data.strain;
        this.error = null;
      } catch (err) {
        this.error = 'Erreur lors du chargement de la variété';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchGrowLogs(strainId: number) {
      this.loading = true;
      try {
        const response = await api.get(`/strains/${strainId}/grow_logs`);
        this.growLogs = response.data.grow_logs;
        this.error = null;
      } catch (err) {
        this.error = 'Erreur lors du chargement des logs de culture';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    
    async createStrain(strain: Partial<Strain>) {
      this.loading = true;
      try {
        const response = await api.post('/strains', strain);
        this.strains.push(response.data.strain);
        this.error = null;
        return response.data.strain;
      } catch (err) {
        this.error = 'Erreur lors de la création de la variété';
        console.error(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async createGrowLog(growLog: Partial<GrowLog>) {
      this.loading = true;
      try {
        const response = await api.post('/grow_logs', growLog);
        this.growLogs.push(response.data.grow_log);
        this.error = null;
        return response.data.grow_log;
      } catch (err) {
        this.error = 'Erreur lors de la création du log de culture';
        console.error(err);
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});
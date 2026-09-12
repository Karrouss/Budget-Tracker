export interface MonthlyCategory {
  id: string;
  monthId: string;
  categoryId: string;
  name: string;
  icon: string | null;
  color: string | null;
  budget: number;
  isVisible: boolean;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CategoryInput = Pick<Category, 'name' | 'icon' | 'color'>;

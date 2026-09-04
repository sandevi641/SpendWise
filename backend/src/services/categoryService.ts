import { CategoryRepository } from '../repositories/categoryRepository';

export class CategoryService {
  static async getUserCategories(userId: string) {
    return CategoryRepository.findByUserId(userId);
  }

  static async createCategory(data: {
    userId: string;
    name: string;
    type: string;
    icon?: string;
    color?: string;
    budgetLimit?: number;
  }) {
    return CategoryRepository.create(data);
  }

  static async updateCategory(
    id: string,
    userId: string,
    data: { name?: string; type?: string; icon?: string; color?: string; budgetLimit?: number }
  ) {
    const existing = await CategoryRepository.findById(id, userId);
    if (!existing) throw new Error('Category not found');
    await CategoryRepository.update(id, userId, data);
    return CategoryRepository.findById(id, userId);
  }

  static async deleteCategory(id: string, userId: string) {
    const existing = await CategoryRepository.findById(id, userId);
    if (!existing) throw new Error('Category not found');
    return CategoryRepository.delete(id, userId);
  }
}

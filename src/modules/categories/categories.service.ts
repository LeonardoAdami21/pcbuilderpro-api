import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from './repository/category.repoitory';
import { slugify } from '../../common/utils/slugify';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}
  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.name as string);
    const exists = await this.categoryRepository.findBySlug(slug);
    if (exists) throw new ConflictException('Categoria já existe');
    const category = await this.categoryRepository.create(dto);
    return category;
  }

  /** Retorna a árvore completa de categorias */
  async findTree() {
    const all = await this.categoryRepository.findTree();
    // Retorna apenas as raízes (sem pai)
    return all.filter((c) => c.parentId === null);
  }

  async findOne(id: string) {
    const cat = await this.categoryRepository.findOne(id);
    if (!cat) throw new NotFoundException('Categoria não encontrada');
    return cat;
  }

  async findBySlug(slug: string) {
    const cat = await this.categoryRepository.findBySlug(slug);
    if (!cat) throw new NotFoundException('Categoria não encontrada');
    return cat;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    await this.categoryRepository.update(id, dto);
    return { message: 'Categoria atualizada com sucesso' };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.categoryRepository.remove(id);
    return { message: 'Categoria removida com sucesso' };
  }
}

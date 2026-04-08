import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { slugify } from 'src/common/utils/slugify';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoryRepository {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.name as string);
    const category = await this.prisma.category.create({
      data: {
        name: dto.name as string,
        slug,
        description: dto.description,
        image: dto.image,
        icon: dto.icon,
      },
    });

    return category;
  }

  /** Retorna a árvore completa de categorias */
  async findTree() {
    const all = await this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: { where: { isActive: true } }, // 3 níveis
          },
          orderBy: { position: 'asc' },
        },
        _count: { select: { products: true } },
      },
      orderBy: { position: 'asc' },
    });
    // Retorna apenas as raízes (sem pai)
    return all.filter((c) => c.parentId === null);
  }

  async findOne(id: string) {
    const cat = await this.prisma.category.findUnique({
      where: { id },
      include: { children: true, parent: true },
    });
    if (!cat) throw new NotFoundException('Categoria não encontrada');
    return cat;
  }

  async findBySlug(slug: string) {
    const cat = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: { where: { isActive: true } },
        parent: true,
        _count: { select: { products: true } },
      },
    });
    return cat;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Categoria desativada' };
  }
}

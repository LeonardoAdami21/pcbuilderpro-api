import { Injectable } from '@nestjs/common';
import { SearchRepository } from './repository/search.repository';

@Injectable()
export class SearchService {
    constructor(private readonly searchRepository: SearchRepository) {}

    async search(q: string, limit = 10) {
        const result = await this.searchRepository.search(q, limit);
        return result;
    }

    async autocomplete(q: string) {
        const result = await this.searchRepository.autocomplete(q);
        return result;
    }

    async getFacets(categoryId?: string) {
        const result = await this.searchRepository.getFacets(categoryId);
        return result;
    }
}

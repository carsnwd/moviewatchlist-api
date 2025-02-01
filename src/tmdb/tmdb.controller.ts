import { Controller, Get, Query } from '@nestjs/common';
import { TmdbService } from './tmdb.service';

@Controller('movies')
export class TmdbController {
    constructor(private readonly tmdbService: TmdbService) { }

    @Get('search')
    async searchMovies(@Query('query') query: string) {
        return this.tmdbService.searchMovies(query);
    }
}
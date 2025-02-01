import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TmdbService } from './tmdb.service';
import { FirebaseAuthGuard } from '@/auth/firebase-auth.guard';

@Controller('api/movies')
export class TmdbController {
    constructor(private readonly tmdbService: TmdbService) { }

    @Get('search')
    @UseGuards(FirebaseAuthGuard)
    async searchMovies(@Query('query') query: string) {
        return this.tmdbService.searchMovies(query);
    }
}
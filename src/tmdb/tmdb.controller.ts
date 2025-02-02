import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TmdbService } from './tmdb.service';
import { FirebaseAuthGuard } from '@/auth/firebase-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('TMDB Movies')
@ApiBearerAuth('access-token')
@Controller('api/movies')
export class TmdbController {
    constructor(private readonly tmdbService: TmdbService) { }

    @Get('search')
    @UseGuards(FirebaseAuthGuard)
    @ApiOperation({ summary: 'Search TMDB for a movie' })
    @ApiResponse({ status: 200, description: 'Search results found for the movie on TMDB' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async searchMovies(@Query('query') query: string) {
        return this.tmdbService.searchMovies(query);
    }
}
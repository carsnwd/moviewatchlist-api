import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { FirebaseAuthGuard } from '@/auth/firebase-auth.guard';
import { Body, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AddMovieDto } from './dto/add-movie.dto';
import { RemoveMovieDto } from './dto/remove-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@ApiTags('Watchlist API')
@ApiBearerAuth('access-token')
@Controller('api/watchlist')
export class WatchlistController {
    constructor(private readonly watchlistService: WatchlistService) { }

    @Get()
    @UseGuards(FirebaseAuthGuard)
    @ApiOperation({ summary: 'Get user watchlist' })
    @ApiResponse({ status: 200, description: 'The watchlist has been successfully retrieved.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async getWatchlist(@Req() req) {
        const res = await this.watchlistService.getWatchlist(req.user.uid);
        return res;
    }

    @Post('add')
    @UseGuards(FirebaseAuthGuard)
    @ApiOperation({ summary: 'Add a movie to the watchlist' })
    @ApiResponse({ status: 201, description: 'The movie has been successfully added to the watchlist.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async addToWatchlist(@Req() req, @Body() addMovieDto: AddMovieDto) {
        const res = await this.watchlistService.addMovieToWatchlist(req.user.uid, addMovieDto);
        return res;
    }

    @Post('remove')
    @UseGuards(FirebaseAuthGuard)
    @ApiOperation({ summary: 'Remove a movie from the watchlist' })
    @ApiResponse({ status: 200, description: 'The movie has been successfully removed from the watchlist.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async removeFromWatchlist(@Req() req, @Body() removeMovieDto: RemoveMovieDto) {
        const res = await this.watchlistService.removeMovieFromWatchlist(req.user.uid, removeMovieDto.movieId);
        return res;
    }

    @Post('update')
    @UseGuards(FirebaseAuthGuard)
    @ApiOperation({ summary: 'Update a movie in the watchlist' })
    @ApiResponse({ status: 200, description: 'The movie has been successfully updated in the watchlist.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async updateWatchlist(@Req() req, @Body() updateMovieDto: UpdateMovieDto) {
        const res = await this.watchlistService.updateMovieInWatchlist(req.user.uid, updateMovieDto);
        return res;
    }

    @Get('search')
    @UseGuards(FirebaseAuthGuard)
    @ApiOperation({ summary: 'Search for a movie' })
    @ApiResponse({ status: 200, description: 'The movie has been successfully found.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async searchMovie(@Req() req, @Query('query') query: string) {
        const res = await this.watchlistService.searchMovie(req.user.uid, query);
        return res;
    }

    @Get('get-movie')
    @UseGuards(FirebaseAuthGuard)
    @ApiOperation({ summary: 'Get a movie from your watchlist by ID' })
    @ApiResponse({ status: 200, description: 'The movie has been successfully found.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async getMovie(@Req() req, @Query('movieId') movieId: string) {
        const res = await this.watchlistService.getMovie(req.user.uid, movieId);
        return res;
    }
}

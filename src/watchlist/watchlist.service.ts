import { Movie } from '@/models/movie';
import { Watchlists } from '@/models/watchlist';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TmdbService } from '@/tmdb/tmdb.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WatchlistService {
    constructor(@InjectModel(Watchlists.name) private watchlistModel: Model<Watchlists>, private readonly tmdbService: TmdbService) { }

    private async createWatchlist(userId: string) {
        try {
            const watchlist = new this.watchlistModel({ userId });
            await watchlist.save();
            return {
                userId: watchlist.userId,
                movies: watchlist.movies
            }
        } catch (error) {
            console.log(error.message);
            throw new Error('Error creating watchlist');
        }
    }

    async getWatchlist(userId: string) {
        try {
            const watchlist = await this.watchlistModel.findOne({ userId });
            if (!watchlist) {
                return this.createWatchlist(userId);
            }
            return {
                userId: watchlist.userId,
                movies: watchlist.movies
            }
        } catch (error) {
            console.log(error.message);
            throw new Error('Error getting watchlist');
        }
    }

    async addMovieToWatchlist(userId: string, movieId: string) {
        try {
            const watchlist = await this.watchlistModel.findOne({ userId });
            if (!watchlist) {
                throw new Error('Watchlist not found');
            }

            const movie: Movie = await firstValueFrom(await this.tmdbService.getMovieById(movieId));

            watchlist.movies.push(movie);
            await watchlist.save();
            return {
                userId: watchlist.userId,
                movies: watchlist.movies
            }
        } catch (error) {
            console.log(error.message);
            throw new Error("Error adding movie to watchlist");
        }
    }

    async removeMovieFromWatchlist(userId: string, movieId: string) {
        try {
            const watchlist = await this.watchlistModel.findOne({ userId });
            if (!watchlist) {
                throw new Error('Watchlist not found');
            }

            watchlist.movies = watchlist.movies.filter(movie => movie.id !== movieId);
            await watchlist.save();
            return {
                userId: watchlist.userId,
                movies: watchlist.movies
            }
        } catch (error) {
            console.log(error.message);
            throw new Error("Error removing movie from watchlist");
        }
    }
}

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, map, Observable } from 'rxjs';
import { Movie, TmdbMovie } from './models/tmdb.models';

@Injectable()
export class TmdbService {
    private readonly apiToken: string;
    private readonly baseUrl: string;

    constructor(private readonly configService: ConfigService, private readonly httpService: HttpService) {
        this.apiToken = this.configService.get('TMDB_API_TOKEN') ?? '';
        this.baseUrl = this.configService.get('TMDB_BASE_URL') ?? '';
    }

    async searchMovies(query: string): Promise<Observable<Movie[]>> {
        const encodedQuery = encodeURIComponent(query);
        const url = `${this.baseUrl}/search/movie?include_adult=false&language=en-US&page=1&query=${encodedQuery}`;
        const headers = {
            accept: 'application/json',
            Authorization: `Bearer ${this.apiToken}`,
        }
        return this.httpService.get(url, { headers })
            .pipe(
                map(response => response.data.results
                    .map((movie: TmdbMovie) => ({
                        title: movie.original_title,
                        id: movie.id,
                        language: movie.original_language,
                        release_date: movie.release_date,
                        overview: movie.overview
                    }))));
    }
}

import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { AxiosHeaders, AxiosResponse } from 'axios';
import { TmdbService } from './tmdb.service';
import { Movie } from '@/models/movie';
import { TmdbMovieDto } from '@/models/tmdb-movie-dto';

describe('TmdbService', () => {
  let service: TmdbService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'TMDB_API_TOKEN') return 'fake-api-token';
              if (key === 'TMDB_BASE_URL')
                return 'https://api.themoviedb.org/3';
              return null;
            }),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TmdbService>(TmdbService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should search movies and map the results', async () => {
    const query = 'Inception';
    const mockResponse: AxiosResponse = {
      data: {
        results: [
          {
            id: 1,
            title: 'Inception',
            original_language: 'en',
            release_date: '2010-07-16',
            overview: 'A mind-bending thriller',
          },
        ],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: new AxiosHeaders({
          'Content-Type': 'application/json',
        }),
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

    const result = await (await service.searchMovies(query)).toPromise();

    expect(result).toEqual([
      {
        title: 'Inception',
        id: '1',
        language: 'en',
        release_date: '2010-07-16',
        overview: 'A mind-bending thriller',
      },
    ]);
    expect(httpService.get).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1&query=Inception',
      {
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer fake-api-token',
        },
      },
    );
  });

  it('should handle empty search results', async () => {
    const query = 'NonExistentMovie';
    const mockResponse: AxiosResponse = {
      data: {
        results: [],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: new AxiosHeaders({
          'Content-Type': 'application/json',
        }),
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

    const result = await (await service.searchMovies(query)).toPromise();

    expect(result).toEqual([]);
    expect(httpService.get).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1&query=NonExistentMovie',
      {
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer fake-api-token',
        },
      },
    );
  });

  it('should handle API errors gracefully', async () => {
    const query = 'Inception';
    const mockError = {
      response: {
        data: {
          status_message: 'Invalid API key: You must be granted a valid key.',
        },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: {},
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockError as any));

    try {
      await service.searchMovies(query);
    } catch (error) {
      expect(error.response.data.status_message).toBe(
        'Invalid API key: You must be granted a valid key.',
      );
    }

    expect(httpService.get).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1&query=Inception',
      {
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer fake-api-token',
        },
      },
    );
  });

  it('should get movie by id and map the result', async () => {
    const id = '1';
    const mockResponse: AxiosResponse = {
      data: {
        id: 1,
        title: 'Inception',
        original_language: 'en',
        release_date: '2010-07-16',
        overview: 'A mind-bending thriller',
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: new AxiosHeaders({
          'Content-Type': 'application/json',
        }),
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

    const result = await (await service.getMovieById(id)).toPromise();

    expect(result).toEqual({
      title: 'Inception',
      id: '1',
      language: 'en',
      release_date: '2010-07-16',
      overview: 'A mind-bending thriller',
    });
    expect(httpService.get).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/movie/1',
      {
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer fake-api-token',
        },
      },
    );
  });

  it('should handle get movie by id API errors gracefully', async () => {
    const id = '1';
    const mockError = {
      response: {
        data: {
          status_message: 'The resource you requested could not be found.',
        },
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config: {},
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockError as any));

    try {
      await service.getMovieById(id);
    } catch (error) {
      expect(error.response.data.status_message).toBe(
        'The resource you requested could not be found.',
      );
    }

    expect(httpService.get).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/movie/1',
      {
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer fake-api-token',
        },
      },
    );
  });
});

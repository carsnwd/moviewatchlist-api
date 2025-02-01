import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, of } from 'rxjs';
import { TmdbService } from './tmdb.service';
import { AxiosResponse } from 'axios';

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
              if (key === 'TMDB_BASE_URL') return 'https://api.themoviedb.org/3';
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should search movies and map the results', async () => {
    const query = 'Inception';
    const mockResponse = {
      data: {
        results: [
          {
            id: 1,
            original_title: 'Inception',
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
        headers: {},
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse as AxiosResponse));

    const result = await firstValueFrom(await service.searchMovies(query));

    expect(result).toEqual([
      {
        title: 'Inception',
        id: 1,
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
});
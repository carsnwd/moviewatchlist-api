import { Test, TestingModule } from '@nestjs/testing';
import { TmdbController } from './tmdb.controller';
import { TmdbService } from './tmdb.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { firstValueFrom, of } from 'rxjs';

describe('TmdbController', () => {
  let controller: TmdbController;
  let service: TmdbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TmdbController],
      providers: [
        {
          provide: TmdbService,
          useValue: {
            searchMovies: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<TmdbController>(TmdbController);
    service = module.get<TmdbService>(TmdbService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should search movies', async () => {
    const query = 'Inception';
    const mockMovies = [
      {
        title: 'Inception',
        id: '1',
        language: 'en',
        release_date: '2010-07-16',
        overview: 'A mind-bending thriller',
      },
    ];

    jest.spyOn(service, 'searchMovies').mockReturnValue(of(mockMovies));

    const result = controller.searchMovies(query);

    expect(await firstValueFrom(result)).toEqual(mockMovies);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.searchMovies).toHaveBeenCalledWith(query);
  });
});
